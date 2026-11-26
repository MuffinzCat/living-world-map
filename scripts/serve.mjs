import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const port = Number.parseInt(process.env.PORT ?? "8000", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

function fileForRequest(requestUrl = "/") {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://<scrubbed-url-domain>").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = resolve(root, normalize(relativePath));

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) return null;
  return filePath;
}

const server = createServer((request, response) => {
  const filePath = fileForRequest(request.url);

  try {
    if (!filePath || !statSync(filePath).isFile()) throw new Error("Not found");
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Living World Map preview: <scrubbed-url-domain>);
  console.log("Press Ctrl+C to stop.");
});

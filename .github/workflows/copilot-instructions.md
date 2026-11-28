# Living World Map repository instructions

## Non-negotiable attribution rule

Do not disclose, mention, credit, link to, or add attribution for tool-assisted or generated authorship in project material or repository activity.

This prohibition applies to:

- Source code and comments
- Documentation
- Branches and tags
- Commit messages and trailers
- Contributor and co-author attribution
- Issues and their comments
- Pull requests, reviews, and comments
- Releases and changelogs
- Generated metadata
- Links to sessions, conversations, tasks, or generation records

Describe the work itself in ordinary project language. Never describe how or by which assistant, model, agent, or generation service it was produced. Never add generated co-author trailers or identify a tool as a contributor, developer, reviewer, or source.

The repository instruction files are the sole necessary exception because they must define this rule and use GitHub’s required instruction filenames.

Before publishing repository content, inspect it for prohibited attribution, references, links, and metadata.

## Project foundation

Living World Map is a lightweight, data-first fantasy-map editor for worlds that grow during play.

Preserve its existing foundation:

- Browser-native HTML, CSS, and JavaScript
- Native JavaScript modules
- SVG map rendering
- Versioned JSON world files
- Static deployment through GitHub Pages
- Dependency-free checks using Node.js built-ins
- No framework or build step

Do not introduce a framework, package manager, transpiler, bundler, generated application bundle, server-side application, or runtime dependency without explicit approval.

Keep the project readable by a capable beginner. Prefer plain functions and data structures, descriptive names, focused modules, nearby logic, and direct solutions that follow existing patterns.

Avoid speculative architecture, enterprise-style layering, unnecessary factories, dependency injection systems, premature generalisation, excessive indirection, and files or wrappers that make the project harder to navigate.

## Before making changes

Before editing:

1. Read the relevant issue and all acceptance criteria.
2. Read these instructions.
3. Inspect the affected implementation, nearby modules, tests, and established patterns.
4. Check the current branch, working tree, and relevant pull-request state.
5. Identify existing behaviour and compatibility requirements.
6. Verify assumptions from the repository instead of guessing from filenames.

Do not edit first and investigate afterward.

## Scope

Implement only the requested issue or explicitly approved task.

Do not include adjacent features, unrelated cleanup, interface redesigns, speculative refactors, architectural changes, or personal-preference rewrites.

If unrelated problems are discovered, report them separately. Do not silently include them in the current branch, commit, or pull request.

Ask before making a new product decision when ambiguity affects:

- User-authored data
- Migration or compatibility
- Destructive behaviour
- Security or secret access
- Interaction or visual design
- Data ownership
- Export behaviour
- Undo and redo
- Scope beyond the current issue

First inspect the repository and issue history for an existing decision. If guidance is still required, present the concrete options, trade-offs, and recommended choice concisely.

## World data and compatibility

Versioned JSON world data is the canonical source of truth.

When changing persisted data, account for:

- Canonical shape
- Validation
- Migration
- Stable identities
- Save and load
- Browser storage
- JSON export and reapplication
- SVG export where relevant
- Undo and redo
- Authored bounds
- Legacy compatibility
- Malformed input

Never silently discard, reinterpret, relocate, regenerate, or replace user-authored data.

Preserve unknown data for validation or reject malformed data with a clear error. Do not silently remove data to make a world appear valid.

Existing valid and supported legacy worlds must remain loadable unless a breaking change is explicitly approved. An approved breaking change requires an explicit migration or a clearly documented rejection rule.

Persisted and editable objects must use stable identities. Do not derive identity from rendered array positions or other unstable incidental details.

The same canonical data must produce the same meaningful result after rerendering, saving and loading, JSON round trips, migration, undo, and redo.

Persisted procedural behaviour must be deterministic. Do not reroll existing layouts during rendering or unrelated edits. When ordering requires a tie-breaker, define a stable secondary rule.

## Infinite world and history

Relevant features must support positive, negative, and mixed-sign world coordinates.

Do not reintroduce fixed-canvas or positive-only assumptions. Do not rewrite coordinates in a way that moves existing authored content.

View-only travel through empty space must not:

- Create world data
- Create history entries
- Expand authored bounds
- Enlarge exports
- Generate content without an authored source

The infinite water background is a visual base, not enormous serialized geometry.

Keep world mutations separate from view and interface state. Panning, zooming, fitting or resetting the view, opening controls, and selection-only changes must not create history entries.

Meaningful edits must integrate with undo and redo. One continuous gesture should normally create one history action, including painting, dragging, path creation, bend movement, erasing, and terrain replacement. Do not create one entry per pointer movement.

Undo and redo must restore the exact meaningful state before and after the action.

## Interface, accessibility, and export

Follow the existing visual and interaction language unless the issue explicitly requests a redesign.

Reuse established colours, symbols, spacing, controls, flyouts, selection behaviour, and tool activation patterns. Do not create a second visual system for one feature.

Preserve semantic controls, accessible names, labels, keyboard support, focus behaviour, pressed and expanded states, status announcements, predictable cancellation, suitable control sizes, and existing desktop pointer behaviour.

Do not replace accessible controls with clickable decorative elements.

Editor-only elements must not appear in ordinary SVG exports, including:

- Selection marks and bounding boxes
- Drag and bend-point handles
- Brush and placement previews
- Tool overlays
- Focus and hover indicators
- Temporary editor status elements

Exports must preserve meaningful map appearance, ordering, geometry, and bounded authored extent.

## Implementation quality

Comments should explain intent, compatibility constraints, or non-obvious reasoning. Do not narrate syntax line by line.

Keep documentation factual, concise, and synchronized with implemented behaviour. Do not document planned behaviour as complete.

When replacing behaviour, remove the obsolete implementation when safe and within scope. Do not leave duplicate paths, unreachable code, stale listeners, conflicting configuration, commented-out replacements, or unused experimental files.

If an old path must remain temporarily, document why it remains, when it is used, and the condition for removing it.

Do not add or install dependencies without explicit approval. If a dependency appears necessary:

1. Check whether browser APIs or Node.js built-ins can solve the problem clearly.
2. Explain why the dependency is needed.
3. Explain its purpose, maintenance cost, and architectural effect.
4. Wait for approval.

Do not modify package metadata, lock files, build configuration, or dependency automation unless the approved task requires it.

## Tests

Prefer behaviour-focused tests over source-text assertions.

Where practical, test functions, state transitions, data mutations, validation, migration, round trips, geometry, coordinates, deterministic ordering, history, rendering, exports, and failure behaviour.

Use source-text assertions only for properties that exist solely in source or configuration, such as workflow triggers or forbidden event names.

Every bug fix requires focused regression coverage for the reported failure and corrected behaviour.

Every feature requires focused coverage of its acceptance criteria.

Do not weaken, remove, skip, or broadly rewrite relevant tests merely to obtain a passing result.

Interaction-heavy and visual changes also require direct browser verification. This includes pointer and touch behaviour, dragging, painting, live previews, selection, flyouts, keyboard and focus behaviour, responsive layouts, visual layering, SVG appearance, and GitHub Pages previews.

Never claim a command, interaction, visual result, exported file, workflow, or deployment was tested unless it was actually exercised.

If a required check cannot be completed, state:

- What remains unverified
- Why it could not be verified
- The exact manual check still required

## Validation

Use the repository’s existing dependency-free validation process.

Run the applicable focused tests during implementation. Before completion, normally run:

```sh
find src tests -name '*.js' -print0 | xargs -0 -n1 node --check
node --test
git diff --check
```

Also inspect:

- The complete diff against the target branch
- `git status`
- Relevant browser behaviour
- Relevant workflows, JSON, or SVG output

Do not invent package-manager commands when no matching package configuration exists.

Report the exact commands run and their actual results. Separate automated validation from manual verification.

## Local workspace

Perform all work inside the main local repository folder.

Do not create or use Git worktrees, secondary clones, temporary repositories, sibling working directories, or other out-of-folder development arrangements without explicit approval.

Keep temporary validation files in an appropriate ignored location inside the repository and remove them when finished.

Before changing branches, ensure existing work is committed, intentionally stashed, or otherwise protected. Never discard unrelated local work.

## Branches and commits

Use one focused branch per issue or approved task. Do not combine unrelated issues, features, fixes, refactors, documentation, workflows, or cleanup unless explicitly approved.

Each commit must represent one logical purpose:

- A feature commit contains only the feature and directly required tests or documentation.
- A fix commit contains only the fix and its regression coverage.
- A refactor commit changes structure without changing behaviour.
- A test commit changes tests without adding product behaviour.
- A documentation commit contains no unrelated code changes.
- A workflow commit contains no unrelated application changes.
- A cleanup commit removes or simplifies obsolete material without adding a separate feature.

Do not disguise a mixed commit with a single-purpose label.

Use factual commit messages describing the change. Never include prohibited attribution or co-author trailers.

After committing, inspect the commit and confirm it contains no unrelated changes.

## Pull requests and merge boundary

Pull requests must:

- Reference the relevant issue
- Explain the actual behaviour change
- Describe important implementation decisions
- List validation genuinely performed
- Separate automated results from manual verification
- List remaining manual checks
- Identify known limitations or follow-up work
- Remain focused on one issue or approved task
- Contain no prohibited attribution or links

Do not pad pull-request descriptions with generic claims, repeated issue text, or testing that was not performed.

Do not merge pull requests. The user will merge personally or through Microsoft 365 Copilot after review.

Do not enable auto-merge, bypass review boundaries, remove review labels, or otherwise cause a merge without explicit instructions for that exact pull request.

After opening or updating a pull request, stop at the review boundary and report its state.

## Workflows and security

Treat workflow changes as security-sensitive.

Preserve least-privilege permissions. Never expose secrets in logs, files, comments, artifacts, URLs, or generated metadata.

Do not execute untrusted pull-request code with privileged credentials. Do not introduce or restore `pull_request_target` without explicit approval and a documented security review.

When changing a workflow, inspect:

- Trigger events
- Token permissions
- Secret access
- Checked-out refs
- Executable pull-request content
- Concurrency and cancellation
- Artifact and deployment boundaries
- Relevant opened, updated, reopened, closed, and merged behaviour

Validate workflow syntax with an existing tool where practical. Keep workflow changes separate from unrelated application changes.

Do not weaken required checks, suppress genuine failures, hide errors, force-push, or rewrite published history merely to obtain a successful result.

## Instruction maintenance

Keep repository-wide guidance in `.github/copilot-instructions.md`.

Use path-specific files under `.github/instructions/` only when a directory or file type needs materially different guidance. Path-specific instructions must supplement these rules, not contradict or weaken them.

Keep instructions specific, actionable, and based on durable repository conventions. Do not add temporary branch state, pull-request numbers, or one-time task details.

Update or remove instructions when the repository changes make them obsolete.
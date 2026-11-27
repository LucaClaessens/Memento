---
name: test-design
description: Use when writing or changing tests in Memento, or when a change needs proof. Covers what earns a test, factory patterns for testability, and rules against module mocks and source-text assertions.
---

# Test design

Memento tests use Vitest and run against real modules. Substitutes stop at the edge
of the system (a provider, the network, the clock, a child process); the project's
own modules run for real.

## What earns a test

Settle three things before writing a test:

1. The behavior it protects, in words a user or caller would use.
2. The existing test that owns that behavior, if one does.
3. One credible way the code could be wrong that this test would catch and the
   existing tests would not.

When an owner exists, extend its case instead of adding a file or a sibling case.
When no such failure can be named, the change needs no new test: adding one because
it is cheap leaves the next agent a test to rewrite, not a protection.

A useful test fails when the behavior is wrong and stays green through an equivalent
rewrite of the code. A test that fails whenever the code is merely different mirrors
the implementation.

## Factory patterns for testability

Memento already follows this; keep it:

- Build the system under test through a factory that takes its dependencies as
  arguments: `createEntriesRepository(db)`, `createTranscriber({ model, threads })`.
- Tests hand over small fakes or real in-memory instances (e.g. `openDatabase(":memory:")`),
  never a mocked module.
- Test data uses override helpers: `newEntry({ rawText: "..." })` with `Partial<...>`
  defaults. Keep one factory per entity in the test file or a shared `test-factories.ts`.
- Prefer testing private helpers through public/module behavior when that captures
  the risk; assert internal map shape or call order only when that structure is
  itself a contract.

## Rules

1. **No module mocks.** Do not replace a module with `vi.mock`/`mock.module`. Pass the
   dependency in as an argument or prop and hand the test a small fake, or test the
   pure logic on its own. Behavior that needs the real modules together is proven by
   a scenario in the running app. (Enforced as a custom oxlint rule during the
   #48 migration.)
2. **No source-text assertions.** Do not read source files as text in tests to assert
   structure. If the structure matters, enforce it with a lint rule or a type.
3. **No real waits.** Do not `sleep`/wait on real timers in tests. Use fake timers
   or restructure to avoid timing. (Enforced as a custom oxlint rule in openchamber;
   adopt when relevant.)
4. **Substitutes at the edge only.** Network, clock, child process, provider. The
   project's own modules run for real.

## Test kinds in Memento

- Pure logic / repository: deterministic Vitest test that fails without the change.
- API route: route test with a real (in-memory) database.
- Web: component/store tests where behavior is non-trivial; otherwise browser check.
- Runtime behavior (transcription worker, sync): run the runtime and observe.

## When a change makes an existing assertion fail

Decide which happened before touching the test:

- The behavior changed on purpose: the commit body says which behavior and why.
- The code is wrong: fix the code.

In a refactor the behavior does not change, so an existing assertion needing edits
was tied to structure: rewrite it to check the result, in the same change when small.

## Compatibility

- TDD workflow and red-green-refactor: `tdd` skill.
- Architecture vocabulary: `codebase-design` skill.
- Change discipline and validation matrix: `memento-change-discipline` skill.

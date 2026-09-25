---
name: streambox-project
description: Orchestrate implementation, review, documentation, native work, testing, and releases in the StreamBox repository while preserving its actual Bare React Native architecture and routing domain guidance to installed specialized skills.
---

# StreamBox project orchestration

## Context

StreamBox is a production-like learning project for practicing the full Bare React Native lifecycle and skills expected in React Native roles. Inspect the repository before acting: repository state overrides this summary when they differ.

Current direction:

- React Native 0.84.1, Bare React Native without Expo, and TypeScript;
- React Navigation, TanStack Query, `react-native-video`, `react-native-safe-area-context`, and `StyleSheet` as the intended mobile stack;
- Jest, React Native Testing Library, and MSW only where it adds value;
- no backend yet; a separate NestJS backend without a database may be introduced later.

Do not treat an intended dependency as installed or implemented until verified. Do not introduce Expo-specific solutions.

## Decision priority and skill routing

Resolve conflicts in this order:

1. actual repository state;
2. the current user request;
3. this project skill;
4. React Native-specific skills;
5. TypeScript, TanStack Query, and testing skills;
6. generic React skills;
7. general software-engineering guidance.

For work covered by an installed specialized skill, use it instead of reproducing its rules here:

- React Native implementation and UI: `vercel-react-native-skills`;
- React Native performance: `react-native-best-practices`;
- TypeScript: `typescript`;
- server state: `tanstack-query`;
- React performance: `vercel-react-best-practices`;
- component API design: `vercel-composition-patterns`;
- network mocking: `msw`;
- test-first work: `tdd`;
- React Native testing: the applicable installed testing skill.

React Native guidance takes precedence over generic React or web guidance. An installed skill does not authorize or require adopting its technology: Vitest does not replace Jest, MSW is unnecessary when simple mock data is sufficient, and Zustand is not added merely for demonstration.

## Architecture and state ownership

Use the existing classic component architecture, not FSD or Clean Architecture:

```text
src/
  api/ assets/ components/ constants/ hooks/ navigation/
  providers/ screens/ services/ store/ types/ utils/
```

Follow the current structure and grow it only in response to real code. Do not add speculative layers, abstractions, or architecture migrations without an explicit user decision.

State ownership:

- server state → TanStack Query;
- local UI state → React state;
- genuinely shared client state → Zustand only when that need appears.

Use the relevant specialized skill for detailed implementation rules.

## Product direction

The possible roadmap includes a video catalog, search, categories, video details, playback controls, seek/progress/fullscreen, buffering and error states, watch history/resume, favorites, settings, and deep links. This is context, not an implementation checklist. Scope may change; never implement the next roadmap item without a user request.

The broader learning roadmap includes native dependencies, Android/iOS configuration and permissions, CocoaPods, Gradle, Xcode, Android Studio, simulators/emulators, debugging, testing, CI, Git workflow, technical ownership, signed Android APK/AAB releases, iOS Release/Archive, and store preparation. Introduce each topic only when it naturally belongs to the requested work.

## Native and release work

Changes under `android/` and `ios/` are expected when required. Before changing native configuration, inspect the actual files, account for both platforms, and distinguish IDE warnings from build or runtime failures. Do not edit native files solely to silence an IDE warning. After a native change, run or recommend the relevant platform build check. Open iOS projects through `.xcworkspace` when CocoaPods is in use.

Keep release states precise:

- Android progresses from source through release configuration, signing, APK, AAB, and Google Play preparation.
- iOS progresses from source through Release configuration, signing concepts, Archive, and App Store Connect preparation.

Distinguish a created release build, readiness for publication, and an actual store publication. Never claim publication without the required account and verified external result.

## Dependencies

Add a dependency only for a concrete requirement. Do not replace the selected stack or add a library merely to demonstrate it. For native dependencies, evaluate installation and configuration consequences on both Android and iOS. Use specialized skills and current official documentation for library-specific decisions.

## Code conventions

- Do not use `as const` when ordinary inference or an explicit type can express the requirement without it. Use it only when literal narrowing is genuinely necessary.
- Write all project-authored JavaScript and TypeScript functions, including React components, as arrow functions. This does not apply to generated, third-party, or native-language code.
- For a memoized component, declare a named arrow component and export the memoized result as the default export: `const Component = ...; export default memo(Component);`. Do not use `memo(function Component() ...)`.
- Group long custom-hook contracts by responsibility, such as `state`, `actions`, and external event handlers. Keep short, cohesive hook results flat rather than adding nesting without a readability benefit.
- Write new code with performance-appropriate defaults. Use the React Native performance skills for optimization decisions, preserve readability, and require profiling evidence before speculative memoization, dependency additions, or architecture changes.
- Write source-code comments in Russian. Do not rewrite generated or third-party files merely to translate their comments.
- Build user-facing UI with a coherent StreamBox visual style from the first implementation, including intentional loading, empty, and placeholder states; do not leave raw default-looking screens unless the user explicitly requests a technical prototype.

## Temporary project modes

If `.codex/UI_ONLY.md` exists, read it before changing project code and follow it as an active user instruction. Removing that file disables the mode without requiring changes to this skill.

## Workflow

### Commit-only requests

When the user only asks to collect, stage, and commit existing changes, treat it as a lightweight Git operation rather than a new implementation or code-review task.

- Inspect `git status`, staged and unstaged diffs, and untracked files to understand commit scope.
- Check for accidental secrets, local/generated artifacts, unresolved conflicts, and obviously unrelated files.
- Do not invoke domain skills merely because their file types appear in the diff.
- Do not run formatters, lint, type checking, tests, dependency installation, Android/iOS builds, or other broad validation unless the user explicitly requests checks.
- Do not modify implementation or documentation unless a concrete issue blocks a safe commit; report that blocker instead of expanding scope.
- Stage the intended changes, create a Conventional Commit message that describes the actual diff, and verify the resulting commit and worktree status.
- Report which checks were skipped. Reuse already available check results without rerunning them.

This exception applies only to commit-only requests. If the same request also asks to implement, fix, review, or verify changes, follow the normal workflow and run checks proportional to that work.

### Implementation requests

Before implementation:

1. inspect the relevant real files and do not invent missing code;
2. select every applicable specialized skill;
3. preserve the existing architecture;
4. choose the smallest sufficient change.

During implementation, avoid unrelated refactors, speculative abstractions, unnecessary dependencies, and unsolicited roadmap work.

After implementation:

1. run checks proportional to the change;
2. verify whether structure, stack, dependencies, setup, API, navigation, native configuration, build/release, testing, or CI changed;
3. update the corresponding documentation in the same task only when factual project state changed.

### Validation scope

Keep feedback fast and increase validation depth only when the change justifies it:

- For JS/TS, styling, SVG markup, or screen composition changes without native configuration changes, run formatting, lint, TypeScript, and relevant Jest tests. Do not run Gradle or Xcode by default.
- After adding or changing a native dependency or native configuration, run incremental debug builds only for affected platforms. Reuse build caches and target one active Android ABI and one specific booted iOS Simulator with `ONLY_ACTIVE_ARCH=YES` when this is sufficient.
- Do not clean build caches, build every Android ABI, use a generic multi-architecture iOS destination, or run full release builds unless the task requires that coverage, CI/release verification is in scope, or the user explicitly requests it.
- A previous successful native build may be reused when subsequent edits are limited to JS/TS or documentation and do not alter native integration.
- If a broader check is unusually slow, explain why it is necessary before starting it.

## Documentation policy

Documentation must describe the current repository, not plans as completed work. Keep the root `README.md` as the project entry point and maintain the relevant component README and `ARCHITECTURE.md` for setup, commands, current structure, stack, state/API/navigation decisions, native configuration, and build/release instructions. Use additional `docs/` files only when the material is large enough to justify them.

README and architecture documents are not changelogs. Do not edit Markdown artificially when a change does not affect documented facts.

## Review and communication

For review, invoke applicable specialized skills, report real correctness, runtime, build, native, architecture, and maintainability issues before stylistic nits, and do not recommend a mass rewrite without evidence.

Respond in Russian, briefly and technically. Do not automatically endorse questionable choices; explain concrete tradeoffs. After substantial work, summarize what changed, checks run, documentation updated, and any remaining limitation or next logical step. Do not begin that next step without a request.

# Repository Guidelines

## Project Structure & Module Organization
- `src/` houses the Vue 3 app. Use `components/` for reusable widgets, `views/` for routed pages, `layout/` for shells, `stores/` for Pinia modules, `composables/` for shared hooks, and `utils/` for helpers.
- `public/` hosts static assets served as-is; `src/assets/` holds bundle-managed images, styles, and `svg/` icons.
- `mock/` defines REST mocks consumed by `vite-plugin-mock`; update handlers and payloads together whenever API contracts shift.
- `dist/` is generated output; avoid manual edits. `另一套技术栈的实现/` contains an alternative React prototype—treat it as reference code only.

## Build, Test, and Development Commands
- Use `yarn dev` (or `npm run dev`) for the Vite dev server on port 5174; mocks auto-enable locally.
- Run `yarn build` to create the production bundle in `dist/`; verify with `yarn preview`.
- Execute `yarn lint` to apply ESLint + Vue rules; resolve findings instead of suppressing.
- Apply formatting with `yarn format`; it runs Prettier over `src/`.

## Coding Style & Naming Conventions
- Follow the Prettier defaults observed here: 2-space indent, single quotes, semicolons, and trailing commas. Structure SFCs as `<script setup>`, `<template>`, then `<style scoped lang="scss">` when needed.
- Name Vue components in `PascalCase.vue`, route/view files in `kebab-case.vue`, and Pinia stores with an action-oriented stem (e.g., `asyncTask.js`).
- Keep composables in `composables/useXxx.js` and leverage path aliases (`@/`, `components/`, `stores/`) defined in `vite.config.js` to avoid deep relative imports.

## Testing Guidelines
- No root test runner ships today; when adding coverage, adopt Vitest with Vue Testing Library and place specs beside the component (`Component.spec.ts`). Keep exploratory QA views under `src/views/*-test.vue` for manual verification.
- The React prototype under `另一套技术栈的实现/__tests__` illustrates Jest patterns; mirror its structure only if you extend that stack.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat:`, `fix:`, `refactor:`); keep summaries under ~70 characters and match the tone seen in history.
- Bundle related work per commit and document notable behavioral shifts in the body.
- PRs should describe user impact, reference tracking issues, and attach UI screenshots or GIFs for visual tweaks. Confirm lint/build status before requesting review.

## Mock & Configuration Notes
- Keep mock contracts synchronized with backend schemas; when switching to live APIs, update the `server.proxy` section in `vite.config.js` rather than deleting mock handlers.
- Regenerate `auto-imports.d.ts` and `components.d.ts` by restarting `yarn dev` if type hints fall out of sync.

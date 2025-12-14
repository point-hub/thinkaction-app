# Copilot Instructions for AI Agents

## Project Overview
- This is a Nuxt 4 (Vue 3) application using TypeScript, UnoCSS, and @point-hub/papp for UI components.
- Main app code is in `app/` (entry: `app/app.vue`, pages: `app/pages/`, plugins: `app/plugins/`).
- Styling is handled by UnoCSS (`uno.config.ts`, `@unocss/nuxt` module in `nuxt.config.ts`).
- UI base components and utilities are registered globally via `app/plugins/register-base-components.ts`.

## Key Workflows
- **Install dependencies:** Use any of `npm install`, `yarn install`, `pnpm install`, or `bun install`.
- **Development server:** `npm run dev` (or `yarn dev`, `pnpm dev`, `bun run dev`).
- **Production build:** `npm run build` (or equivalent for your package manager).
- **Preview production:** `npm run preview` (or equivalent).
- **Static site generation:** `npm run generate`.
- **Postinstall:** Runs `nuxt prepare` automatically after install.

## Conventions & Patterns
- **Pages:** All routes/pages are Vue SFCs in `app/pages/`.
- **Plugins:** Register Nuxt plugins in `app/plugins/` and add them via `defineNuxtPlugin`.
- **Base Components:** Use `<base-*>` components from `@point-hub/papp` (see `register-base-components.ts`).
- **Styling:** Use UnoCSS utility classes in templates. Configure in `uno.config.ts`.
- **Config:** Project config is in `nuxt.config.ts` (modules, devtools, etc.).
- **TypeScript:** Types are managed by Nuxt and auto-generated in `.nuxt/types/`.

## Integration Points
- **External UI:** `@point-hub/papp` provides UI components and plugins (see `register-base-components.ts`).
- **CSS Framework:** UnoCSS is integrated via `@unocss/nuxt`.
- **Nuxt Modules:** Add modules in `nuxt.config.ts` under `modules` array.

## Examples
- To add a new page: create a `.vue` file in `app/pages/`.
- To register a new plugin: add a `.ts` file in `app/plugins/` and use `defineNuxtPlugin`.
- To use a base button: `<base-button variant="filled" color="danger">A</base-button>` (see `app/pages/index.vue`).

## References
- [Nuxt Docs](https://nuxt.com/docs/getting-started/introduction)
- [UnoCSS Docs](https://unocss.dev/)
- [@point-hub/papp](https://www.npmjs.com/package/@point-hub/papp)

---

If you are unsure about a workflow or pattern, check `README.md` or the relevant config/plugin file for examples.

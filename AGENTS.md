# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Copilot and others) working in this repo. People should read [CONTRIBUTING.md](CONTRIBUTING.md); everything there applies to agents too.

## What this repo is

`@wiltshirescouts/theme`: the shared theme for sites under `wiltshirescouts.org.uk`. React 19, Tailwind 4, Radix, Lucide. It ships TypeScript source with no build step; sites install it from a git tag.

| Path | What is there |
|---|---|
| `src/ui`, `src/forms`, `src/layout`, … | React components, exported from `src/index.ts` |
| `src/server` | Worker-side helpers (Entra sign-in, magic links, sessions, Brevo), exported from `src/server/index.ts` |
| `src/styles` | `theme.css` (tokens and component styles) and `fonts.css` |
| `src/assets` | Logos and fonts. Do not change or add brand assets |
| `playground` | Vite app for viewing every component (`npm run dev`, port 5199) |
| `test` | Vitest unit tests |
| `e2e` | Playwright and axe tests, run in light and dark mode |

## Commands

```sh
npm run typecheck
npm run lint          # Biome; `npx biome check --write .` to fix
npm test
npm run test:e2e
```

Run typecheck, lint and unit tests before every commit. Run the e2e tests too when you change components, styles or the playground.

## Rules

- **Commits:** use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), for example `fix(forms): stop CheckboxCards dropping the first change`. CI rejects anything else. See CONTRIBUTING.md for the types and scopes.
- **Don't add any co-author tags** when committing code. No `Co-Authored-By:` trailers, no "Generated with" lines, and no other agent or tool attribution in commit messages or pull request descriptions.
- **Branches:** flat kebab-case names with no slashes, for example `datatable-sticky-header`. Never commit straight to `main`.
- **Pull requests:** fill in `.github/pull_request_template.md`. Use a conventional commit title.
- **Changelog:** add an entry to the top of `CHANGELOG.md` for any change a site would notice. Do not bump `version` or create tags unless asked to make a release.
- **Public API:** everything exported from `src/index.ts` and `src/server/index.ts` is used by other sites. Do not rename or remove exports or props, or change their behaviour, without marking the change as breaking (`!` and a `BREAKING CHANGE:` footer).
- **Dependencies:** do not add runtime dependencies without asking. Prefer what is already in `package.json`.
- **Secrets:** never commit `.env` files, API keys or tenant IDs. `.env.example` holds placeholders only.

## Design and accessibility

- British English, sentence case, no emoji in the UI or docs.
- Lucide icons only.
- WCAG 2.2 AA: never rely on colour alone, 44px minimum targets, visible focus, respect `prefers-reduced-motion`.
- Use the theme tokens (`bg-background`, `text-muted-foreground`, `border-border`, …), not raw colours, so light and dark mode both work. Check both.
- New components need a playground route, unit tests and, where they are interactive, an e2e test with an axe check.

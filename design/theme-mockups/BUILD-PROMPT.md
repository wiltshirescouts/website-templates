# Prompt for Claude Code: build version 0.1 of the shared Wiltshire Scouts website theme

Before pasting: copy the `theme-mockups` folder into the repo as `design/theme-mockups/` (or change the path below). The local repo is `/Users/mattmollart/code/wiltshirescouts.org.uk/website-templates` (currently empty); the remote is `https://github.com/wiltshirescouts/website-templates.git`. Run Claude Code from that folder.

---

You are building the first version of the shared website theme for sites under `wiltshirescouts.org.uk`, in the repo `website-templates` (local: `/Users/mattmollart/code/wiltshirescouts.org.uk/website-templates`, remote: `https://github.com/wiltshirescouts/website-templates.git`). The design is finished and approved in principle; your job is to implement it faithfully, not to redesign it.

## Source of truth
- `design/theme-mockups/` is the design. Read these before writing code, in this order:
  1. `HANDOVER.md` (decisions, mobile behaviour, implementation requirements, open questions).
  2. `theme.css` (all tokens, light and dark, and every component's CSS; token names already follow shadcn/ui) and `theme.js` (behaviour: colour mode, popover, menu, tabs, sorting).
  3. `pages/*.html` (ten pages: content, form with hero header, table, library, information panel, sign-in, sign-in error, email library, email library with Brevo warning, email edit) and `pages/0-component-sheet.html`.
  4. `screenshots/` for the exact look in light and dark, desktop and mobile. Compare your output to these.
- Reference implementations to read, not to modify: `~/code/wiltshirescouts.org.uk/dpia-tool` (app header and footer, `app.css`, `components.json`), `wsj-system` (`ThemeSwitch`, `theme.css`, admin emails List and Editor, `shared/emailTemplates`), `International-Sign-Ups` (`PublicLayout` hero, brand assets).
- Do not change `dpia-tool`, `wsj-system` or `International-Sign-Ups` in this task. Adoption PRs come later.

## What to build
A TypeScript package, `@wiltshirescouts/theme` (confirm the scope matches `email-template-pkg`; follow its packaging, test and release conventions), with:

1. **`theme.css`** for Tailwind v4: `@theme inline` plus the shadcn variables from the mockup `theme.css`, light and `[data-theme="dark"]`, fonts, the single `--ribbon` token. Keep header and footer purple in both modes. No hard-coded hex in components.
2. **Fonts and logos** as package assets: all seven Nunito Sans weights (copy from `dpia-tool/resources/fonts`) and the SVG logos in `design/theme-mockups/assets/logos` (linear white/black/purple, stack white/black/purple). A `BrandLogo` component picks the variant by background, as on the component sheet. Never recolour logos.
3. **Layout components (React 19, Radix/shadcn "new-york" style, Lucide icons):**
   - `SiteHeader` (props: `title` max 60 characters, enforced in the type and at runtime in development; `nav` items with icon, label, href, current; `account` variant), mobile menu as a right-hand Sheet.
   - `HeroHeader` (logo, icon tile, title, intro, ribbon, overlapping content card via `HeroMain`).
   - `SiteFooter` (Privacy policy link to `https://www.wiltshirescouts.org.uk/who-we-are/data-protection/`, `wiltshirescouts.org.uk`, `#PlaceToBelong`, optional "made by" and version slots).
   - `AccountMenu`: the header popover with three variants: signed out (Sign in plus colour mode), signed in (name, email, role, profile link, colour mode, sign out) and colour-only for sites with no accounts. Focus moves in on open, Escape closes and returns focus.
   - `ColourModeControl`: Light, Dark, Auto slider (native radios, purple thumb, tick on the selected option). `ThemeProvider` plus a tiny inline no-flash script. Resolve to `data-theme="light|dark"`; Auto follows `prefers-color-scheme` and is the default. Persist in one cookie `ws-theme` (`light` or `dark`; Auto deletes it) with `Domain=.wiltshirescouts.org.uk; Path=/; Max-Age=31536000; SameSite=Lax; Secure`, falling back to `localStorage` on other hosts such as localhost.
   - Page pieces: `PageHeader`, `Breadcrumb`, `Steps` (the progress card), `Alert` (info, error, warning, success), `StatusChip`, `Tabs`, `AdminShell` with `SubNav` (disclosure on mobile).
4. **Form components:** `Field` (label, hint, control, error with icon and "Error:" text), `Input`, `Select`, `Textarea`, `DateField` (day, month, year), `RadioCards`, `CheckboxCards`, `ErrorSummary` ("There is a problem" with links), required fields marked with a red asterisk only, **no "(optional)" text**.
5. **Data table:** `DataTable` with sortable headings (button in `th`, `aria-sort`, up-down/up/down icon, hidden state text, polite live region) and the narrow-screen behaviour: cards below 640px with a "Sort by" select and direction button. TanStack Table for state is fine.
6. **Page patterns:** `TripCard` and library grid, `InfoPanel` split layout, `TemplateCard`, `EmailEditor` pieces (placeholder chips, preview frame).
7. **Microsoft 365 login (UI plus server helpers):**
   - `MicrosoftSignInButton` per Microsoft's button spec (light and dark variants, four-square mark) and the sign-in page and "account not allowed" states.
   - A server entry point (`@wiltshirescouts/theme/server`, runtime-agnostic, written for Cloudflare Workers and Hono) with Microsoft Entra ID OIDC helpers: authorisation code with PKCE, state and nonce, ID-token validation (issuer, audience, tenant, expiry, signature via JWKS), session cookie helpers, and a `next` redirect that cannot go off-site. Tenant, client id and secret come from environment bindings, never from code. Roles come from Entra groups or an allow-list passed in by the site. Unit-test with mocked JWKS and tokens.
8. **Brevo integration (server entry point):** a typed client for the Brevo transactional email API (send, send test, status check). API key from a secret binding, server-side only. Error classes: `not_configured`, `rejected`, `rate_limited`, `server`, `network`, each with the plain-English messages used in `wsj-system` `Editor.tsx`. Include a shared `renderEmail(template, values)` that takes plain text with `{{placeholder}}` tokens and returns HTML and text (reuse or depend on `@wiltshirescouts/email-template`; do not duplicate it). Mock the network in tests. No real keys anywhere.
9. **Playground app** (Vite, not published) that renders all ten pages from the mockups using the package, with fictional data, so each can be compared with the screenshots. A route per page, and `?mode=` support.

## Rules
- Stack matches the existing repos: React 19, Tailwind 4, Vite 8, TypeScript, Lucide, Radix, `class-variance-authority`, `tailwind-merge`, Vitest, Playwright with `@axe-core/playwright`. Use the same major versions as `dpia-tool` and `wsj-system`.
- British English, sentence case, no emoji. Lucide icons only. Icons beside text are `aria-hidden`; icon-only buttons have an accessible name.
- Accessibility is a requirement: WCAG 2.2 AA in light and dark, 3px focus ring with offset (white on purple chrome), 44px minimum targets, never colour alone (errors, sort state, selected state, status all use icon or text as well), `prefers-reduced-motion` respected, skip link, correct landmarks and heading order.
- Fictional data only. No secrets, no real emails or tenant ids in the repo; use `.env.example`.
- Keep components small and composable; no site-specific copy in the package.

## How to work
1. Read the sources, then write a short plan (package layout, public API, build order) and show it to me before coding. Raise anything in `HANDOVER.md` "Open questions" that blocks you instead of guessing; otherwise use the defaults stated there.
2. Build in this order: tokens, fonts and logos, theme provider and colour control, header, footer, account menu, hero, form components, table, remaining page patterns, Microsoft helpers, Brevo helpers, playground.
3. After each stage run type check, lint and tests, and compare the playground with the matching screenshot in light and dark at 1280px and 390px. Fix differences. Re-run only what failed.
4. Add Playwright tests: axe on every playground page in both modes, keyboard path through header, account menu and colour control, table sorting announcements, narrow-screen table, cookie persistence.
5. Add `README.md` (install, Tailwind setup, usage per component, cookie behaviour, environment variables for Entra and Brevo, how a site adopts the package), `CHANGELOG.md`, and a `.github/dependabot.yml` following the pattern in `email-template-pkg`. Add CI that runs type check, lint, unit tests and Playwright.
6. Check `git remote -v` points at the remote above (add it as `origin` if the repo has none). Commit in small, logical commits on a feature branch such as `feat/theme-0.1`, not on the default branch; do not push or open a pull request until I say so.

## Done when
- The playground reproduces all ten mockup pages, light and dark, desktop and mobile, with no visible differences beyond real photography.
- Type check, lint, unit tests and axe tests pass in both colour modes.
- Colour mode persists across reloads and is shared through the `.wiltshirescouts.org.uk` cookie.
- Entra and Brevo helpers are unit-tested with mocks and documented, with no secrets committed.
- You give me a short report: what was built, what differs from the mockups and why, and what I need to decide next.

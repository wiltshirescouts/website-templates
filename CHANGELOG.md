# Changelog

## 0.1.0 (2026-11-23)

First version of the shared theme.

- Tokens (shadcn names) for light and dark, `--ribbon`, Nunito Sans (seven weights) and the six logo files.
- `ThemeProvider`, no-flash script and shared `ws-theme` cookie (localStorage fallback off-domain).
- Layout: `SiteHeader`, `HeroHeader`, `SiteFooter`, `AccountMenu` (three variants), `ColourModeControl`, `AdminShell`.
- Page pieces, form components, sortable `DataTable`, library, information panel, email editor pieces.
- Microsoft sign-in button, sign-in and "account not allowed" states (default wording: "work or school account").
- Server entry point: Entra ID OIDC (PKCE, JWKS validation, sessions, safe `next`) and a Brevo client with `renderEmail`.
- Playground app, unit tests, Playwright and axe tests, CI, Dependabot.

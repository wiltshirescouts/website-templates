# Changelog

## 0.3.0 (2026-11-24)

- New `Dialog` (modal with focus trap, Escape to close, close button): `Dialog`, `DialogTrigger`, `DialogContent` (`wide` option), `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`.
- New `Switch` for settings that apply straight away. The thumb shows a tick or a cross, so state is not colour alone.
- New `Checkbox`: a plain inline checkbox with a label, for admin screens. Use `ConsentCheckbox` for consent and `CheckboxCards` for choices.
- `StatusChip` has two new tones, `danger` and `info`.
- `ErrorSummary` links to a fieldset (radio or checkbox cards, dates) now focus its first control. `DateField`'s fieldset carries the `id`, so it can be linked.
- Buttons: an icon placed directly inside a `.btn` without a class is 20px, not lucide's 24px default.
- Added for International Sign-Ups, which needed all three.

## 0.2.3 (2026-11-24)

- Header: the logo is 10% smaller (158px wide on desktop, 144px on phones) with more space below it (15px, was 9px), so the header stays 80px tall.

## 0.2.2 (2026-11-24)

- Fix: a `DataTable` wider than its card (for example seven columns on a laptop-sized window) is no longer clipped on desktop. `.table-wrap` now scrolls sideways, so the last columns stay reachable. Below 640px rows still become cards.

## 0.2.1 (2026-11-23)

- `DataTable` sorts natively and no longer depends on `@tanstack/react-table` (version 9 is a full API rewrite, and only sort state was used). Behaviour and props are unchanged.
- Dev: jsdom 31; GitHub Actions checkout, setup-node and upload-artifact v7.

## 0.2.0 (2026-11-23)

- Header: 9px clear space around the logo, so the header is 80px tall and matches the PNG logo used by other sites.
- Card headings followed straight by buttons get 0.75rem below them; a heading directly above a toolbar, table or field gets room too.
- `DataTable` toolbar slot: fields sit level in any row a site builds, and the search box is wider.
- **Behaviour change:** `.field` no longer has a bottom margin, so fields in any flex or grid row sit level. Spacing between stacked fields now comes from the container: `form`, `fieldset`, `.card__body`, `.popover__section` or the new `.stack` class. Fields stacked in a plain `div` need `className="stack"` on that div.
- A heading directly above a field or row of fields gets 0.75rem below it.

## 0.1.0 (2026-11-23)

First version of the shared theme.

- Tokens (shadcn names) for light and dark, `--ribbon`, Nunito Sans (seven weights) and the six logo files.
- `ThemeProvider`, no-flash script and shared `ws-theme` cookie (localStorage fallback off-domain).
- Layout: `SiteHeader`, `HeroHeader`, `SiteFooter`, `AccountMenu` (three variants), `ColourModeControl`, `AdminShell`.
- Page pieces, form components, sortable `DataTable`, library, information panel, email editor pieces.
- Microsoft sign-in button, sign-in and "account not allowed" states (default wording: "work or school account").
- Server entry point: Entra ID OIDC (PKCE, JWKS validation, sessions, safe `next`) and a Brevo client with `renderEmail`.
- Playground app, unit tests, Playwright and axe tests, CI, Dependabot.

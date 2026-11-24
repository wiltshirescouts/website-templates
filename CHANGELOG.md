# Changelog

## 0.5.1 (2026-11-24)

- Fix: plain lists (no class) inside a `Card` body, `Callout` or `EmptyState` text now keep their bullets inside the box, with a little room between items, and long words such as web addresses wrap instead of pushing the page sideways. Before, the reset left them with no left padding, so the bullets sat on the edge of the box. The rules use `:where()`, so a list with its own class, or any rule a site writes, still wins.

## 0.5.0 (2026-11-24)

Everything the Visits Abroad site needed that the theme did not have. All additions are optional props or new exports; nothing changes for existing sites except the two fixes marked below.

### Layout and page furniture
- `SiteFooter` has a `contact` line (with a mail icon) above the links. New `EnvironmentBanner` for a "Development mode" strip. `Main` takes `width` (`narrow`, `medium`, `default`).
- `PageHeader` takes `eyebrow` and `meta`. New `BackLink`, `SectionTitle` and `EmptyState`.
- `Alert` takes an `icon`, has a `neutral` kind and level-4 headings. **Fix:** lists inside warning and success alerts now use normal ink.
- `Button` has `secondary`, `link`, `destructiveOutline` and a `sm` size. `Input` has `lg` and `xl` widths.
- `Card` has `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter` and a `tone` (`accent`, `primary`).
- New `Hero`, `StepGrid` and `StepCard` for a landing page.
- **Fix:** `tabindex="-1"` focus targets (the main area, headings) no longer draw a focus ring.

### Sign-in
- `SignInCard` takes `children` (other ways in) and `as="section"`. New `OrDivider`, `MagicLinkForm`, `MagicLinkSent` and `MagicLinkConfirm` for sign-in by emailed link.

### Form controls
- `RadioCards` and `CheckboxCards`: new `layout` prop (`"inline"` default, `"stack"`, `"grid-2"`, `"grid-3"`; grids are one column below 640px). `ChoiceOption` gains `hint` (muted text under the label) and `conditional` (content revealed under an option only while it is selected; kept in the DOM with `hidden`, linked with `aria-controls`; forces the stacked layout).
- Fix: uncontrolled `CheckboxCards` never called `onChange`. It now fires with the new array in both modes. Both card components now track their own selection when uncontrolled.
- New `NativeDateField`: a single native date input using ISO `YYYY-MM-DD` strings, the compact alternative to `DateField`.
- `FieldGroup` gains `legendSize` (`"label"` default or `"heading"`, a card-style 1.125rem legend).
- New `CheckboxList`: plain inline checkboxes in a fieldset with 44px rows, for admin screens.
- New `SumField`: a fieldset of numeric boxes with a live, announced total (`<output aria-live="polite">`).
- New `FileUpload` (file input, Upload button, native progress in 25% steps, polite status, focus returns to the input on failure) and `FileList` (type icon, link or download, size, meta, Remove button named after the file).
- New `RepeatableFieldset`: repeated row fieldsets with Add and Remove, focus moved to the new or neighbouring row, and polite announcements.
- New `Combobox`: a dependency-free ARIA 1.2 editable combobox with label and synonym filtering, an always-last "not listed" option and a result-count announcement.
- New exports: `formatSize` and `sumValues` helpers.

### Page pieces
- Added page pieces: `ItemCard`, `SummaryList`, `SummaryCard`, `Disclosure`, `NavTabs`, `CommentCard`, `HistoryList`, `StatCard`, `BarList`, `Meter`, `ConfirmationPanel`, `Callout` and `OnThisPage`. All are exported from the package root.
- `Steps` now follows `steps.length` (CSS variable `--steps`), takes `doneTone` (`"primary"` or `"success"`) and `ariaLabel`, renders as a labelled `role="group"` with an `ol` instead of a `nav`, shows "Complete" when `current` is `steps.length + 1`, renders nothing when `current` is `0`, and shows only the heading line below 768px.
- `StatusChip` has a `solid` tone and an opt-in `wrap` prop for long text.
- `FactsCard` has `layout="grid"` (2 columns from 640px, 4 from 1024px).
- `DataTable` has `sortable`, `captionHidden`, `rowHeader` (boolean or column id) and `rowProps`, and a styled empty state.
- CSS helpers: `.two-col--sticky` (sticky aside from 1024px, width from `--aside-width`) and `.form-actions--sticky`.
- New tokens `--danger-border` and `--warning-border` (defined in `pieces.css`, light and dark).

## 0.4.0 (2026-11-24)

Server helpers for visits abroad, which keeps roles in its own database and also offers email sign-in. All additions are optional.

- `allow.resolve(identity)` on `handleCallback`: grant roles from the site's own store, or admit any tenant member.
- `handleCallback` results and `resolve` identities carry `username` (`preferred_username`, else `upn`). Tenant administrators set it, so it is a safer key than `email` for matching accounts by address.
- `createAuthorisationRequest` takes `context` (returned by `handleCallback`) and `prompt`.
- `ENTRA_AUTHORITY_HOST` / `authorityHost` on the config: an https origin (http only for localhost), used for the authorise, token, issuer and key-set URLs. For sovereign clouds and local fakes.
- `refreshSessionCookie`: sliding sessions.
- New magic-link helpers: `issueMagicLink` (no store, for writing the row in the same batch as the email job), `createMagicLink`, `consumeMagicLink`, an opaque `subject` on records, `looksLikeMagicToken`, `isPlausibleEmail`, `normaliseEmail`, `MagicLinkStore`.
- New `requireSameOrigin` for CSRF protection of JSON APIs.

## 0.3.1 (2026-11-24)

- Fix: radio and checkbox cards no longer jump around when you select one. The selected card used real bold, which is wider, so the row re-wrapped. It now uses a faux-bold shadow with the same width. The heavier border, tint and filled dot are unchanged.

## 0.3.0 (2026-11-24)

- New `Dialog` (modal with focus trap, Escape to close, close button): `Dialog`, `DialogTrigger`, `DialogContent` (`wide` option), `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`.
- New `Switch` for settings that apply straight away. The thumb shows a tick or a cross, so state is not colour alone.
- New `Checkbox`: a plain inline checkbox with a label, for admin screens. Use `ConsentCheckbox` for consent and `CheckboxCards` for choices.
- `StatusChip` has two new tones, `danger` and `info`, and takes a `className`.
- `ErrorSummary` links to a fieldset (radio or checkbox cards, dates) now focus its first control. `DateField`'s fieldset carries the `id`, so it can be linked.
- `Field` accepts a function child for a control that sits inside a wrapper (an input with an attached suffix). New `FieldGroup`: a fieldset with legend, hint and error, for several related controls.
- Buttons: an icon placed directly inside a `.btn` without the `.icon` class (for example a bare lucide component) is 20px, not lucide's 24px default.
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

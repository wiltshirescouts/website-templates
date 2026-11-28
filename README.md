# @wiltshirescouts/theme

The shared website theme for sites under `wiltshirescouts.org.uk`: design tokens (light and dark), Nunito Sans, the Scouts Wiltshire logos, layout and form components, Microsoft 365 sign-in helpers and Brevo email helpers.

React 19, Tailwind 4, Radix, Lucide. The package ships TypeScript source (no build step), like `@wiltshirescouts/email-template`. MIT licence for the code; the logos and fonts are licensed separately (see [LICENSE](LICENSE)).

## Install

Pin to a release tag, as with the email template (Dependabot then opens an update PR in each site):

```sh
npm install github:wiltshirescouts/website-templates#v0.1.0
```

Peer dependencies: `react`, `react-dom`, `tailwindcss` (v4).

## Tailwind setup

In your site's CSS entry (order matters):

```css
@import "tailwindcss";
@import "@wiltshirescouts/theme/fonts.css";
@import "@wiltshirescouts/theme/theme.css";
```

`theme.css` holds the shadcn-named tokens (`--background`, `--primary`, `--ring`, …), the `@theme inline` mapping (so `bg-background`, `text-muted-foreground`, `border-border` work), the single `--ribbon` token, and the component styles. It also registers the package source with `@source`, so no extra Tailwind config is needed. Header and footer stay brand purple in both colour modes.

Vite resolves the logos and fonts. For a non-Vite bundler, import `@wiltshirescouts/theme/assets/*` yourself.

## Colour mode

```tsx
import { NoFlashScript, ThemeProvider } from "@wiltshirescouts/theme";
```

- Wrap the app in `<ThemeProvider>`. It sets `data-theme="light|dark"` on `<html>`. **Auto** (the default) follows `prefers-color-scheme`.
- Put the tiny no-flash script in `<head>` so the right mode is set before first paint: `<NoFlashScript nonce={nonce} />`, or `NO_FLASH_SCRIPT` from `@wiltshirescouts/theme/no-flash` for static HTML.
- The choice is stored in one cookie, `ws-theme` (`light` or `dark`; Auto deletes it): `Domain=.wiltshirescouts.org.uk; Path=/; Max-Age=31536000; SameSite=Lax; Secure`. It is shared by every site. On other hosts (localhost, preview URLs) a `Domain` cookie would be rejected, so the cookie is host-only and `localStorage` is used as well.
- It is a preference cookie with no personal data. Check that the privacy notice mentions it.

## Components

```tsx
import { PageShell, SiteHeader, Main, SiteFooter } from "@wiltshirescouts/theme";

<PageShell>
  <SiteHeader title="Jamboree selection" nav={nav} account={{ variant: "signed-out", signInHref: "/sign-in?next=/" }} />
  <Main>…</Main>
  <SiteFooter madeBy={<>Made by <a href="…">Team</a></>} version="v1.0.0" />
</PageShell>
```

| Area | Components |
|---|---|
| Layout | `SiteHeader` (`title` max 60 characters: a type error for literals, a thrown error in development for variables; `nav` items `{label, href, icon, current}`; mobile menu is a right-hand sheet), `HeroHeader` + `HeroMain`, `SiteFooter`, `PageShell`, `Main`, `AdminShell` + `SubNav`, `BrandLogo` |
| Account | `AccountMenu` variants: `signed-out`, `signed-in` (name, email, role, profile link, sign out), `colour-only` (sites with no accounts). `ColourModeControl` |
| Page pieces | `PageHeader`, `Breadcrumb`, `Steps`, `Alert` (info, error, warning, success), `StatusChip`, `Tabs`, `Card`, `Button`/`ButtonLink`, `Dialog` (`DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`) |
| Forms | `Field` (a function child for wrapped controls), `FieldGroup`, `Input`, `Select`, `Textarea`, `DateField`, `RadioCards`, `CheckboxCards`, `ConsentCheckbox`, `Checkbox` (plain inline), `Switch`, `ErrorSummary`, `CharacterCounter`. Required fields show a red asterisk only; there is no "(optional)" text |
| Data | `DataTable` (sortable headings, live announcements, cards below 640px with a "Sort by" select), `TableFoot`, `SearchField` |
| Patterns | `TripCard`, `LibraryGrid`, `NoticeBar`, `InfoPanel`, `FactsCard`, `SignupGrid`, `TemplateCard`, `BrevoStatus`, `PlaceholderChips`, `EmailPreviewFrame`, editor layout pieces |
| Sign-in | `MicrosoftSignInButton`, `SignInCard`, `SignInNotAllowed` |

### Added in 0.5

Form controls:

| Export | What it is |
| --- | --- |
| `RadioCards` / `CheckboxCards` | Choice cards. `layout` (`inline`, `stack`, `grid-2`, `grid-3`); options take `hint` and `conditional`. |
| `NativeDateField` | Single native date input, ISO strings. Compact alternative to `DateField`. |
| `FieldGroup` | Fieldset with legend. `legendSize="heading"` for a card-style legend. |
| `CheckboxList` | Plain inline checkboxes in a fieldset, for admin screens. |
| `SumField` | Numeric boxes with a live announced total. |
| `FileUpload` | File input with Upload button, progress, status and error handling. |
| `FileList` | List of files with icon, link or download, size and Remove. |
| `RepeatableFieldset` | Repeatable row fieldsets with Add and Remove, focus management and announcements. |
| `Combobox` | Accessible editable combobox with synonyms and a "not listed" option. |

Page pieces:

| Component | Use it for |
| --- | --- |
| `ItemCard` | One item in a list: title (optionally a link), chips, meta lines, body, optional callout and action buttons. |
| `SummaryList` / `SummaryCard` | Check-your-answers rows with optional "Change" links; the card adds a heading and its own Change link. |
| `Disclosure` | Native details/summary with a turning chevron; `tone="destructive"` for withdraw or delete areas. |
| `NavTabs` | Page-level tabs that are real links, with `aria-current="page"`. |
| `CommentCard` / `HistoryList` | A reviewer comment, and a list of versions with a "Current" marker. |
| `StatCard` / `BarList` / `Meter` | A headline figure, decorative bars (pair with a table) and a labelled progress bar. |
| `ConfirmationPanel` / `Callout` | The "submitted" panel with a reference, and an inset note or declaration. |
| `OnThisPage` | An anchor-link card for long pages. |

Also new in 0.5: `EnvironmentBanner`, `BackLink`, `SectionTitle`, `EmptyState`, `Hero`, `StepGrid`/`StepCard`, `CardHeader`/`CardTitle`/`CardDescription`/`CardFooter`, and `OrDivider`/`MagicLinkForm`/`MagicLinkSent`/`MagicLinkConfirm`. `Button` takes `secondary`, `link`, `destructiveOutline` and `sm`; `Alert` takes `icon` and a `neutral` kind; `Main` takes `width`; `SiteFooter` takes `contact`.

Fields have no margin of their own, so you can put them in any flex or grid row and they line up. They stack with space between them inside a `form`, `fieldset` or card body; in any other container, add `className="stack"`.

Links are plain `<a href>`. Use a full page navigation or handle clicks in your router.

### Logos

`<BrandLogo on="purple" />` picks the supplied file for the background: `purple` and `dark` get white, `light` gets purple, `print` gets black, and `page` renders purple on light mode and white on dark mode. Logos are never recoloured.

## Microsoft 365 sign-in (server)

`@wiltshirescouts/theme/server` is runtime-agnostic (Web APIs only), written for Cloudflare Workers and Hono.

Bindings (see `.env.example`; never commit real values): `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `SESSION_SECRET` (32+ characters). Optional: `ENTRA_AUTHORITY_HOST` (an https origin; `http://localhost` is allowed for a local fake identity provider).

```ts
import { readEntraConfig, createAuthorisationRequest, handleCallback, createSessionCookie, readSession, safeNext } from "@wiltshirescouts/theme/server";
```

1. `/sign-in`: `createAuthorisationRequest(config, { redirectUri, next })` returns the Microsoft URL and a short-lived signed `ws-auth` cookie (PKCE S256, state, nonce). `next` goes through `safeNext`, which only ever returns a same-site path.
2. `/auth/callback`: `handleCallback(config, request, { redirectUri, allow })` checks state, exchanges the code, and validates the ID token (signature via the tenant JWKS, issuer, audience, tenant, expiry, nonce). The result is `{ ok: true, user, role, next }` or `{ ok: false, reason }`. Show the "account not allowed" state for `wrong_tenant` and `not_allowed`.
3. Roles come from Entra group object ids (`allow.groupRoles`) and/or an allow-list (`allow.allowList`), passed in by the site. If a user is in too many groups for Entra to list them (group overage), groups are treated as unavailable and only the allow-list can grant a role.
4. `createSessionCookie` / `readSession` / `clearSessionCookie`: stateless signed `ws-session` cookie (HttpOnly, Secure, SameSite=Lax, 8 hours by default).

### Sites that keep roles in their own database

`allow.resolve(identity)` is called after the ID token is fully validated and returns the roles to grant (or null). Use it when roles live in your own store, or when every member of the tenant may sign in. A user who ends up with no role is still `not_allowed`. It only decides admit and roles; merge identities and link accounts in your callback route after `ok: true`.

`createAuthorisationRequest` also takes `context` (a short label returned by `handleCallback`, for example `link` for "add Microsoft 365 to my account") and `prompt` (`select_account`, `login`, `consent`).

`refreshSessionCookie(session, secret, { maxAgeSeconds, renewWhenBelowSeconds })` returns a new cookie when the session is past the threshold (default: half its lifetime), or null. Call it from middleware so people filling in a long form stay signed in.

## Magic-link sign-in (server)

For people without a Microsoft 365 account. The theme makes and checks tokens; the site keeps the table, rate limits, sends the email and decides what a link does.

```ts
import { createMagicLink, consumeMagicLink, looksLikeMagicToken, type MagicLinkStore } from "@wiltshirescouts/theme/server";
```

- `createMagicLink({ email, purpose, next, origin, subject? }, store)` (or `issueMagicLink`, which stores nothing and returns `tokenHash` so you can insert it in your own batch) returns `{ token, record }`, or null for an implausible address. Only the SHA-256 of the token is stored. `next` goes through `safeNext`. Links last 15 minutes.
- `consumeMagicLink(token, store)` returns the record on first use and null afterwards (unknown, expired or used). Call it from a **POST** behind a "Continue" button, never from a GET: mail scanners follow links in emails and would use them up.
- `MagicLinkStore` is two methods, `save(hash, record)` and an atomic, single-use `consume(hash, now)` (in D1: `UPDATE … SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ? RETURNING …`).
- Reply identically whether or not an account exists.

## CSRF for JSON APIs (server)

`requireSameOrigin(request, { allowedOrigins?, requireJsonOrHeader? })` is for APIs that use the SameSite=Lax session cookie. Reads pass. A write needs an allowed `Origin` (or `Sec-Fetch-Site` of `same-origin`/`none` when there is none) and, unless switched off for multipart uploads, a JSON content type or an `x-ws-request` header (either forces a CORS preflight from another site). Do not set `Referrer-Policy: no-referrer`: browsers then send `Origin: null` on same-origin posts.

## Brevo (server)

`BREVO_API_KEY` is a secret binding and is used server side only.

```ts
import { renderEmail, sendTestEmail, checkStatus, BREVO_ERROR_MESSAGES } from "@wiltshirescouts/theme/server";
```

- `renderEmail({ subject, body }, values, ctx)` turns plain text with `{{placeholder}}` tokens into `{ subject, text, html }`. Values are escaped, blank lines become paragraphs, web addresses become links. The HTML shell comes from `@wiltshirescouts/email-template`.
- `sendEmail` (never throws), `deliver` (throws), `sendTestEmail` (one address only), `checkStatus` (connected or not, verified senders).
- Errors are classed `not_configured`, `rejected`, `rate_limited`, `server`, `network`, with plain-English messages in `BREVO_ERROR_MESSAGES`.

## Adopting the package in a site

1. Install the tag and add the three CSS imports.
2. Wrap the app in `ThemeProvider`, add `NoFlashScript` to the HTML head.
3. Replace the site's header and footer with `SiteHeader`/`HeroHeader` and `SiteFooter`; choose the `account` variant.
4. Swap forms and tables to the package components. Remove local copies of fonts and logos.
5. For Entra and Brevo, add the bindings and wire the helpers into the Worker routes.

## Development

```sh
npm install
npm run dev          # playground at http://localhost:5199 (routes: /content /form /table /library /info /sign-in /sign-in-not-allowed /emails /emails-brevo-not-set-up /email-edit; add ?mode=light|dark|auto)
npm run typecheck
npm run lint
npm test             # unit tests
npm run test:e2e     # Playwright + axe, light and dark
```

Release: bump `version`, update `CHANGELOG.md`, merge, then `git tag vX.Y.Z && git push --tags`. Dependabot opens update PRs in each site.

Design rules: British English, sentence case, no emoji, Lucide icons only, WCAG 2.2 AA, never colour alone, 44px targets, `prefers-reduced-motion` respected.

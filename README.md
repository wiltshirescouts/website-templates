# @wiltshirescouts/theme

The shared website theme for sites under `wiltshirescouts.org.uk`: design tokens (light and dark), Nunito Sans, the Scouts Wiltshire logos, layout and form components, Microsoft 365 sign-in helpers and Brevo email helpers.

React 19, Tailwind 4, Radix, Lucide. The package ships TypeScript source (no build step), like `@wiltshirescouts/email-template`. Private, `UNLICENSED`.

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

Fields have no margin of their own, so you can put them in any flex or grid row and they line up. They stack with space between them inside a `form`, `fieldset` or card body; in any other container, add `className="stack"`.

Links are plain `<a href>`. Use a full page navigation or handle clicks in your router.

### Logos

`<BrandLogo on="purple" />` picks the supplied file for the background: `purple` and `dark` get white, `light` gets purple, `print` gets black, and `page` renders purple on light mode and white on dark mode. Logos are never recoloured.

## Microsoft 365 sign-in (server)

`@wiltshirescouts/theme/server` is runtime-agnostic (Web APIs only), written for Cloudflare Workers and Hono.

Bindings (see `.env.example`; never commit real values): `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `SESSION_SECRET` (32+ characters).

```ts
import { readEntraConfig, createAuthorisationRequest, handleCallback, createSessionCookie, readSession, safeNext } from "@wiltshirescouts/theme/server";
```

1. `/sign-in`: `createAuthorisationRequest(config, { redirectUri, next })` returns the Microsoft URL and a short-lived signed `ws-auth` cookie (PKCE S256, state, nonce). `next` goes through `safeNext`, which only ever returns a same-site path.
2. `/auth/callback`: `handleCallback(config, request, { redirectUri, allow })` checks state, exchanges the code, and validates the ID token (signature via the tenant JWKS, issuer, audience, tenant, expiry, nonce). The result is `{ ok: true, user, role, next }` or `{ ok: false, reason }`. Show the "account not allowed" state for `wrong_tenant` and `not_allowed`.
3. Roles come from Entra group object ids (`allow.groupRoles`) and/or an allow-list (`allow.allowList`), passed in by the site. If a user is in too many groups for Entra to list them (group overage), groups are treated as unavailable and only the allow-list can grant a role.
4. `createSessionCookie` / `readSession` / `clearSessionCookie`: stateless signed `ws-session` cookie (HttpOnly, Secure, SameSite=Lax, 8 hours by default).

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

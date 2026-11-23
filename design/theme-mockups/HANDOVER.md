# Shared Wiltshire Scouts website theme: design handover

Status: design review only. Nothing in any repo was changed. Open `index.html` for the board, `standalone/0-component-sheet.html` for the component sheet. Editable sources are in `pages/` (same pages, linked to `theme.css` and `theme.js`); `standalone/` has self-contained copies that open correctly on their own.

## Pages
| File | Style | Based on |
|---|---|---|
| `1-content-page` | Standard header, nav, hero card, prose, aside | DPIA home |
| `2-form-page` | **Hero header** (tall purple band, large logo, icon, title, intro, teal ribbon, overlapping content card), step progress, error summary | go.wiltshirescouts.org.uk adult sign-up |
| `3-table-page` | Sortable table, cards on narrow screens | house pattern |
| `4-library` | Intro, mailing-list notice bar, trip card grid with sign-up status chips | body of go.wiltshirescouts.org.uk |
| `5-information-panel` | Image left, content right: back button, facts card, sign-up cards, tabs | body of go.wiltshirescouts.org.uk/jaws2027 |
| `6-sign-in`, `6b-sign-in-account-not-allowed` | Centred card, Sign in with Microsoft | new (Microsoft 365) |
| `7-email-library`, `7b-email-library-brevo-not-set-up` | Admin shell with section nav, Brevo status, template cards | wsj-system admin emails |
| `8-email-edit` | Subject, placeholder chips, body, test send, live preview | wsj-system admin email editor |
| `0-component-sheet` | Tokens, logos, header, account menu, footer, forms, sort headings, page styles, type, contrast | |

Screenshots in `screenshots/`: `{page}-{desktop|mobile}-{light|dark}.png`, plus menu-open, account-menu-open, focus and sorted-ascending extras.
Add `?mode=light|dark|auto`, `?menu=open`, `?popover=open`, `?tab=<tab id>` or `?sort=<column>:<ascending|descending>` to any page.

## References reviewed
- Repos: `dpia-tool` (header, footer, tokens, fonts), `wsj-system` (theme.css, ThemeSwitch, admin email List and Editor, email template definitions), `International-Sign-Ups` (PublicLayout hero, brand assets).
- Live and read: dpia, wsj /register, go home, go /jaws2027, go /jaws2027/adult.
- **Not readable:** `wsj-system.wiltshire-scouts.workers.dev/admin/configuration/emails` and `/emails/volunteer_thanks` sit behind a password sign-in, which I did not use. The two email pages are matched from the repo source instead (layout, wording, template list, placeholder names and the Brevo warning text). If the deployed pages differ from the repo, tell me.
- The "ribbon" under the hero is one 6px teal strip (`bg-scout-teal`) in the production code, not multi-coloured. It is a single token (`--ribbon`) if you want a different treatment.

## Design decisions
1. **Header and footer stay brand purple with white ink in both colour modes.** Header = logo, divider, site title, nav, account button. **Site title is limited to 60 characters**; the build rejects longer ones. On mobile the title drops to its own row and wraps.
2. **Account button + colour mode.** The header ends with a button that opens a popover. Three variants: signed out (Sign in + colour mode), signed in (name, profile, colour mode, sign out) and **colour mode only** for sites with no accounts (public library, information panel, forms, sign-in). The colour control is a three-way slider (Light, Dark, Auto) with a purple thumb, white text and a tick. Auto follows the device. The choice is saved in **one cookie** `ws-theme` for `.wiltshirescouts.org.uk` (Path=/, Secure, SameSite=Lax, one year), so it carries across every site; Auto removes the cookie.
3. **Tokens use shadcn names** (`--background` pale lilac `#f6f4f9`, white `--card`, `--primary`, `--muted-foreground`, `--destructive`, `--border`, `--input`, `--ring`) plus `--link`, `--success`, `--warning`, `--info` and soft backgrounds. Dark values follow wsj-system.
4. **Typography is the Scouts design system (Nunito Sans):** Black 900 for h1 and h2, Extra Bold 800 for h3, h4 and the local name under a logo, Bold 700 for buttons, labels and calls to action, Regular 400 body. Light 300 only for body on plain white (not used on the lilac page). All seven weights are self-hosted from dpia-tool (`assets/fonts`).
5. **Required fields:** red asterisk; optional fields carry no marker. A line at the top of the form explains the asterisk.
6. **Errors** use a thick left border, a circle-alert icon, the words "Error:" and a message, plus a "There is a problem" summary with links.
7. **Sort headings** are buttons in `th` with `aria-sort`, an arrow icon, hidden state text and a live-region announcement.
8. **Logos per background** are on the component sheet: white linear on purple, purple stack on light, white stack on dark pages, black and purple linear for light and print.
9. **Microsoft button:** follows Microsoft's published button spec (white with grey border on light; dark grey on dark; four-square mark). Re-check against the current Microsoft branding guidelines when building.

## Mobile behaviour
- Header: logo, account button and menu button on row 1; site title on row 2 (up to three lines). Sites with no nav have no menu button. The account popover opens full width below the header.
- Hero header: logo and account button on one row, title and intro below, content card overlaps the band.
- Forms: single column; Back and Continue full width, Continue first.
- Table: below 640px rows become cards with a "Sort by" select and direction button; scroll alternative on the component sheet.
- Information panel: image becomes a top banner. Library: one column. Admin pages: the left section nav becomes a "Configuration · Emails" disclosure. Email editor: Wording above Preview.

## Contrast
Computed from `theme.css` and shown on the component sheet: every required pair passes in both modes (text at least 5.6:1, control borders at least 4.7:1, focus rings at least 7.3:1). Not run through axe or a screen reader; do that during implementation, in both modes.

## Implementation requirements (carried from your brief; nothing built yet)
**Microsoft 365 login**
- Use Microsoft Entra ID (OIDC, authorisation code with PKCE) restricted to the Wiltshire Scouts tenant; show the "account not allowed" state when the tenant or an allow-list check fails.
- The sign-in page never handles passwords; "Sign in" in the account menu and any protected URL redirect here with a `next` parameter (the page shows "To continue to Email templates…").
- Decide roles and permissions from Entra groups or an app allow-list, not from the email address alone.

**Brevo integration**
- Server-side only: store the Brevo API key as a secret, never in the browser. Send through the transactional email API.
- Templates are stored as plain text with `{{placeholder}}` tokens and rendered by one shared function, so the preview matches what is sent (as in wsj-system).
- Status panel shows connected or not set up, the verified sender and the last check; "Send test email to me" sends only to the signed-in user.
- Handle Brevo errors by class (not configured, rejected, rate limited, server, network) with plain messages (copy exists in the wsj-system editor).

## Open questions
1. **Hero on every public page?** Forms use the hero. The library and information panel use the compact header, as the live site does. Confirm.
2. **Header and footer on admin pages:** they carry the site title and nav (Admin, Assess, Review, Leaderboard, Selection). The live admin has no footer links beyond this; OK to add the shared footer?
3. **Logo purple vs UI purple.** The supplied logo purple is a different shade (about `#5e3a9f`) from the UI purple `#7413dc`; normal for brand files, but confirm.
4. **Focus ring colour.** DPIA purple, wsj-system blue. I used purple (lilac in dark, white on purple).
5. **Narrow tables.** Cards by default; dense admin tables could scroll sideways instead.
6. **Sign-in sites with a public area.** If a site has both public and signed-in pages, which variant of the account button should public pages show: sign-in, or colour only?
7. **Cookie and consent.** The colour cookie is strictly a preference cookie. Check whether the privacy notice needs a line for it.

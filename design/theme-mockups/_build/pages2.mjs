// Round 2 page styles: Library, Information panel, Sign in (Microsoft 365), Email template library + editor (Brevo).
import fs from "node:fs";
import path from "node:path";

/** Stylised placeholder "photo" so the mockups need no stock images. Real pages use the trip's own image. */
function art(kind, label) {
  const sets = {
    forest: ["#9ec5a2", "#2f5d3a", "#1f4429", "#c97b3c"],
    snow: ["#b9c9e6", "#6f87b5", "#2c3f6b", "#f2c35b"],
    dusk: ["#f2b27a", "#7b4aa8", "#3a2468", "#ffd98a"],
  }[kind];
  const trees = Array.from({ length: 22 }, (_, i) => { const x = 20 + i * 29 + (i % 3) * 7, h = 40 + ((i * 37) % 44); return `<path d="M${x} 360 L${x - 14} ${360 - h * 0.4} L${x - 8} ${360 - h * 0.4} L${x - 18} ${360 - h * 0.8} L${x} ${360 - h * 1.1} L${x + 18} ${360 - h * 0.8} L${x + 8} ${360 - h * 0.4} L${x + 14} ${360 - h * 0.4} Z" fill="${sets[2]}"/>`; }).join("");
  return `<svg class="art" role="img" aria-label="${label}" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g-${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sets[0]}"/><stop offset="1" stop-color="${sets[3]}" stop-opacity=".55"/></linearGradient></defs><rect width="640" height="360" fill="url(#g-${kind})"/><circle cx="470" cy="95" r="34" fill="${sets[3]}" opacity=".85"/><path d="M0 250 L110 140 L190 210 L300 100 L420 220 L520 150 L640 240 V360 H0Z" fill="${sets[1]}"/><path d="M0 300 L90 230 L200 290 L330 215 L460 295 L560 245 L640 290 V360 H0Z" fill="${sets[2]}" opacity=".85"/>${trees}</svg>`;
}

export function build(ctx) {
  const { icon, header, heroHeader, footer, head, demoUser, PRIVACY, LOGO, root } = ctx;
  const out = (name, html) => fs.writeFileSync(path.join(root, "pages", name + ".html"), html);
  const nowrap = (s) => s;

  /* ------------------------------------------------------------ 4. LIBRARY (go.wiltshirescouts.org.uk home body) */
  const tripCard = ({ title, kind, label, adult, young, dates, cost, note }) => {
    const chip = (who, s) => s === "open" ? `<span class="chip chip-success">${icon("circle-check", "icon-sm")}${who} sign-up: open</span>` : s === "soon" ? `<span class="chip chip-warning">${icon("clock", "icon-sm")}${who} sign-up: opens soon</span>` : `<span class="chip chip-outline">${icon("lock", "icon-sm")}${who} sign-up: closed</span>`;
    return `<li><article class="card trip-card">${art(kind, label)}<div class="card__body"><h2><a href="#">${title}</a></h2><div class="chips">${chip("Adult", adult)}${chip("Young person", young)}</div><dl class="meta"><div>${icon("calendar", "icon-md")}<dt>Dates</dt><dd>${dates}</dd></div><div>${icon("pound-sterling", "icon-md")}<dt>Cost</dt><dd>${cost}${note ? ` <span style="font-weight:400">${note}</span>` : ""}</dd></div></dl></div></article></li>`;
  };
  out("4-library", `${head("Library page · shared theme mockup")}
<body>
<div class="shell">
${header({ title: "International Sign-Ups", nav: [], user: "none" })}
<main id="main" tabindex="-1" class="container">
  <div class="page-header"><div class="page-header__text"><h1>Wiltshire Scouts International Sign-Ups</h1><p>Choose a trip to see the details and sign up.</p></div></div>
  <section class="notice-bar" aria-labelledby="nb"><h2 id="nb">${icon("bell-ring", "icon-md")}Hear about new international events</h2><a class="btn btn-outline" href="#">${icon("bell", "icon-md")}Join the mailing list</a></section>
  <ul class="lib-grid" aria-label="Trips">
    ${tripCard({ title: "Jamboree Alternative", kind: "forest", label: "Placeholder photo: scouts gathered in a forest amphitheatre", adult: "open", young: "closed", dates: "27 Jul 2027 to 7 Aug 2027", cost: "£1,500 per person" })}
    ${tripCard({ title: "WEWA 2028", kind: "snow", label: "Placeholder photo: snowy mountain valley", adult: "closed", young: "closed", dates: "13 Feb 2028 to 19 Feb 2028", cost: "£1,500 to £2,000 per person", note: "(provisional)" })}
    ${tripCard({ title: "Summer Camp Abroad 2029", kind: "dusk", label: "Placeholder photo: campsite at dusk", adult: "soon", young: "soon", dates: "To be confirmed", cost: "To be confirmed" })}
  </ul>
</main>
${footer({ extra: "", version: "" })}
</div>
</body></html>`);

  /* ------------------------------------------------------------ 5. INFORMATION PANEL (go.../jaws2027 body) */
  out("5-information-panel", `${head("Information panel page · shared theme mockup")}
<body>
<div class="shell">
${header({ title: "International Sign-Ups", nav: [], user: "none" })}
<main id="main" tabindex="-1" class="info-split">
  <div class="info-art">${art("forest", "Placeholder photo: scouts gathered in a forest amphitheatre")}<span class="art-note">Placeholder photo</span></div>
  <div class="info-panel">
    <a class="btn btn-outline" href="#">${icon("arrow-left", "icon-md")}All trips</a>
    <h1>Jamboree Alternative</h1>
    <div class="intro">
      <p>JAWS (Jamboree Alternative Wiltshire Scouts) is an international adventure for young people across Wiltshire, running alongside the 2027 World Scout Jamboree.</p>
      <p>You’ll spend a week at an international Scout centre in the mountains, taking on new challenges, building independence and making friends with Scouts from around the world.</p>
      <p>The programme is still being planned. Watch the video below for a taste of what’s on offer, and check whether you’re eligible on the sign-up form.</p>
    </div>
    <section class="card facts" aria-label="Key facts">
      <dl><div><dt>${icon("calendar", "icon-md")}Event dates</dt><dd>27 Jul 2027 to 7 Aug 2027</dd></div><div><dt>${icon("pound-sterling", "icon-md")}Cost</dt><dd>£1,500 per person</dd></div></dl>
      <div class="contact"><a class="btn btn-outline" href="#">${icon("mail", "icon-md")}Contact the leader team</a><small>internationals@example.org</small></div>
    </section>
    <h2 style="font-size:1.375rem;margin-bottom:.75rem">Sign up</h2>
    <div class="signup-grid">
      <section class="card signup-card" aria-labelledby="su-a"><div class="card__body"><h3 id="su-a" style="font-size:1.125rem">Adult sign-up</h3><p class="hint" style="color:var(--foreground)">For adults who would like to join the leader team or the trip.</p><ul><li>You must be at least 18 years old on 1 Aug 2026. If your 18th birthday is on that date, you qualify.</li></ul><a class="btn btn-primary btn-lg push" href="#">Adult sign-up${icon("arrow-right", "icon-md")}</a></div></section>
      <section class="card signup-card" aria-labelledby="su-y"><div class="card__body"><h3 id="su-y" style="font-size:1.125rem">Young person sign-up</h3><p class="hint" style="color:var(--foreground)">For young people taking part in the trip.</p><p style="font-weight:900;margin:0">Sign-ups are not open yet.</p><a class="btn btn-outline btn-lg push" href="#">${icon("bell", "icon-md")}Notify me when sign-ups open</a></div></section>
    </div>
    <div data-tabs>
      <div class="tabs-list" role="tablist" aria-label="More about the trip">
        <button class="tab" role="tab" id="t-places" aria-controls="p-places" aria-selected="true">How places are decided</button>
        <button class="tab" role="tab" id="t-deposit" aria-controls="p-deposit" aria-selected="false" tabindex="-1">Deposit</button>
        <button class="tab" role="tab" id="t-video" aria-controls="p-video" aria-selected="false" tabindex="-1">${icon("circle-play", "icon-md")}Watch video</button>
      </div>
      <div id="p-places" role="tabpanel" aria-labelledby="t-places"><p><strong>Young people:</strong> Places are offered on a first come, first served basis, in the order eligible sign-ups are received.</p><p><strong>Adults:</strong> The trip team will review adult applications to build the leader team and will contact you with the outcome.</p><p>Every sign-up is provisional until the trip team confirms your place.</p></div>
      <div id="p-deposit" role="tabpanel" aria-labelledby="t-deposit" hidden><p>A deposit will be due to secure a place. The trip team will send payment details separately; no payment is taken through this website.</p></div>
      <div id="p-video" role="tabpanel" aria-labelledby="t-video" hidden><p>The video opens in a pop-up with captions.</p></div>
    </div>
  </div>
</main>
${footer({ extra: "", version: "" })}
</div>
</body></html>`);

  /* ------------------------------------------------------------ 6. SIGN IN (Microsoft 365) */
  const ms = `<svg class="ms-mark" viewBox="0 0 21 21" aria-hidden="true" focusable="false"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>`;
  const signin = (denied) => `${head(denied ? "Sign in, account not allowed · shared theme mockup" : "Sign in page · shared theme mockup")}
<body>
<div class="shell">
${header({ title: "Jamboree selection", nav: [], user: "none" })}
<main id="main" tabindex="-1" class="signin-wrap">
  <section class="card signin-card" aria-labelledby="si-h"><div class="card__body">
    <div class="signin-logo"><img class="logo-light" src="${LOGO}scouts-wiltshire-stack-purple.svg" alt="Scouts Wiltshire"><img class="logo-dark" src="${LOGO}scouts-wiltshire-stack-white.svg" alt="Scouts Wiltshire"></div>
    <h1 id="si-h">Sign in</h1>
    <p class="lede">${denied ? "Use your Wiltshire Scouts Microsoft 365 account." : "To continue to <strong style=\"color:var(--foreground)\">Email templates</strong>, sign in with your Wiltshire Scouts Microsoft 365 account."}</p>
    ${denied ? `<div class="alert alert-error" role="alert">${icon("triangle-alert", "icon-md")}<div><h2>That account cannot sign in</h2><p>alex.example@gmail.com is not a Wiltshire Scouts Microsoft 365 account, or has not been given access to this site. Try a different account, or ask the digital team for access.</p></div></div>` : ""}
    <a class="btn-ms" href="#">${ms}<span>${denied ? "Try a different Microsoft account" : "Sign in with Microsoft"}</span></a>
    <hr class="divider">
    <p class="signin-note">${icon("shield-check", "icon-md")}<span>Microsoft handles your password and any two-step check. This site never sees or stores your password.</span></p>
    <p class="signin-note">${icon("life-buoy", "icon-md")}<span>Trouble signing in? Email <a href="#">digital@example.org</a>.</span></p>
  </div></section>
</main>
${footer({ extra: "", version: "" })}
</div>
</body></html>`;
  out("6-sign-in", signin(false));
  out("6b-sign-in-account-not-allowed", signin(true));

  /* ------------------------------------------------------------ 7/8. EMAIL TEMPLATES (wsj-system admin) */
  const adminNav = [{ label: "Admin", icon: "settings" }, { label: "Assess", icon: "clipboard-check" }, { label: "Review", icon: "book-open-check" }, { label: "Leaderboard", icon: "trophy" }, { label: "Selection", icon: "users" }];
  const sub = (cur) => {
    const groups = [["People", [["Applicants", "users"], ["Staff", "user-cog"], ["People summary", "chart-pie"]]], ["Configuration", [["Event", "calendar-days"], ["Criteria", "list-checks"], ["Registration", "clipboard-list"], ["Emails", "mail"], ["Connections", "plug"], ["Users", "user-round-cog"], ["Audit and retention", "archive"]]], ["Assessments", [["Answers", "message-square-text"], ["Submit scores", "send"], ["Results", "award"]]]];
    const lists = groups.map(([g, items]) => `<h2>${g}</h2><ul>${items.map(([l, ic]) => `<li><a href="#"${l === cur ? ' aria-current="page"' : ""}>${icon(ic, "icon-md")}${l}</a></li>`).join("")}</ul>`).join("");
    return `<nav class="subnav" aria-label="Admin sections"><div class="subnav-d">${lists}</div>
      <details class="subnav-m"><summary>${icon("menu", "icon-md")}<span class="grow">Configuration · ${cur}</span>${icon("chevron-down", "icon-md chev")}</summary><div class="panel-body">${lists}</div></details></nav>`;
  };
  const adminHeader = header({ title: "Jamboree selection", nav: adminNav, current: "Admin", user: demoUser });

  const tpls = [
    ["Thanks for registering", "Sent automatically when a participant registration is received.", "The parent or carer email on the registration", "Thanks for registering", "Customised", "21 Nov 2026, 14:02 by Alex Example"],
    ["Thanks for volunteering", "Sent automatically when a volunteer registration is received.", "The volunteer", "Thanks for volunteering", "Default", null],
    ["Outcome: successful", "Sent from the Selection screen to applicants who have a place.", "The parent or carer", "Good news about your application", "Default", null],
    ["Outcome: reserve", "Sent from the Selection screen to applicants on the reserve list.", "The parent or carer", "Your place on the reserve list", "Customised", "18 Nov 2026, 09:40 by Sam Example"],
    ["Outcome: unsuccessful", "Sent from the Selection screen to applicants who have not been given a place.", "The parent or carer", "Your application", "Default", null],
    ["User invite", "Sent when an administrator adds a new user.", "The new user", "You have been invited", "Default", null],
    ["Reviewer briefing", "Sent by an administrator to brief application reviewers.", "Application reviewers", "Reading the application answers", "Default", null],
  ];
  const tplCard = (t, i) => `<li><article class="card tpl" aria-labelledby="tp${i}"><div style="min-width:0;flex:1"><div class="chips" style="align-items:center"><h2 id="tp${i}">${t[0]}</h2>${t[4] === "Customised" ? `<span class="chip chip-purple">${icon("pencil", "icon-sm")}Customised</span>` : `<span class="chip chip-muted">Default</span>`}</div><p>${t[1]}</p><p class="small">To: ${t[2]}</p><p style="font-size:.9375rem;margin-top:.5rem"><strong>Subject:</strong> ${t[3]}</p><p class="small">${t[5] ? "Last edited " + t[5] : "Never edited"}</p></div><div class="tpl-actions">${i === 6 ? `<a class="btn btn-primary" href="#">${icon("mail", "icon-md")}Send to all reviewers</a>` : ""}<a class="btn btn-purple-outline" href="#" aria-label="Edit ${t[0]}">${icon("pencil", "icon-md")}Edit</a></div></article></li>`;

  const brevoOk = `<section class="card brevo" aria-label="Brevo email sending"><div class="brevo__main"><span class="brevo__logo" aria-hidden="true">${icon("send", "icon-lg")}</span><div><div class="chips" style="align-items:center"><h2 style="font-size:1.0625rem">Sending through Brevo</h2><span class="chip chip-success">${icon("circle-check", "icon-sm")}Connected</span></div><dl><dt>Sender</dt><dd>Wiltshire Scouts &lt;jamboree@example.org&gt; · verified</dd><dt>Last check</dt><dd>23 Nov 2026, 08:00 · all recent emails delivered</dd></dl></div></div><div class="btn-row"><a class="btn btn-outline" href="#">${icon("refresh-cw", "icon-md")}Check connection</a><a class="btn btn-ghost" href="#">Open Brevo ${icon("external-link", "icon-sm")}<span class="sr-only">(opens in a new tab)</span></a></div></section>`;
  const brevoBad = `<div class="alert alert-warning" role="alert">${icon("triangle-alert", "icon-md")}<div><h2>Email sending is not set up</h2><p>The Brevo API key is not configured, so no emails are sent, including thank-you emails, invitations and test emails. You can still edit and preview templates. See the setup steps in the README.</p></div></div>`;

  const library = (bad) => `${head(bad ? "Email library, Brevo not set up · shared theme mockup" : "Email template library · shared theme mockup")}
<body>
<div class="shell">
${adminHeader}
<main id="main" tabindex="-1" class="container">
  <div class="admin-layout">
    ${sub("Emails")}
    <div>
      <div class="page-header" style="margin-bottom:1rem"><div class="page-header__text"><h1>Email templates</h1><p>The wording of the emails the system sends. Each one starts with default wording; edit it to change what people receive. Outcome emails are never sent automatically: they are sent from the Selection screen.</p></div></div>
      ${bad ? brevoBad : brevoOk}
      <ul class="tpl-list" aria-label="Email templates">${tpls.map(tplCard).join("")}</ul>
    </div>
  </div>
</main>
${footer()}
</div>
</body></html>`;
  out("7-email-library", library(false));
  out("7b-email-library-brevo-not-set-up", library(true));

  const chips = ["Recipient name", "Event name", "Event start date", "Event end date", "Link", "Contact email", "Organisation name"];
  const bodyText = `Hello {{recipientName}},

Thank you so much for offering to help with {{eventName}}. We have received your details and we really appreciate your time.

One of the team will look at the volunteer offers and get in touch with you about what happens next. In the meantime you can see your confirmation here:

{{link}}

If you need to change anything you have told us, or you have a question, just reply to this email or write to {{contactEmail}}.

With thanks,
{{organisationName}}`;
  const previewText = bodyText.replace("{{recipientName}}", "Jordan Lee").replace("{{eventName}}", "Jamboree Alternative 2027").replace("{{link}}", "https://example.org/link/abc123").replace("{{contactEmail}}", "internationals@example.org").replace("{{organisationName}}", "Wiltshire Scouts");
  out("8-email-edit", `${head("Edit email template · shared theme mockup")}
<body>
<div class="shell">
${adminHeader}
<main id="main" tabindex="-1" class="container">
  <div class="admin-layout">
    ${sub("Emails")}
    <div>
      <a class="back-link" href="#">${icon("arrow-left", "icon-md")}All emails</a>
      <div class="title-row"><h1>Thanks for volunteering</h1><span class="chip chip-muted">Default</span><span class="chip chip-warning">${icon("pencil", "icon-sm")}Unsaved changes</span></div>
      <p style="max-width:48rem;color:var(--muted-foreground)">Sent automatically when a volunteer registration is received. To: The volunteer.</p>
      <div class="alert alert-info" role="note" style="margin-block:1rem">${icon("send", "icon-md")}<div><p style="margin:0">Sends through Brevo as Wiltshire Scouts &lt;jamboree@example.org&gt;. <a href="#">Connection status</a></p></div></div>
      <div class="editor-grid">
        <section class="card" aria-labelledby="w-h"><div class="card__body">
          <h2 class="card-title" id="w-h">Wording</h2>
          <div class="field"><label class="label" for="subj">Subject <span class="req" aria-hidden="true">*</span></label><p class="hint" id="subj-h">One line. You can use placeholders here too.</p><input class="input" id="subj" value="Thanks for volunteering" aria-describedby="subj-h"></div>
          <div class="field"><p class="label" id="chips-l" style="margin:0">Insert a placeholder</p><p class="hint">Adds it at the cursor in the email text. Each one is replaced with the real detail when the email is sent.</p>
            <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:.5rem;margin:.25rem 0 0;padding:0" aria-labelledby="chips-l">${chips.map((c) => `<li><button class="chip-btn" type="button" aria-label="Insert ${c}">${icon("plus", "icon-sm")}${c}</button></li>`).join("")}</ul>
            <p class="hint" aria-live="polite" style="min-height:1.5rem;margin-top:.25rem">Point at or focus a placeholder to see what it fills in.</p></div>
          <div class="field"><label class="label" for="body">Email text <span class="req" aria-hidden="true">*</span></label><p class="hint" id="body-h">Plain text. Leave a blank line between paragraphs. Web addresses become links.</p><textarea class="textarea mono" id="body" aria-describedby="body-h">${bodyText}</textarea></div>
          <p role="status" class="alert alert-success" style="margin:0 0 1rem">${icon("circle-check", "icon-md")}<span style="font-weight:700;color:var(--foreground)">Test email sent to alex@example.org through Brevo. It can take a minute to arrive.</span></p>
          <div class="btn-row"><button class="btn btn-primary" type="button">${icon("save", "icon-md")}Save</button><button class="btn btn-purple-outline" type="button">${icon("send", "icon-md")}Send test email to me</button><button class="btn btn-ghost" type="button" disabled>${icon("rotate-ccw", "icon-md")}Reset to default</button></div>
          <p class="hint" style="margin-top:.75rem">The test email uses the wording above (even if unsaved) with example details, and goes only to alex@example.org.</p>
        </div></section>
        <section class="card" aria-labelledby="pv-h"><div class="card__body">
          <h2 class="card-title" id="pv-h">Preview</h2>
          <p class="hint" style="margin-bottom:.75rem">This is how it looks with example details. Names and dates are made up. Emails always show on a light background, as in a mail client.</p>
          <div class="email-frame">
            <dl><dt>From</dt><dd>Wiltshire Scouts &lt;jamboree@example.org&gt;</dd><dt>To</dt><dd>Jordan Lee</dd><dt>Subject</dt><dd style="font-weight:700">Thanks for volunteering</dd></dl>
            <div class="email-body"><div class="mail"><div class="mail-head"><img src="${LOGO}scouts-wiltshire-linear-white.svg" alt="Scouts Wiltshire"></div><div class="mail-text">${previewText.split("\n\n").map((p) => `<p>${p.replace(/(https:\/\/\S+)/, '<a href="#">$1</a>').replace(/\n/g, "<br>")}</p>`).join("")}</div><div class="mail-foot">Wiltshire Scouts · #PlaceToBelong</div></div></div>
          </div>
          <details class="plain"><summary>Plain text version</summary><pre>${previewText}</pre></details>
        </div></section>
      </div>
    </div>
  </div>
</main>
${footer()}
</div>
</body></html>`);
}

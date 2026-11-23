// Generates the static mockup HTML. Run: LUCIDE=/path/to/node_modules/lucide-static/icons node _build/build.mjs
// (used icons are cached in _build/icons so the build also works without lucide-static installed)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconCache = path.join(root, "_build/icons");
fs.mkdirSync(iconCache, { recursive: true });

export function icon(name, cls = "") {
  let file = path.join(iconCache, name + ".svg");
  if (!fs.existsSync(file)) {
    const src = path.join(process.env.LUCIDE || "", name + ".svg");
    if (!fs.existsSync(src)) throw new Error("Missing Lucide icon: " + name);
    fs.copyFileSync(src, file);
  }
  const inner = fs.readFileSync(file, "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
}

const PRIVACY = "https://www.wiltshirescouts.org.uk/who-we-are/data-protection/";
const LOGO = "../assets/logos/";

/* ---------------------------------------------------------------- shared components */
export const MAX_TITLE = 60;
export function header({ title, nav, user = null, current }) {
  if ([...title].length > MAX_TITLE) throw new Error(`Site title is ${[...title].length} characters; the theme allows ${MAX_TITLE}: ${title}`);
  const links = nav.map((n) => `<a href="#"${n.label === current ? ' aria-current="page"' : ""}>${icon(n.icon, "icon-sm")}${n.label}</a>`).join("");
  const sheetLinks = nav.map((n) => `<a href="#"${n.label === current ? ' aria-current="page"' : ""}>${icon(n.icon, "icon-md")}<span>${n.label}</span></a>`).join("");
  return `
<header class="site-header chrome">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="container site-header__bar">
    <a class="brand" href="#" aria-label="Scouts Wiltshire, home"><img src="${LOGO}scouts-wiltshire-linear-white.svg" alt="" width="176" height="62"></a>
    <p class="site-title" style="margin:0">${title}</p>
    <nav class="site-nav" aria-label="Main">${links}</nav>
    ${accountMenu(user)}
    ${nav.length ? `<button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu-sheet">${icon("menu", "icon-lg")}</button>` : ""}
  </div>
</header>
${nav.length ? `<div class="sheet-overlay" data-close-menu></div>
<aside class="sheet" id="menu-sheet" aria-label="Menu">
  <div class="sheet__head chrome"><img src="${LOGO}scouts-wiltshire-linear-white.svg" alt="Scouts Wiltshire" width="144"><button class="menu-btn" type="button" data-close-menu aria-label="Close menu">${icon("x", "icon-lg")}</button></div>
  <p class="sheet__title">${title}</p>
  <nav aria-label="Main">${sheetLinks}</nav>
</aside>` : ""}`;
}

export function modeControl(opts = {}) {
  const { name = "colour-mode", selected = null, focus = null, id = "m" } = opts; // selected/focus only for static samples
  const opt = (v, label, ic) => {
    const stat = selected ? ` data-static="1"${selected === v ? " checked" : ""}` : "";
    return `<label${focus === v ? ' class="is-focus"' : ""}><input class="sr-only" type="radio" name="${name}" value="${v}"${stat}>${icon(ic, "icon-md")}<span>${label}</span>${icon("check", "icon-sm tick")}</label>`;
  };
  return `<div class="mode-seg" role="radiogroup" aria-labelledby="${id}-lbl">${opt("light", "Light", "sun")}${opt("dark", "Dark", "moon")}${opt("auto", "Auto", "monitor")}</div>`;
}

export function accountPopoverBody(user, id = "m") {
  const colour = `<div class="popover__section"><div class="popover__label" id="${id}-lbl">${icon("sun-moon", "icon-md")}Colour mode</div>${modeControl({ id })}<p class="hint">Auto follows your device’s light or dark setting.</p></div>`;
  if (user === "none") return colour;
  const who = user ? `<div class="popover__section"><div class="popover__who"><span class="avatar" aria-hidden="true">${user.initials}</span><div style="min-width:0"><strong>${user.name}</strong><div class="hint" style="margin:0">${user.email}</div><div class="hint" style="margin:0">${user.role}</div></div></div></div>
    <div class="popover__section"><a class="popover__link" href="#">${icon("user-pen", "icon-md")}Your profile</a></div>` : `<div class="popover__section"><p style="margin:0 0 .75rem;font-weight:700">You are not signed in</p><a class="btn btn-primary" style="width:100%" href="#">${icon("log-in", "icon-md")}Sign in</a></div>`;
  const out = user ? `<div class="popover__section"><button class="popover__link" type="button">${icon("log-out", "icon-md")}Sign out</button></div>` : "";
  return `${who}
    <div class="popover__section"><div class="popover__label" id="${id}-lbl">${icon("sun-moon", "icon-md")}Colour mode</div>${modeControl({ id })}<p class="hint">Auto follows your device’s light or dark setting.</p></div>${out}`;
}

export function heroHeader({ title, intro, iconName, user = null }) {
  return `
<header class="chrome hero-header">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="hero-wrap">
    <div class="hero-top">
      <a class="brand" href="#" aria-label="Scouts Wiltshire, home"><img src="${LOGO}scouts-wiltshire-linear-white.svg" alt="" width="260" height="92"></a>
      ${accountMenu(user)}
    </div>
    <div class="hero-title">${iconName ? `<span class="hero-icon" aria-hidden="true">${icon(iconName)}</span>` : ""}<div><h1>${title}</h1><p>${intro}</p></div></div>
  </div>
  <div class="ribbon" aria-hidden="true"></div>
</header>`;
}

export const demoUser = { initials: "AE", name: "Alex Example", email: "alex@example.org", role: "Registrar" };
function accountMenu(user) {
  if (user === "none") return `<div class="account">
      <button class="account-btn" type="button" aria-label="Colour mode" aria-haspopup="dialog" aria-expanded="false" aria-controls="account-pop">${icon("sun-moon", "icon-lg")}</button>
      <div class="popover" id="account-pop" role="dialog" aria-label="Colour mode">${accountPopoverBody("none")}</div>
    </div>`;
  const face = user ? `<span class="avatar" aria-hidden="true">${user.initials}</span>` : icon("circle-user-round", "icon-lg");
  return `<div class="account">
      <button class="account-btn" type="button" aria-label="Account and colour mode" aria-haspopup="dialog" aria-expanded="false" aria-controls="account-pop">${face}</button>
      <div class="popover" id="account-pop" role="dialog" aria-label="Account and colour mode">${accountPopoverBody(user)}</div>
    </div>`;
}

export function footer({ extra = "Made by <a href=\"#\">Wiltshire Scouts Digital</a>", version = "v1.0.0" } = {}) {
  return `
<footer class="site-footer chrome">
  <div class="container site-footer__inner">
    <div class="footer-row">
      <div class="footer-links">
        <a href="${PRIVACY}" target="_blank" rel="noopener">Privacy policy ${icon("external-link", "icon-sm")}<span class="sr-only">(opens in a new tab)</span></a>
        ${extra ? `<span>${extra}</span>` : ""}
        ${version ? `<span class="muted">${version}</span>` : ""}
      </div>
      <div class="footer-signoff"><a href="https://wiltshirescouts.org.uk">wiltshirescouts.org.uk</a><strong>#PlaceToBelong</strong></div>
    </div>
  </div>
</footer>`;
}

const head = (title) => `<!doctype html>
<html lang="en-GB" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="../theme.css">
<script src="../theme.js"></script>
</head>`;


/* ---------------------------------------------------------------- PAGE 1: content */
const contentPage = `${head("Content page · shared theme mockup")}
<body>
<div class="shell">
${header({
  title: "Wiltshire Scouts International Trips and Jamboree Info",
  nav: [{ label: "Home", icon: "house" }, { label: "Trips", icon: "tent" }, { label: "Costs", icon: "pound-sterling" }, { label: "Contact", icon: "mail" }],
  current: "Trips",
})}
<main id="main" tabindex="-1" class="container">
  <ol class="breadcrumb" aria-label="Breadcrumb"><li><a href="#">Home</a>${icon("chevron-right", "icon-sm")}</li><li><a href="#">Trips</a>${icon("chevron-right", "icon-sm")}</li><li aria-current="page">Jamboree Alternative</li></ol>
  <section class="hero" aria-labelledby="page-title">
    <div>
      <h1 id="page-title">Jamboree Alternative 2027</h1>
      <p>A two-week international adventure for Scouts, Explorers and volunteers from across Wiltshire. Read how it works, then sign up in about five minutes.</p>
    </div>
    <div class="hero__actions">
      <a class="btn btn-on-purple" href="#">${icon("user-plus", "icon-md")}Adult sign-up</a>
      <a class="btn btn-outline-on-purple" href="#">${icon("users", "icon-md")}Young person sign-up</a>
    </div>
  </section>

  <div class="two-col">
    <article class="prose">
      <h2 style="margin-top:0">Who can take part</h2>
      <p>The trip is open to Scouts and Explorers aged 14 to 17 on 1 August 2027, and to adult volunteers who are at least 18. You do not need to have been abroad with Scouts before.</p>
      <ul>
        <li>Young people need a parent or carer’s consent.</li>
        <li>Adults must hold a current Disclosure and Barring Service check through Scouts.</li>
        <li>Everyone completes the health and dietary form before the deposit is due.</li>
      </ul>
      <div class="alert alert-info" role="note">${icon("info", "icon-md")}<div><h3>Deposit</h3><p>A £150 deposit secures a place. The trip team send payment details separately. No payment is taken through this website.</p></div></div>
      <h2>How places are decided</h2>
      <p>The trip team review every sign-up and build a balanced group. You will hear the outcome by email within two weeks of the closing date. Your place is provisional until the trip team confirm it.</p>
      <h3>Key dates</h3>
      <div class="card-grid" style="margin-top:.5rem">
        <div class="card"><div class="card__body"><div class="eyebrow">${icon("calendar", "icon-sm")} Opens</div><h3 style="margin-top:.25rem">1 February 2027</h3><p class="hint" style="margin-top:.25rem">Sign-ups open to everyone.</p></div></div>
        <div class="card"><div class="card__body"><div class="eyebrow">${icon("calendar", "icon-sm")} Closes</div><h3 style="margin-top:.25rem">31 March 2027</h3><p class="hint" style="margin-top:.25rem">Last day to sign up.</p></div></div>
        <div class="card"><div class="card__body"><div class="eyebrow">${icon("plane", "icon-sm")} Departure</div><h3 style="margin-top:.25rem">24 July 2027</h3><p class="hint" style="margin-top:.25rem">Travelling together from Swindon.</p></div></div>
      </div>
    </article>
    <aside aria-label="Related">
      <div class="card"><div class="card__body">
        <h2 style="font-size:1.0625rem">Useful links</h2>
        <ul class="aside-list" style="margin-top:.5rem">
          <li><a href="#">Costs and payments ${icon("chevron-right", "icon-md")}</a></li>
          <li><a href="#">Kit list ${icon("chevron-right", "icon-md")}</a></li>
          <li><a href="#">Safeguarding on trips ${icon("chevron-right", "icon-md")}</a></li>
          <li><a href="#">Frequently asked questions ${icon("chevron-right", "icon-md")}</a></li>
        </ul>
      </div></div>
      <div class="card" style="margin-top:1rem"><div class="card__body">
        <h2 style="font-size:1.0625rem">Questions?</h2>
        <p style="margin:.5rem 0 .75rem">Email the trip team and we will reply within three working days.</p>
        <a class="btn btn-outline" href="#">${icon("mail", "icon-md")}Contact the team</a>
      </div></div>
    </aside>
  </div>
</main>
${footer()}
</div>
</body></html>`;

/* ---------------------------------------------------------------- PAGE 2: form */
const err = (t) => `<p class="error-msg" id="${t.id}-err">${icon("circle-alert", "icon-md")}<span><span class="sr-only">Error: </span>${t.text}</span></p>`;
const formPage = `${head("Registration form page · shared theme mockup")}
<body>
<div class="shell">
${heroHeader({ title: "Adult sign-up", intro: "Jamboree Alternative. It takes about five minutes. Answer a few questions, then check everything and send. All names and details on this page are fictional.", iconName: "tent", user: "none" })}
<main id="main" tabindex="-1" class="hero-main">
  <nav class="steps" aria-label="Progress">
    <div class="steps__head"><strong>Your Scouting</strong><span>Step 2 of 4</span></div>
    <ol>
      <li class="done"><span class="dot">${icon("check", "icon-sm")}</span>About you<span class="sr-only"> (complete)</span></li>
      <li class="current" aria-current="step"><span class="dot">2</span>Your Scouting<span class="sr-only"> (current step)</span></li>
      <li><span class="dot">3</span>Your answers</li>
      <li><span class="dot">4</span>Check and send</li>
    </ol>
  </nav>

  <div class="alert alert-error" role="alert" aria-labelledby="summary-title" tabindex="-1">${icon("triangle-alert", "icon-md")}
    <div><h2 id="summary-title">There is a problem</h2>
      <ul><li><a href="#surname">Enter your surname</a></li><li><a href="#dob-month">Date of birth must include a real month</a></li><li><a href="#email">Enter an email address in the correct format, like name@example.org</a></li></ul></div></div>

  <div class="alert alert-info" role="note">${icon("info", "icon-md")}<div><h2>Before you start</h2><p>Fields marked <span class="req" aria-hidden="true">*</span><span class="sr-only">with an asterisk</span> are required. Your sign-up is saved as <strong>provisional</strong>. Your place is not confirmed until the trip team tells you.</p></div></div>

  <form novalidate>
    <section class="card form-section" aria-labelledby="s1"><div class="card__body">
      <h2 id="s1">Who you are</h2>
      <p class="lede">As it appears on your Scouts membership.</p>
      <div class="row-2">
        <div class="field"><label class="label" for="first">First name <span class="req" aria-hidden="true">*</span></label><input class="input" id="first" autocomplete="given-name" value="Amara" required></div>
        <div class="field has-error"><label class="label" for="surname">Surname <span class="req" aria-hidden="true">*</span></label><input class="input" id="surname" autocomplete="family-name" aria-invalid="true" aria-describedby="surname-err" required>${err({ id: "surname", text: "Enter your surname" })}</div>
      </div>
      <fieldset class="field has-error" aria-describedby="dob-hint dob-err"><legend class="label">Date of birth <span class="req" aria-hidden="true">*</span></legend>
        <p class="hint" id="dob-hint">For example, 27 3 1985</p>
        ${err({ id: "dob", text: "Date of birth must include a real month" })}
        <div class="date-row">
          <div class="field"><label for="dob-day">Day</label><input class="input input-sm" id="dob-day" inputmode="numeric" value="14"></div>
          <div class="field has-error"><label for="dob-month">Month</label><input class="input input-sm" id="dob-month" inputmode="numeric" value="13" aria-invalid="true"></div>
          <div class="field"><label for="dob-year">Year</label><input class="input input-md" style="max-width:8rem" id="dob-year" inputmode="numeric" value="1986"></div>
        </div>
      </fieldset>
      <fieldset class="field"><legend class="label">Gender <span class="req" aria-hidden="true">*</span></legend><p class="hint">We use this to plan room splits for the trip.</p>
        <div class="choice-list" role="radiogroup">
          <label class="choice"><input type="radio" name="g"> Male</label><label class="choice"><input type="radio" name="g" checked> Female</label><label class="choice"><input type="radio" name="g"> Non-binary</label><label class="choice"><input type="radio" name="g"> Prefer to self-describe</label><label class="choice"><input type="radio" name="g"> Prefer not to say</label>
        </div></fieldset>
    </div></section>

    <section class="card form-section" aria-labelledby="s2"><div class="card__body">
      <h2 id="s2">Your Scouting</h2>
      <p class="lede">Tell us where you belong in Wiltshire Scouts.</p>
      <div class="field"><label class="label" for="district">District <span class="req" aria-hidden="true">*</span></label>
        <select class="select" id="district"><option>Choose your district</option><option selected>Mid Wiltshire</option><option>North East Wiltshire</option><option>Salisbury &amp; South</option><option>Swindon North</option><option>Swindon Ridgeway</option><option>Wiltshire North</option><option>Wiltshire West</option></select></div>
      <div class="field"><label class="label" for="group">Scout group or unit</label><input class="input input-focus-demo" id="group" placeholder="For example, 1st Anytown" aria-describedby="group-hint"><p class="hint" id="group-hint">Leave blank if you volunteer at district or county level.</p></div>
      <fieldset class="field"><legend class="label">Role you are applying for <span class="req" aria-hidden="true">*</span></legend><p class="hint">Choose all that apply.</p>
        <div class="choice-list"><label class="choice"><input type="checkbox" checked> Section leader</label><label class="choice"><input type="checkbox"> Assistant leader</label><label class="choice"><input type="checkbox" checked> First aider</label><label class="choice"><input type="checkbox"> Cook or catering</label></div></fieldset>
    </div></section>

    <section class="card form-section" aria-labelledby="s3"><div class="card__body">
      <h2 id="s3">How we contact you</h2>
      <div class="field has-error"><label class="label" for="email">Email address <span class="req" aria-hidden="true">*</span></label><p class="hint" id="email-hint">We will use this to contact you about your application.</p>
        <input class="input" id="email" type="email" autocomplete="email" value="amara.example" aria-invalid="true" aria-describedby="email-hint email-err">${err({ id: "email", text: "Enter an email address in the correct format, like name@example.org" })}</div>
      <div class="field"><label class="label" for="tel">Mobile number</label><input class="input input-md" style="max-width:16rem" id="tel" type="tel" autocomplete="tel" value="07700 900123"></div>
    </div></section>

    <section class="card form-section" aria-labelledby="s4"><div class="card__body">
      <h2 id="s4">Support you might need</h2>
      <div class="field"><label class="label" for="support">Anything that would help you take part</label><p class="hint" id="support-hint">A short summary the trip team can see, such as access needs. Medical detail goes on the health form.</p>
        <textarea class="textarea" id="support" aria-describedby="support-hint" maxlength="500"></textarea><div class="counter">0 of 500 characters</div></div>
      <div class="choice-list"><label class="choice consent"><input type="checkbox" required><span>I have read the <a href="${PRIVACY}">Privacy policy</a> and agree to Wiltshire Scouts using my details for this trip. <span class="req" aria-hidden="true">*</span></span></label></div>
    </div></section>

    <div class="form-actions"><a class="btn btn-outline btn-lg" href="#">${icon("arrow-left", "icon-md")}Back</a><button class="btn btn-primary btn-lg" type="submit">Continue${icon("arrow-right", "icon-md")}</button></div>
  </form>
</main>
${footer({ extra: "Run by the Jamboree trip team", version: "" })}
</div>
</body></html>`;

/* ---------------------------------------------------------------- PAGE 3: table */
const rows = [
  ["Amara Okafor", "Mid Wiltshire", 2, 150, "2026-11-19", "Confirmed"],
  ["Ben Whitfield", "Swindon North", 1, 75, "2026-11-18", "Provisional"],
  ["Chloe Hartley", "Wiltshire West", 4, 300, "2026-11-12", "Confirmed"],
  ["Daniel Mercer", "Salisbury & South", 1, 0, "2026-11-09", "Provisional"],
  ["Eleni Kosta", "North East Wiltshire", 3, 225, "2026-11-04", "Confirmed"],
  ["Finn Gallagher", "Swindon Ridgeway", 2, 150, "2026-10-28", "Withdrawn"],
  ["Grace Lindqvist", "Wiltshire North", 1, 150, "2026-10-21", "Confirmed"],
  ["Harvey Moss", "Mid Wiltshire", 5, 375, "2026-10-14", "Provisional"],
];
const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const chipFor = (s) => s === "Confirmed" ? `<span class="chip chip-success">${icon("circle-check", "icon-sm")}Confirmed</span>` : s === "Provisional" ? `<span class="chip chip-warning">${icon("clock", "icon-sm")}Provisional</span>` : `<span class="chip chip-muted">${icon("circle-x", "icon-sm")}Withdrawn</span>`;
export function sortHead(label, i, type, cls = "", sort = null) {
  const hint = sort ? (sort === "ascending" ? ", sorted ascending. Activate to sort descending." : ", sorted descending. Activate to sort ascending.") : ". Not sorted. Activate to sort ascending.";
  return `<th scope="col" class="${cls}" data-label="${label}" data-type="${type}"${sort ? ` aria-sort="${sort}"` : ""}><button class="sort-btn" type="button"><span>${label}</span>${icon("arrow-up-down", "icon-sm icon-none")}${icon("arrow-up", "icon-sm icon-asc")}${icon("arrow-down", "icon-sm icon-desc")}<span class="sr-only sort-hint">${hint}</span></button></th>`;
}
const tablePage = `${head("Data table page · shared theme mockup")}
<body>
<div class="shell">
${header({
  title: "Trip registrations",
  nav: [{ label: "Overview", icon: "layout-dashboard" }, { label: "Registrations", icon: "users" }, { label: "Reports", icon: "chart-column" }],
  current: "Registrations", user: demoUser,
})}
<main id="main" tabindex="-1" class="container">
  <div class="page-header">
    <div class="page-header__text"><h1>Registrations</h1><p>42 sign-ups for Jamboree Alternative 2027. All names and figures are fictional.</p></div>
    <div class="page-header__actions"><a class="btn btn-outline" href="#">${icon("download", "icon-md")}Export CSV</a></div>
  </div>
  <div class="toolbar">
    <div class="field search"><label class="label" for="q">Search</label>${icon("search", "icon-md")}<input class="input" id="q" type="search" placeholder="Name or district"></div>
    <div class="field small"><label class="label" for="status">Status</label><select class="select" id="status"><option>All statuses</option><option>Confirmed</option><option>Provisional</option><option>Withdrawn</option></select></div>
  </div>
  <div class="mobile-sort">
    <div class="field"><label class="label" for="sort-select">Sort by</label>
      <select class="select" id="sort-select"><option value="0">Name</option><option value="1">District</option><option value="2">Group size</option><option value="3">Deposit paid</option><option value="4">Registered</option></select></div>
    <button class="btn btn-outline" id="sort-dir" type="button" aria-label="Sort direction: descending. Activate to sort ascending." style="min-height:3rem;min-width:7rem"><span class="d-asc" style="display:none">${icon("arrow-up", "icon-md")}</span><span class="d-desc">${icon("arrow-down", "icon-md")}</span><span class="d-text">Z to A</span></button>
  </div>
  <div class="table-wrap">
    <table class="data" data-sortable data-sort-col="4" data-sort-dir="descending">
      <caption>Registrations, <span class="sort-caption">sorted by registered, descending</span></caption>
      <thead><tr>
        ${sortHead("Name", 0, "text")}${sortHead("District", 1, "text")}${sortHead("Group size", 2, "num", "num")}${sortHead("Deposit paid", 3, "num", "num")}${sortHead("Registered", 4, "num", "", "descending")}<th scope="col" style="padding-inline:1rem">Status</th>
      </tr></thead>
      <tbody>
        ${rows.map((r) => `<tr><th scope="row"><a href="#">${r[0]}</a></th><td data-label="District">${r[1].replace("&", "&amp;")}</td><td data-label="Group size" class="num" data-value="${r[2]}">${r[2]}</td><td data-label="Deposit paid" class="num" data-value="${r[3]}">£${r[3].toFixed(2)}</td><td data-label="Registered" data-value="${Date.parse(r[4])}">${fmt(r[4])}</td><td data-label="Status">${chipFor(r[5])}</td></tr>`).join("\n        ")}
      </tbody>
    </table>
    <div class="table-foot"><span>Showing 1 to 8 of 42</span><div class="pager"><button class="btn btn-outline" disabled aria-label="Previous page">${icon("chevron-left", "icon-md")}Previous</button><button class="btn btn-outline" aria-label="Next page">Next${icon("chevron-right", "icon-md")}</button></div></div>
  </div>
  <p class="sr-only" id="sort-status" role="status" aria-live="polite"></p>
</main>
${footer({ extra: "Made by <a href=\"#\">Wiltshire Scouts Digital</a>" })}
</div>
</body></html>`;

fs.mkdirSync(path.join(root, "pages"), { recursive: true });
fs.writeFileSync(path.join(root, "pages/1-content-page.html"), contentPage);
fs.writeFileSync(path.join(root, "pages/2-form-page.html"), formPage);
fs.writeFileSync(path.join(root, "pages/3-table-page.html"), tablePage);
console.log("pages written");

// component sheet is built in a second file to keep this one readable
const p2 = await import("./pages2.mjs");
p2.build({ icon, header, heroHeader, footer, head, demoUser, PRIVACY, LOGO, root, sortHead });
const sheet = await import("./sheet.mjs");
sheet.build({ icon, header, footer, modeControl, accountPopoverBody, demoUser, sortHead, root, head, PRIVACY, LOGO });

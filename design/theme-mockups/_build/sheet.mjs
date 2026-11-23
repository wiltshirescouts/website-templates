import fs from "node:fs";
import path from "node:path";

const lum = (hex) => { const c = hex.replace("#", ""); const v = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const blend = (fg, bg, a) => "#" + [0, 2, 4].map((i) => Math.round(parseInt(fg.slice(1 + i, 3 + i), 16) * a + parseInt(bg.slice(1 + i, 3 + i), 16) * (1 - a)).toString(16).padStart(2, "0")).join("");

function tokens(css) {
  const grab = (re) => { const m = css.match(re)[1]; const o = {}; for (const [, k, v] of m.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) o[k] = v; return o; };
  const light = grab(/:root \{([\s\S]*?)\n\}/);
  const dark = { ...light, ...grab(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/) };
  return { light, dark };
}

export function contrastRows(css) {
  const T = tokens(css);
  const out = {};
  for (const mode of ["light", "dark"]) {
    const t = T[mode];
    const pairs = [
      ["Body text", t.foreground, t.background, 4.5],
      ["Body text on card", t["card-foreground"], t.card, 4.5],
      ["Muted text (hints, captions) on page", t["muted-foreground"], t.background, 4.5],
      ["Muted text on card", t["muted-foreground"], t.card, 4.5],
      ["Muted text on table header", t["muted-foreground"], t.muted, 4.5],
      ["Link text on page", t.link, t.background, 4.5],
      ["Link text on card", t.link, t.card, 4.5],
      ["Link text on tinted row / selected", t.link, t.secondary, 4.5],
      ["Primary button text", t["primary-foreground"], t.primary, 4.5],
      ["Primary button hover text", "#ffffff", mode === "light" ? t["purple-deep"] : "#8a33e8", 4.5],
      ["Selected choice / sorted heading text", t["secondary-foreground"], t.secondary, 4.5],
      ["Error text on page", t.destructive, t.background, 4.5],
      ["Error text on card", t.destructive, t.card, 4.5],
      ["Error text on error banner", t.destructive, t["destructive-soft"], 4.5],
      ["Destructive button text", t["destructive-foreground"], t.destructive, 4.5],
      ["Success chip text", t.success, t["success-soft"], 4.5],
      ["Warning chip text", t.warning, t["warning-soft"], 4.5],
      ["Info alert icon on info background", t.info, t["info-soft"], 3],
      ["Form control border vs page (1.4.11)", t.input, t.background, 3],
      ["Form control border vs card (1.4.11)", t.input, t.card, 3],
      ["Focus ring vs page (1.4.11)", t.ring, t.background, 3],
      ["Focus ring vs card (1.4.11)", t.ring, t.card, 3],
      ["Header/footer text (white on purple)", "#ffffff", "#7413dc", 4.5],
      ["Footer hint text (white 85% on purple)", blend("#ffffff", "#7413dc", 0.85), "#7413dc", 4.5],
      ["Focus ring on header/footer (white vs purple)", "#ffffff", "#7413dc", 3],
      ["Colour mode: selected label (white on purple thumb)", "#ffffff", t.primary, 4.5],
      ["Colour mode: unselected label on track", t.foreground, t.muted, 4.5],
      ["Account button open: purple on white", "#4a0d93", "#ffffff", 4.5],
      ["Purple header vs page edge (1.4.11 not required, info)", "#7413dc", t.background, 1],
      ["Card border vs page (decorative, info)", t.border, t.background, 1],
    ];
    out[mode] = pairs.map(([n, fg, bg, min]) => ({ n, fg, bg, min, r: ratio(fg, bg) }));
  }
  return out;
}

export function build({ icon, header, footer, modeControl, accountPopoverBody, demoUser, sortHead, root, head, PRIVACY, LOGO }) {
  const css = fs.readFileSync(path.join(root, "theme.css"), "utf8");
  const C = contrastRows(css);
  const fails = [];
  const tbl = (mode) => `<table class="data"><thead><tr><th scope="col">Pair (${mode})</th><th scope="col">Colours</th><th scope="col" class="num">Ratio</th><th scope="col">Needs</th><th scope="col">Result</th></tr></thead><tbody>${C[mode].map((p) => {
    const ok = p.r >= p.min; if (!ok) fails.push(`${mode}: ${p.n} ${p.r.toFixed(2)}`);
    return `<tr><th scope="row" style="font-weight:400">${p.n}</th><td data-label="Colours"><span style="display:inline-block;width:1rem;height:1rem;vertical-align:-3px;border:1px solid #888;background:${p.bg}"></span> <span style="display:inline-block;width:1rem;height:1rem;vertical-align:-3px;border:1px solid #888;background:${p.fg}"></span> <code>${p.fg}</code> on <code>${p.bg}</code></td><td data-label="Ratio" class="num">${p.r.toFixed(2)}:1</td><td data-label="Needs">${p.min === 1 ? "info" : p.min + ":1"}</td><td data-label="Result">${p.min === 1 ? "·" : ok ? `<span class="chip chip-success">${icon("check", "icon-sm")}Pass</span>` : `<span class="chip chip-warning">${icon("triangle-alert", "icon-sm")}Fail</span>`}</td></tr>`;
  }).join("")}</tbody></table>`;
  fs.writeFileSync(path.join(root, "_build/contrast.json"), JSON.stringify(C, null, 1));
  console.log("contrast fails:", fails.length ? fails : "none");

  const swatch = (name, label = name) => `<div style="display:flex;align-items:center;gap:.5rem"><span style="width:2rem;height:2rem;border-radius:6px;border:1px solid var(--border);background:var(--${name})"></span><div><code>--${name}</code><div class="hint">${label}</div></div></div>`;
  const tile = (bg, fg, img, label, note, border = false) => `<div class="card"><div style="background:${bg};height:7.5rem;display:grid;place-items:center;border-radius:var(--radius) var(--radius) 0 0;${border ? "border-bottom:1px solid var(--border)" : ""}"><img src="${LOGO}${img}" alt="${label}" style="height:${img.includes("stack") ? "5.25rem" : "3rem"};width:auto"></div><div class="card__body" style="padding:.875rem"><strong>${label}</strong><p class="hint" style="margin:.25rem 0 0">${note}</p></div></div>`;

  const parts = (name, alt) => `<picture><img class="part part-light" src="../screenshots/parts/${name}-light.png" alt="${alt} (light mode)"><img class="part part-dark" src="../screenshots/parts/${name}-dark.png" alt="${alt} (dark mode)"></picture>`;

  const sampleHeader = (state, extra) => `<th scope="col" aria-sort="${state}" class="" data-label="x"><button class="sort-btn ${extra || ""}" type="button"><span>Registered</span>${icon("arrow-up-down", "icon-sm icon-none")}${icon("arrow-up", "icon-sm icon-asc")}${icon("arrow-down", "icon-sm icon-desc")}</button></th>`;
  const plainHead = (extra, label = "Registered") => `<th scope="col"><button class="sort-btn ${extra || ""}" type="button"><span>${label}</span>${icon("arrow-up-down", "icon-sm icon-none")}${icon("arrow-up", "icon-sm icon-asc")}${icon("arrow-down", "icon-sm icon-desc")}</button></th>`;
  const sortSample = (title, th, aria) => `<div><div class="eyebrow" style="margin-bottom:.375rem">${title}</div><table class="data" style="border:1px solid var(--border);border-radius:var(--radius)"><thead><tr>${th}</tr></thead></table><p class="hint" style="margin-top:.375rem"><code>${aria}</code></p></div>`;

  const html = `${head("Component sheet · shared theme mockup")}
<body>
<style>
  .sheet-section { margin-bottom: 3rem; } .sheet-section > h2 { font-size: 1.5rem; margin-bottom: .25rem; } .sheet-section > .lede { color: var(--muted-foreground); max-width: 46rem; margin-bottom: 1.25rem; }
  .grid { display: grid; gap: 1rem; } .g2 { grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); } .g3 { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
  .panel { border: 1px dashed var(--input); border-radius: var(--radius); padding: 1rem; } .panel > .eyebrow { margin-bottom: .75rem; display: block; }
  .on-chrome { background: var(--chrome); color: #fff; border-radius: var(--radius); padding: 1rem; } .on-chrome .eyebrow { color: #fff; }
  .part { max-width: 100%; height: auto; border: 1px solid var(--border); border-radius: var(--radius); display: block; } .part-dark { display: none; }
  :root[data-theme="dark"] .part-light { display: none; } :root[data-theme="dark"] .part-dark { display: block; }
  code { font-size: .8125rem; background: var(--muted); padding: .0625rem .3rem; border-radius: 4px; word-break: break-word; }
  .map td, .map th { font-size: .875rem; }
  .note { border-left: 4px solid var(--primary); padding: .25rem 0 .25rem 1rem; color: var(--foreground); }
</style>
<div class="shell">
${header({ title: "Component sheet", nav: [{ label: "Tokens", icon: "palette" }, { label: "Account and footer", icon: "panel-top" }, { label: "Page styles", icon: "layout-template" }, { label: "Forms", icon: "text-cursor-input" }, { label: "Tables", icon: "table" }], current: "Tokens", })}
<main id="main" class="container">
  <div class="page-header"><div class="page-header__text"><h1>Component sheet</h1><p>The shared pieces used by all three example pages. Use the account button in the header to flip this whole sheet between Light, Dark and Auto. Each block names the shadcn/ui component and Tailwind pattern it maps to.</p></div></div>

  <section class="sheet-section" id="logos"><h2>Logo variant per background</h2>
    <p class="lede">Logos are used exactly as supplied and are never recoloured. Pick the file whose ink suits the ground. White ink on purple, black and dark grounds. Purple or black ink on white and light grounds. Header and footer stay purple in both colour modes, so they always use the white linear logo.</p>
    <div class="grid g3">
      ${tile("#7413dc", "#fff", "scouts-wiltshire-linear-white.svg", "Brand purple · white linear", "Header, mobile menu top bar, footer. SVG supplied.")}
      ${tile("#ffffff", "#000", "scouts-wiltshire-stack-purple.svg", "White or light · purple stack", "Sign-in cards, print, light-mode empty states. SVG supplied.", true)}
      ${tile("#f3ebfc", "#000", "scouts-wiltshire-stack-purple.svg", "Purple tint · purple stack", "Tinted panels in light mode. SVG supplied.", true)}
      ${tile("#121018", "#fff", "scouts-wiltshire-stack-white.svg", "Dark surface · white stack", "Dark-mode standalone pages (login, errors). SVG supplied.")}
      ${tile("#ffffff", "#000", "scouts-wiltshire-linear-purple.svg", "White · purple linear", "Light-mode linear lock-up. SVG converted from the supplied PDF.", true)}
      ${tile("#ffffff", "#000", "scouts-wiltshire-stack-black.svg", "White · black stack", "Mono print or one-colour use. SVG converted from the supplied PDF.", true)}
    </div>
    <p class="note" style="margin-top:1rem"><strong>Note</strong> the supplied logo purple is a different shade from the UI purple (#7413dc), as in the brand files. <strong>Never</strong> put the purple logo on a dark surface (about 2.5:1) or the white logo on a light surface. The supplied linear black file reads “Swindon”, not “Wiltshire”, so it is held back in <code>assets/logos/_check-county</code> until a Wiltshire version is supplied.</p>
  </section>

  <section class="sheet-section" id="header"><h2>Header</h2>
    <p class="lede">DPIA layout kept: purple bar, white linear logo, nav links with a 4px underline for the current page, actions on the right, off-canvas menu below 768px. New: a <strong>site title</strong> slot after a thin divider. Each site supplies title, nav items (icon + label) and actions. The site title is limited to 60 characters (the build rejects longer ones), so it fits on two lines on desktop and three on mobile. The header does not change in dark mode. The account button on the right holds the colour mode control (see next section).</p>
    <div class="grid g2">
      <div style="grid-column:1/-1"><div class="eyebrow">Desktop, long title wraps to two lines</div>${parts("header-desktop", "Header on desktop")}</div>
      <div><div class="eyebrow">Mobile, title drops to its own row (up to 3 lines, never truncated)</div>${parts("header-mobile", "Header on mobile")}</div>
      <div><div class="eyebrow">Mobile menu open (shadcn Sheet, side right)</div>${parts("menu-mobile", "Mobile menu sheet")}</div>
      <div style="grid-column:1/-1"><div class="eyebrow">Keyboard focus on a nav link, and the Skip to content link</div>${parts("header-focus", "Header focus state")}</div>
    </div>
    <p class="hint" style="margin-top:.75rem">shadcn: <code>Sheet</code> + <code>Button variant="ghost"</code> + <code>DropdownMenu</code> (user menu). Tailwind: <code>bg-primary text-primary-foreground</code>, nav link <code>border-b-4 border-transparent aria-[current=page]:border-white</code>.</p>
  </section>

  <section class="sheet-section" id="footer"><h2>Account menu, colour mode and footer</h2>
    <p class="lede">The header ends with an <strong>account button</strong> (circle-user icon when signed out, the user’s initials when signed in). It opens a popover holding sign-in or the user’s details, the <strong>colour mode control</strong> (Light, Dark, Auto) and sign out. The control is a three-way slider: a purple thumb slides to the chosen option, which also shows white text and a tick. Auto follows the device and is the default. Stored in one cookie shared across all wiltshirescouts.org.uk sites. Because every site gets the header, every site gets the control. On mobile the button sits beside the menu button and the popover opens full width under the header.</p>
    <div class="grid g2">
      <div style="grid-column:1/-1"><div class="eyebrow">Desktop: popover open, signed in (table page)</div>${parts("popover-desktop", "Account popover on desktop")}</div>
      <div><div class="eyebrow">Mobile: popover open, signed out (content page)</div>${parts("popover-mobile", "Account popover on mobile")}</div>
      <div><div class="eyebrow">Popover contents: signed out, signed in, and colour only (sites with no accounts)</div>
        <div class="static-popover" style="display:grid;gap:1rem"><div class="popover" style="max-width:22rem">${accountPopoverBody(null, "p1")}</div><div class="popover" style="max-width:22rem">${accountPopoverBody(demoUser, "p2")}</div><div class="popover" style="max-width:22rem">${accountPopoverBody("none", "p3")}</div></div></div>
    </div>
    <div class="grid g3" style="margin-top:1.25rem">
      <div class="panel"><span class="eyebrow" id="s1-lbl">Light selected</span>${modeControl({ name: "s-a", selected: "light", id: "s1" })}</div>
      <div class="panel"><span class="eyebrow" id="s2-lbl">Dark selected</span>${modeControl({ name: "s-b", selected: "dark", id: "s2" })}</div>
      <div class="panel"><span class="eyebrow" id="s3-lbl">Auto selected (default)</span>${modeControl({ name: "s-c", selected: "auto", id: "s3" })}</div>
      <div class="panel"><span class="eyebrow" id="s4-lbl">Auto selected, keyboard focus on Dark</span>${modeControl({ name: "s-d", selected: "auto", focus: "dark", id: "s4" })}</div>
    </div>
    <p class="hint" style="margin:.75rem 0 1.5rem">shadcn: <code>Popover</code> (or <code>DropdownMenu</code>) + <code>ToggleGroup type="single"</code>, with a <code>next-themes</code>-style provider (<code>attribute="data-theme"</code>, <code>defaultTheme="system"</code>). Focus moves into the popover on open, Escape closes it and returns focus to the button.</p>
    <h2 style="font-size:1.25rem">Footer</h2>
    <p class="lede">Every footer carries Privacy policy, wiltshirescouts.org.uk and #PlaceToBelong. “Made by” and the version number are an optional site slot (as on DPIA). Stacks on mobile.</p>
    <div class="grid g2"><div style="grid-column:1/-1"><div class="eyebrow">Desktop footer</div>${parts("footer-desktop", "Footer on desktop")}</div>
      <div><div class="eyebrow">Mobile footer</div>${parts("footer-mobile", "Footer on mobile")}</div></div>
  </section>

  <section class="sheet-section" id="forms"><h2>Form fields</h2>
    <p class="lede">Label above, hint, control, error. Required fields get a red asterisk (hidden from screen readers, which hear the error text instead); optional fields are left unmarked. Optional fields carry no marker. Errors combine a thick left border, a circle-alert icon and the words “Error:” and the message, so colour is never the only signal. 48px minimum control height.</p>
    <div class="grid g2">
      <div class="panel"><span class="eyebrow">Text · default</span>
        <div class="field"><label class="label" for="c1">First name <span class="req" aria-hidden="true">*</span></label><input class="input" id="c1" placeholder="For example, Amara"></div>
        <span class="eyebrow">Text · keyboard focus</span>
        <div class="field"><label class="label" for="c2">Surname <span class="req" aria-hidden="true">*</span></label><input class="input is-focus" id="c2" value="Okafor"></div></div>
      <div class="panel"><span class="eyebrow">Text · error</span>
        <div class="field has-error"><label class="label" for="c3">Email address <span class="req" aria-hidden="true">*</span></label><p class="hint">We will use this to contact you.</p><input class="input" id="c3" value="amara.example" aria-invalid="true">
          <p class="error-msg">${icon("circle-alert", "icon-md")}<span><span class="sr-only">Error: </span>Enter an email address in the correct format, like name@example.org</span></p></div>
        <span class="eyebrow">Select</span>
        <div class="field"><label class="label" for="c4">District</label><select class="select" id="c4"><option>Mid Wiltshire</option></select></div></div>
      <div class="panel"><span class="eyebrow">Radio choices · selected, focused, unselected</span>
        <div class="choice-list"><label class="choice"><input type="radio" name="x" checked> Female</label><label class="choice is-focus"><input type="radio" name="x"> Male</label><label class="choice"><input type="radio" name="x"> Prefer not to say</label></div>
        <span class="eyebrow" style="margin-top:1rem">Checkbox</span>
        <div class="choice-list"><label class="choice"><input type="checkbox" checked> First aider</label><label class="choice"><input type="checkbox"> Cook</label></div></div>
      <div class="panel"><span class="eyebrow">Error summary (GOV.UK pattern used on go.wiltshirescouts.org.uk)</span>
        <div class="alert alert-error" style="margin:0" role="note">${icon("triangle-alert", "icon-md")}<div><h3>There is a problem</h3><ul><li><a href="#c3">Enter an email address in the correct format</a></li></ul></div></div>
        <span class="eyebrow" style="margin-top:1rem;display:block">Buttons</span>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem"><a class="btn btn-primary" href="#">Continue${icon("arrow-right", "icon-md")}</a><a class="btn btn-outline" href="#">${icon("arrow-left", "icon-md")}Back</a><a class="btn btn-ghost" href="#">Cancel</a><a class="btn btn-primary is-focus" href="#">Focused</a><button class="btn btn-primary" disabled>Disabled</button></div></div>
    </div>
    <p class="hint" style="margin-top:.75rem">shadcn: <code>Field</code>/<code>Form</code> + <code>Label</code>, <code>Input</code>, <code>Select</code>, <code>Textarea</code>, <code>RadioGroup</code>, <code>Checkbox</code>, <code>Alert variant="destructive"</code>. Tailwind: <code>min-h-12 border-2 border-input rounded-lg focus-visible:ring-[3px] ring-ring aria-invalid:border-destructive aria-invalid:border-l-[6px]</code>.</p>
  </section>

  <section class="sheet-section" id="tables"><h2>Sortable table headings</h2>
    <p class="lede">Every sortable heading is a real button inside a <code>th</code> with <code>aria-sort</code>. Unsorted shows up-down arrows; ascending shows an up arrow; descending a down arrow, in a tinted pill with heavier stroke. Each button also carries hidden text saying the current state and what activating it does, and a polite live region announces the change.</p>
    <div class="grid g3">
      ${sortSample("Unsorted", `<th scope="col">${"" }<button class="sort-btn" type="button"><span>Registered</span>${icon("arrow-up-down", "icon-sm icon-none")}<span class="sr-only">. Not sorted. Activate to sort ascending.</span></button></th>`, "aria-sort not set")}
      ${sortSample("Ascending", `<th scope="col" aria-sort="ascending"><button class="sort-btn" type="button"><span>Registered</span>${icon("arrow-up", "icon-sm icon-asc")}<span class="sr-only">, sorted ascending. Activate to sort descending.</span></button></th>`, 'aria-sort="ascending"')}
      ${sortSample("Descending", `<th scope="col" aria-sort="descending"><button class="sort-btn" type="button"><span>Registered</span>${icon("arrow-down", "icon-sm icon-desc")}<span class="sr-only">, sorted descending. Activate to sort ascending.</span></button></th>`, 'aria-sort="descending"')}
      ${sortSample("Keyboard focus", `<th scope="col"><button class="sort-btn is-focus" type="button"><span>District</span>${icon("arrow-up-down", "icon-sm icon-none")}<span class="sr-only">. Not sorted. Activate to sort ascending.</span></button></th>`, "outline: 3px ring, 2px offset")}
      ${sortSample("Numeric column (right-aligned, arrow first)", `<th scope="col" class="num" aria-sort="descending"><button class="sort-btn" type="button" style="margin-left:auto;flex-direction:row-reverse"><span>Deposit paid</span>${icon("arrow-down", "icon-sm icon-desc")}<span class="sr-only">, sorted descending.</span></button></th>`, "aligned with its numbers")}
    </div>
    <h2 style="font-size:1.25rem;margin:2rem 0 .5rem">Narrow screens</h2>
    <p class="lede">Default (up to about six columns): below 640px each row becomes a card with label and value pairs, the column headings stay in the DOM for screen readers, and sorting moves to a “Sort by” select with a direction button above the list. Alternative for wide, many-column tables: keep the table, scroll sideways and pin the first column.</p>
    <div class="grid g2">
      <div><div class="eyebrow">Default · stacked cards (390px)</div>${parts("table-cards-mobile", "Table as cards on mobile")}</div>
      <div><div class="eyebrow">Alternative · scroll with pinned first column (live sample in a 360px box)</div>
        <div class="table-wrap scroll-table" style="max-width:22.5rem" tabindex="0" role="region" aria-label="Scrollable example table"><table class="data"><thead><tr><th scope="col">Name</th><th scope="col">District</th><th scope="col" class="num">Group size</th><th scope="col" class="num">Deposit paid</th><th scope="col">Registered</th><th scope="col">Status</th></tr></thead><tbody>
          <tr><th scope="row">Amara Okafor</th><td>Mid Wiltshire</td><td class="num">2</td><td class="num">£150.00</td><td>19 Nov 2026</td><td><span class="chip chip-success">${icon("circle-check", "icon-sm")}Confirmed</span></td></tr>
          <tr><th scope="row">Ben Whitfield</th><td>Swindon North</td><td class="num">1</td><td class="num">£75.00</td><td>18 Nov 2026</td><td><span class="chip chip-warning">${icon("clock", "icon-sm")}Provisional</span></td></tr></tbody></table></div>
        <p class="hint" style="margin-top:.5rem">The scroll region is focusable (<code>tabindex="0"</code>, <code>role="region"</code>, labelled) so keyboard users can scroll it.</p></div>
    </div>
    <p class="hint" style="margin-top:.75rem">shadcn: <code>Table</code>, <code>TableHead</code> with a <code>Button variant="ghost"</code> child, <code>Badge</code> for status, <code>Select</code> for mobile sort. TanStack Table supplies the sorting state.</p>
  </section>

  <section class="sheet-section" id="layouts"><h2>Page styles</h2>
    <p class="lede">One theme, three frames. <strong>Standard</strong> (compact purple header with site title and nav) for content, tables and admin. <strong>Hero</strong> (tall purple band, large logo, icon, title and intro, then a teal ribbon; the content card overlaps the band) for sign-up forms. <strong>Centred card</strong> inside the standard header for sign-in. Library, information panel and email pages use the standard frame. The ribbon colour is one token (<code>--ribbon</code>, teal today).</p>
    <div class="grid g2"><div><div class="eyebrow">Hero header, desktop</div>${parts("hero-desktop", "Hero header on desktop")}</div><div><div class="eyebrow">Hero header, mobile</div>${parts("hero-mobile", "Hero header on mobile")}</div></div>
    <div class="grid g3" style="margin-top:1.25rem">
      <div class="panel"><span class="eyebrow">Microsoft sign-in button (light / dark follow the page)</span><a class="btn-ms" href="#"><svg class="ms-mark" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg><span>Sign in with Microsoft</span></a></div>
      <div class="panel"><span class="eyebrow">Tabs</span><div data-tabs><div class="tabs-list" role="tablist"><button class="tab" role="tab" id="ta1" aria-controls="tp1" aria-selected="true">How places are decided</button><button class="tab" role="tab" id="ta2" aria-controls="tp2" aria-selected="false" tabindex="-1">Deposit</button></div><div id="tp1" role="tabpanel" aria-labelledby="ta1"><p class="hint">Selected tab: heavier text and a 4px underline.</p></div><div id="tp2" role="tabpanel" aria-labelledby="ta2" hidden><p class="hint">Arrow keys move between tabs.</p></div></div></div>
      <div class="panel"><span class="eyebrow">Status chips (icon + text)</span><div class="chips"><span class="chip chip-success">${icon("circle-check", "icon-sm")}Adult sign-up: open</span><span class="chip chip-outline">${icon("lock", "icon-sm")}Closed</span><span class="chip chip-warning">${icon("clock", "icon-sm")}Opens soon</span><span class="chip chip-purple">${icon("pencil", "icon-sm")}Customised</span><span class="chip chip-muted">Default</span></div></div>
    </div>
  </section>

  <section class="sheet-section" id="type"><h2>Typography (Scouts design system, Nunito Sans)</h2>
    <p class="lede">Weights follow the design system: Black 900 for h1 and h2, Extra Bold 800 for h3, h4 and the local name under a logo, Bold 700 for buttons, labels and calls to action, Regular 400 for body text. Light 300 is only for body text on plain white and is not used on the lilac page. Fonts are the self-hosted files from dpia-tool.</p>
    <div class="card"><div class="card__body"><h2 style="font-size:1.75rem">Heading two, Black 900</h2><h3 style="font-size:1.25rem;margin-top:.5rem">Heading three, Extra Bold 800</h3><p style="margin-top:.5rem"><strong>Label and button text, Bold 700.</strong> Body text in Regular 400 reads well at 16px on the lilac page and on white cards.</p></div></div>
  </section>

  <section class="sheet-section" id="tokens"><h2>Tokens (shadcn names)</h2>
    <p class="lede">Paste-ready CSS variables live in <code>theme.css</code>. Names match shadcn/ui so <code>components.json</code> with <code>cssVariables: true</code> works unchanged. Brand colours and the header/footer purple never change; neutrals, surfaces and text colours swap in dark mode (values follow what wsj-system already ships).</p>
    <div class="grid g3">${["background", "foreground", "card", "muted", "muted-foreground", "primary", "secondary", "accent", "destructive", "destructive-soft", "border", "input", "ring", "link", "success", "warning", "info"].map((n) => swatch(n)).join("")}</div>
  </section>

  <section class="sheet-section" id="contrast"><h2>Contrast check</h2>
    <p class="lede">Computed from the values in <code>theme.css</code> (WCAG 2.2 relative luminance). Text needs 4.5:1, borders and focus rings 3:1. ${fails.length ? `<strong>${fails.length} pairs need attention</strong>.` : "Every required pair passes in both modes."}</p>
    <div class="table-wrap" style="margin-bottom:1.5rem">${tbl("light")}</div>
    <div class="table-wrap">${tbl("dark")}</div>
  </section>
</main>
${footer()}
</div>
</body></html>`;
  fs.writeFileSync(path.join(root, "pages/0-component-sheet.html"), html);

  const shots = [["1-content-page", "Content page", "content"], ["2-form-page", "Registration form (hero header)", "form"], ["3-table-page", "Data table", "table"], ["4-library", "Library", "library"], ["5-information-panel", "Information panel", "info"], ["6-sign-in", "Sign in (Microsoft 365)", "signin"], ["6b-sign-in-account-not-allowed", "Sign in: account not allowed", "signin-not-allowed"], ["7-email-library", "Email template library", "emails"], ["7b-email-library-brevo-not-set-up", "Email library: Brevo not set up", "emails-brevo-not-set-up"], ["8-email-edit", "Edit email template", "email-edit"]];
  const key = shots.map((s) => s[2]);
  const idx = `<!doctype html><html lang="en-GB" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Shared theme mockups · review board</title><link rel="stylesheet" href="theme.css"><script src="theme.js"></script>
<style>.b{max-width:80rem;margin:0 auto;padding:2rem 1rem}.row{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));margin-bottom:2.5rem}.row figure{margin:0}.row img{width:100%;height:auto;border:1px solid var(--border);border-radius:var(--radius);display:block}.row figcaption{font-size:.875rem;margin-top:.375rem}.m{max-width:11rem}</style></head><body><div class="b">
<h1>Shared theme mockups: review board</h1>
<p style="max-width:46rem;color:var(--muted-foreground)">Design review only; nothing here is implemented. Each page is editable HTML (open it, or add <code>?mode=dark</code>, <code>?mode=light</code> or <code>?mode=auto</code>; <code>?menu=open</code> opens the mobile menu). Start with <a href="pages/0-component-sheet.html">the component sheet</a>, then read <a href="HANDOVER.md">HANDOVER.md</a>.</p>
${shots.map(([f, label], i) => `<h2 style="font-size:1.375rem;margin:2rem 0 .75rem">${i + 1}. ${label}</h2><p><a href="pages/${f}.html">Open ${f}.html</a> · <a href="pages/${f}.html?mode=dark">dark</a> · <a href="pages/${f}.html?mode=light&menu=open">mobile menu open</a></p>
<div class="row">${["desktop-light", "desktop-dark", "mobile-light", "mobile-dark"].map((v) => `<figure class="${v.startsWith("mobile") ? "m" : ""}"><a href="screenshots/${key[i]}-${v}.png"><img loading="lazy" src="screenshots/${key[i]}-${v}.png" alt="${label}, ${v.replace("-", ", ")} mode"></a><figcaption>${v.replace("-", " · ")}</figcaption></figure>`).join("")}</div>`).join("")}
</div></body></html>`;
  fs.writeFileSync(path.join(root, "index.html"), idx);
}

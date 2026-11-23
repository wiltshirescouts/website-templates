/*
 * Mockup behaviour only (the real build uses React + shadcn). Keeps the mockups clickable for review:
 *  - colour mode: Light / Dark / Auto, same rules as wsj-system (data-theme is always "light" or "dark"; Auto follows
 *    prefers-color-scheme and is the default; choice stored per device). ?mode=light|dark|auto forces a state for screenshots.
 *  - account popover (?popover=open opens it on load)
 *  - mobile menu sheet (?menu=open opens it on load)
 *  - sortable table headings with aria-sort + live-region announcement
 */
(function () {
  var KEY = "ws-theme", root = document.documentElement;
  var q = new URLSearchParams(location.search);
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  // One cookie shared by every *.wiltshirescouts.org.uk site. On other hosts (file://, localhost) it falls back to localStorage.
  var HOST = /(^|\.)wiltshirescouts\.org\.uk$/.test(location.hostname);
  function stored() {
    var m = document.cookie.match(/(?:^|; )ws-theme=(light|dark)/); if (m) return m[1];
    try { var v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; } catch (e) { return "auto"; }
  }
  function save(p) {
    document.cookie = "ws-theme=" + (p === "auto" ? "; Max-Age=0" : p + "; Max-Age=31536000") + "; Path=/; SameSite=Lax" + (HOST ? "; Domain=.wiltshirescouts.org.uk; Secure" : "");
    try { if (p === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, p); } catch (e) {}
  }
  var pref = ["light", "dark", "auto"].indexOf(q.get("mode")) > -1 ? q.get("mode") : stored();
  function apply() { root.setAttribute("data-theme", pref === "dark" || (pref === "auto" && mq && mq.matches) ? "dark" : "light"); }
  apply();
  if (mq && mq.addEventListener) mq.addEventListener("change", apply);
  if (q.get("menu") === "open") root.setAttribute("data-menu", "open");

  document.addEventListener("DOMContentLoaded", function () {
    // ---- colour mode control
    document.querySelectorAll('input[name="colour-mode"]').forEach(function (r) {
      if (r.dataset.static) return; // component-sheet samples are fixed
      r.checked = r.value === pref;
      r.addEventListener("change", function () {
        pref = r.value; apply();
        save(pref);
        document.querySelectorAll('input[name="colour-mode"]:not([data-static])').forEach(function (o) { o.checked = o.value === pref; });
      });
    });
    // ---- account popover
    var accBtn = document.querySelector(".account-btn");
    function setPop(open) { if (open) root.setAttribute("data-popover", "open"); else root.removeAttribute("data-popover"); if (accBtn) accBtn.setAttribute("aria-expanded", open ? "true" : "false"); }
    if (accBtn) {
      accBtn.addEventListener("click", function (e) { e.stopPropagation(); setPop(root.getAttribute("data-popover") !== "open"); });
      document.addEventListener("click", function (e) { if (!e.target.closest(".popover")) setPop(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.getAttribute("data-popover") === "open") { setPop(false); accBtn.focus(); } });
      setPop(q.get("popover") === "open");
    }
    // ---- mobile menu
    function setMenu(open) { if (open) root.setAttribute("data-menu", "open"); else root.removeAttribute("data-menu");
      document.querySelectorAll(".menu-btn").forEach(function (b) { b.setAttribute("aria-expanded", open ? "true" : "false"); }); }
    document.querySelectorAll(".menu-btn").forEach(function (b) { b.addEventListener("click", function () { setMenu(true); }); });
    document.querySelectorAll("[data-close-menu]").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    setMenu(root.getAttribute("data-menu") === "open");

    // ---- tabs
    document.querySelectorAll("[data-tabs]").forEach(function (root2) {
      var tabs = [].slice.call(root2.querySelectorAll('[role="tab"]'));
      function select(tab) { tabs.forEach(function (t2) { var on = t2 === tab; t2.setAttribute("aria-selected", on ? "true" : "false"); t2.tabIndex = on ? 0 : -1; var p = document.getElementById(t2.getAttribute("aria-controls")); if (p) p.hidden = !on; }); }
      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(tab); });
        tab.addEventListener("keydown", function (e) { var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1; if (n > -1) { var nt = tabs[(n + tabs.length) % tabs.length]; select(nt); nt.focus(); e.preventDefault(); } });
      });
      var want = q.get("tab"); var init = tabs.filter(function (x) { return x.id === want; })[0] || tabs[0]; select(init);
    });
    // ---- sortable table
    var table = document.querySelector("table[data-sortable]");
    if (!table) return;
    var tbody = table.tBodies[0], ths = [].slice.call(table.querySelectorAll("thead th"));
    var live = document.getElementById("sort-status");
    var select = document.getElementById("sort-select"), dirBtn = document.getElementById("sort-dir");
    var state = { col: +table.dataset.sortCol, dir: table.dataset.sortDir };
    var q2 = q.get("sort"); if (q2) { var p = q2.split(":"); state.col = +p[0]; state.dir = p[1] || "ascending"; }
    function val(tr, i) { var c = tr.cells[i]; var v = c.getAttribute("data-value"); if (v === null) v = c.textContent.trim(); return v; }
    function render() {
      var type = ths[state.col].dataset.type, mult = state.dir === "ascending" ? 1 : -1;
      var rows = [].slice.call(tbody.rows).sort(function (a, b) {
        var x = val(a, state.col), y = val(b, state.col);
        if (type === "text") return mult * x.localeCompare(y);
        return mult * (parseFloat(x) - parseFloat(y));
      });
      rows.forEach(function (r) { tbody.appendChild(r); });
      var verb = state.dir === "ascending" ? "ascending" : "descending", opp = state.dir === "ascending" ? "descending" : "ascending";
      ths.forEach(function (th, i) {
        var btn = th.querySelector(".sort-btn"); if (!btn) return;
        var name = th.dataset.label, hint = btn.querySelector(".sort-hint");
        if (i === state.col) { th.setAttribute("aria-sort", verb); hint.textContent = ", sorted " + verb + ". Activate to sort " + opp + "."; }
        else { th.removeAttribute("aria-sort"); hint.textContent = ". Not sorted. Activate to sort ascending."; }
      });
      var label = ths[state.col].dataset.label;
      table.querySelector("caption .sort-caption").textContent = "sorted by " + label.toLowerCase() + ", " + verb;
      if (live) live.textContent = "Table sorted by " + label + ", " + verb + ".";
      if (select) select.value = String(state.col);
      if (dirBtn) { dirBtn.setAttribute("aria-label", "Sort direction: " + verb + ". Activate to sort " + opp + "."); dirBtn.querySelector(".d-asc").style.display = state.dir === "ascending" ? "" : "none"; dirBtn.querySelector(".d-desc").style.display = state.dir === "ascending" ? "none" : ""; dirBtn.querySelector(".d-text").textContent = state.dir === "ascending" ? "A to Z" : "Z to A"; }
    }
    ths.forEach(function (th, i) {
      var btn = th.querySelector(".sort-btn"); if (!btn) return;
      btn.addEventListener("click", function () { state = { col: i, dir: state.col === i && state.dir === "ascending" ? "descending" : "ascending" }; render(); });
    });
    if (select) select.addEventListener("change", function () { state.col = +select.value; render(); });
    if (dirBtn) dirBtn.addEventListener("click", function () { state.dir = state.dir === "ascending" ? "descending" : "ascending"; render(); });
    render();
  });
})();

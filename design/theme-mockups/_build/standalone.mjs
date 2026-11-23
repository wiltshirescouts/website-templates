// Makes self-contained copies (CSS, JS, fonts, logos, images inlined) so a file opens correctly on its own.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mime = { ".png": "image/png", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".jpg": "image/jpeg" };
const uri = (f) => `data:${mime[path.extname(f)]};base64,${fs.readFileSync(f).toString("base64")}`;
let css = fs.readFileSync(path.join(root, "theme.css"), "utf8").replace(/url\("(assets\/[^"]+)"\)/g, (_, p) => `url("${uri(path.join(root, p))}")`);
const js = fs.readFileSync(path.join(root, "theme.js"), "utf8");
fs.mkdirSync(path.join(root, "standalone"), { recursive: true });
for (const f of fs.readdirSync(path.join(root, "pages"))) {
  let h = fs.readFileSync(path.join(root, "pages", f), "utf8");
  h = h.replace('<link rel="stylesheet" href="../theme.css">', () => `<style>${css}</style>`).replace('<script src="../theme.js"></script>', () => `<script>${js}</script>`)
    .replace(/(src)="\.\.\/([^"]+)"/g, (_, a, p) => `src="${uri(path.join(root, p))}"`);
  fs.writeFileSync(path.join(root, "standalone", f), h);
}
console.log("standalone written");

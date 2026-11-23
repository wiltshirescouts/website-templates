import { escapeHtml, link, paragraph, wrapEmail } from "@wiltshirescouts/email-template";

export interface EmailTemplate {
  subject: string;
  /** Plain text. Blank lines separate paragraphs; `{{placeholder}}` tokens are replaced. */
  body: string;
}

export type PlaceholderValues = Record<string, string | undefined>;

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

/** Give either `logoUrl` (absolute URL of the white linear logo) or `origin` (the site, which serves the logo). */
export type RenderContext = {
  organisationName: string;
  contactEmail: string;
  /** Extra footer lines (for example charity details). Escaped. */
  footerLines?: string[];
} & ({ logoUrl: string; origin?: string } | { origin: string; logoUrl?: string });

export const LOGO_PATH = "/brand/logos/scouts-wiltshire-linear-white.png";

const TOKEN = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/** Distinct placeholder names used in a piece of text, in order of first use. */
export function placeholdersIn(text: string): string[] {
  return [...new Set([...text.matchAll(TOKEN)].map((m) => m[1] as string))];
}

type Segment = { lit: string } | { ph: string; value: string };

function segmentsOf(text: string, values: PlaceholderValues): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push({ lit: text.slice(last, m.index) });
    const name = m[1] as string;
    out.push({ ph: name, value: Object.hasOwn(values, name) ? (values[name] ?? "") : "" }); // unknown placeholders render empty
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ lit: text.slice(last) });
  return out;
}

const URL_RE = /https?:\/\/[^\s<>"']+/g;
const isHttpUrl = (s: string) => /^https?:\/\/[^\s<>"']+$/.test(s);
const br = (s: string) => s.replace(/\r?\n/g, "<br>");

/** Escape literal template text and turn bare URLs into links. Trailing punctuation stays outside the link. */
function linkify(lit: string): string {
  let out = "";
  let last = 0;
  for (const m of lit.matchAll(URL_RE)) {
    const trail = /[.,;:!?)\]]+$/.exec(m[0])?.[0] ?? "";
    const url = trail ? m[0].slice(0, -trail.length) : m[0];
    out += escapeHtml(lit.slice(last, m.index)) + link(url) + escapeHtml(trail);
    last = m.index + m[0].length;
  }
  return out + escapeHtml(lit.slice(last));
}

/** Only template text is auto-linked, plus the {{link}} value. Other values (names and so on) are never linked. */
function paragraphHtml(para: string, values: PlaceholderValues): string {
  return segmentsOf(para, values)
    .map((s) => {
      if ("lit" in s) return br(linkify(s.lit));
      return s.ph === "link" && isHttpUrl(s.value) ? link(s.value) : br(escapeHtml(s.value));
    })
    .join("");
}

const plainText = (text: string, values: PlaceholderValues) =>
  segmentsOf(text, values)
    .map((s) => ("lit" in s ? s.lit : s.value))
    .join("");

const paragraphsOf = (body: string) =>
  body
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

function wrapHtml(title: string, inner: string[], ctx: RenderContext): string {
  const logoUrl = ctx.logoUrl ?? `${(ctx.origin as string).replace(/\/+$/, "")}${LOGO_PATH}`;
  const contact = ctx.contactEmail
    ? ` Questions? Write to ${link(`mailto:${ctx.contactEmail}`, ctx.contactEmail)}.`
    : "";
  const extra = (ctx.footerLines ?? []).map((l) => `<br>${escapeHtml(l)}`).join("");
  return wrapEmail({
    title,
    orgName: ctx.organisationName,
    logoUrl,
    bodyHtml: inner.map((p) => paragraph(p)).join(""),
    footerHtml: `${escapeHtml(ctx.organisationName)}.${contact}${extra}`,
  });
}

/**
 * Render a plain-text template. Values are escaped, blank lines become paragraphs, bare http(s) URLs become links and
 * unknown placeholders render empty. The subject is single-line plain text.
 */
export function renderEmail(
  template: EmailTemplate,
  values: PlaceholderValues,
  ctx: RenderContext,
): RenderedEmail {
  const subject = plainText(template.subject, values)
    .replace(/[\r\n]+/g, " ")
    .trim();
  const paras = paragraphsOf(template.body);
  const text = `${paras.map((p) => plainText(p, values)).join("\n\n")}\n\n--\n${ctx.organisationName}${
    ctx.contactEmail ? `\n${ctx.contactEmail}` : ""
  }\n`;
  return {
    subject,
    text,
    html: wrapHtml(
      subject,
      paras.map((p) => paragraphHtml(p, values)),
      ctx,
    ),
  };
}

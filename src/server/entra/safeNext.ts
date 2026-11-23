// biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control characters is the point
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;

/**
 * Turn an untrusted "where to go after sign-in" value into a same-site path, or `/`.
 * Accepts only a path that starts with a single `/`; rejects absolute and protocol-relative URLs, backslashes,
 * control characters and encoded variants (checked again after decoding once).
 */
export function safeNext(next: string | null | undefined, origin: string): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 2048) return "/";
  if (CONTROL.test(next)) return "/";
  let decoded: string;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return "/";
  }
  for (const candidate of [next, decoded]) {
    if (CONTROL.test(candidate) || candidate.includes("\\")) return "/";
    if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/";
  }
  try {
    const base = new URL(origin);
    const resolved = new URL(next, base);
    if (resolved.origin !== base.origin) return "/";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}

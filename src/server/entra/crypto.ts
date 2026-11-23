/** WebCrypto helpers shared by the auth and session cookies. Web APIs only. */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export const randomToken = (bytes = 32): string => toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));

/** Constant-time comparison of two byte arrays (length is not secret). */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] as number) ^ (b[i] as number);
  return diff === 0;
}

export const timingSafeEqualStrings = (a: string, b: string) =>
  timingSafeEqual(encoder.encode(a), encoder.encode(b));

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

/**
 * `base64url(json).base64url(hmac)`. The purpose is mixed into the MAC so a value signed for one cookie can never be
 * replayed as another (for example an auth-flow cookie presented as a session).
 */
export async function signValue(purpose: string, value: unknown, secret: string): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(value)));
  const mac = await hmac(secret, `${purpose}.${body}`);
  return `${body}.${toBase64Url(mac)}`;
}

/** Returns the parsed value, or null when the signature, purpose or encoding is wrong. */
export async function verifyValue(purpose: string, signed: string, secret: string): Promise<unknown | null> {
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts as [string, string];
  const given = fromBase64Url(sig);
  if (!given) return null;
  const expected = await hmac(secret, `${purpose}.${body}`);
  if (!timingSafeEqual(given, expected)) return null;
  const raw = fromBase64Url(body);
  if (!raw) return null;
  try {
    return JSON.parse(decoder.decode(raw));
  } catch {
    return null;
  }
}

export async function sha256Base64Url(s: string): Promise<string> {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(s))));
}

/** Read one cookie from a request. */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

export interface CookieOptions {
  maxAge: number;
  /** Defaults to true. Only switch off for plain-http local development. */
  secure?: boolean;
}

export function serialiseCookie(name: string, value: string, o: CookieOptions): string {
  return [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${Math.max(0, Math.floor(o.maxAge))}`,
    "HttpOnly",
    ...(o.secure === false ? [] : ["Secure"]),
    "SameSite=Lax",
  ].join("; ");
}

import { readCookie, serialiseCookie, signValue, verifyValue } from "./crypto";

export const SESSION_COOKIE = "ws-session";
export const DEFAULT_SESSION_SECONDS = 8 * 60 * 60;
const PURPOSE = "ws-session-v1";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** The signed payload. `exp` is seconds since the epoch. */
export interface Session extends SessionUser {
  exp: number;
}

export interface SessionOptions {
  /** Lifetime in seconds. Defaults to 8 hours. */
  maxAgeSeconds?: number;
  /** Defaults to true. Switch off only for plain-http local development. */
  secure?: boolean;
  /** Injectable clock for tests. */
  now?: Date;
}

const nowSeconds = (now?: Date) => Math.floor((now ?? new Date()).getTime() / 1000);

/** A `Set-Cookie` header value holding a stateless signed session (HMAC-SHA256). Nothing is stored server-side. */
export async function createSessionCookie(
  user: SessionUser,
  secret: string,
  o: SessionOptions = {},
): Promise<string> {
  const maxAge = o.maxAgeSeconds ?? DEFAULT_SESSION_SECONDS;
  const payload: Session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: nowSeconds(o.now) + maxAge,
  };
  return serialiseCookie(SESSION_COOKIE, await signValue(PURPOSE, payload, secret), {
    maxAge,
    secure: o.secure,
  });
}

/** The signed-in user, or null when the cookie is absent, tampered with, malformed or expired. */
export async function readSession(
  request: Request,
  secret: string,
  o: { now?: Date } = {},
): Promise<Session | null> {
  const raw = readCookie(request, SESSION_COOKIE);
  if (!raw) return null;
  const v = (await verifyValue(PURPOSE, raw, secret)) as Partial<Session> | null;
  if (!v || typeof v !== "object") return null;
  if (
    typeof v.id !== "string" ||
    typeof v.name !== "string" ||
    typeof v.email !== "string" ||
    typeof v.role !== "string" ||
    typeof v.exp !== "number" ||
    v.exp <= nowSeconds(o.now)
  ) {
    return null;
  }
  return { id: v.id, name: v.name, email: v.email, role: v.role, exp: v.exp };
}

/** A `Set-Cookie` header value that removes the session (sign out). */
export const clearSessionCookie = (o: { secure?: boolean } = {}): string =>
  serialiseCookie(SESSION_COOKIE, "", { maxAge: 0, secure: o.secure });

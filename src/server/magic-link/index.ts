import { randomToken, sha256Base64Url } from "../entra/crypto";
import { safeNext } from "../entra/safeNext";

export const MAGIC_LINK_SECONDS = 15 * 60;

export interface MagicLinkRecord {
  /** Lower-case email address the link was sent to. */
  email: string;
  /** What the site will do on success, for example `signin` or `add_email`. */
  purpose: string;
  /** Same-site path to go to afterwards, already passed through {@link safeNext}. */
  next: string;
  /** Opaque data the site wants back on use, for example the id of the signed-in user an "add this email" link belongs to. */
  subject?: string;
  /** Milliseconds since the epoch. */
  expiresAt: number;
}

/**
 * Where hashed tokens live. Only the SHA-256 of a token is ever stored. `consume` must be atomic and single-use: with
 * D1 that is `UPDATE ... SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ? RETURNING ...`.
 */
export interface MagicLinkStore {
  save(tokenHash: string, record: MagicLinkRecord): Promise<void>;
  consume(tokenHash: string, now: number): Promise<MagicLinkRecord | null>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normaliseEmail = (email: string): string => email.trim().toLowerCase();

/** True for something that looks like one email address. Deliberately loose: the link itself proves ownership. */
export const isPlausibleEmail = (email: string): boolean => {
  const e = normaliseEmail(email);
  return e.length <= 254 && EMAIL.test(e);
};

export interface CreateMagicLinkInput {
  email: string;
  purpose: string;
  /** Untrusted "where to go after sign-in". */
  next?: string | null;
  /** The site's own origin, used to check `next`. */
  origin: string;
  /** See {@link MagicLinkRecord.subject}. */
  subject?: string;
  now?: number;
  lifetimeSeconds?: number;
}

export interface IssuedMagicLink {
  /** Goes in the link. Never store it. */
  token: string;
  /** What to store: the SHA-256 of the token. */
  tokenHash: string;
  record: MagicLinkRecord;
}

/**
 * Make a single-use token without storing anything, for sites that must write the row in the same database batch as
 * the email job. Returns null for an implausible address, so callers can show a field error.
 */
export async function issueMagicLink(input: CreateMagicLinkInput): Promise<IssuedMagicLink | null> {
  if (!isPlausibleEmail(input.email)) return null;
  const token = randomToken(32);
  const record: MagicLinkRecord = {
    email: normaliseEmail(input.email),
    purpose: input.purpose,
    next: safeNext(input.next, input.origin),
    ...(input.subject ? { subject: input.subject } : {}),
    expiresAt: (input.now ?? Date.now()) + (input.lifetimeSeconds ?? MAGIC_LINK_SECONDS) * 1000,
  };
  return { token, tokenHash: await sha256Base64Url(token), record };
}

/**
 * {@link issueMagicLink} then `store.save`. The site builds the link (`/auth/link?t=${token}`), queues the email and
 * applies its own rate limits.
 */
export async function createMagicLink(
  input: CreateMagicLinkInput,
  store: MagicLinkStore,
): Promise<{ token: string; record: MagicLinkRecord } | null> {
  const issued = await issueMagicLink(input);
  if (!issued) return null;
  await store.save(issued.tokenHash, issued.record);
  return { token: issued.token, record: issued.record };
}

/** True when the string has the shape of a token we issue. Check it before touching the store. */
export const looksLikeMagicToken = (t: unknown): t is string =>
  typeof t === "string" && /^[A-Za-z0-9_-]{43}$/.test(t);

/**
 * Use up a token. Returns the record on first use, null if the token is unknown, expired or already used. Call it from
 * a POST, never a GET: mail scanners follow links in emails and would otherwise use them up.
 */
export async function consumeMagicLink(
  token: string,
  store: Pick<MagicLinkStore, "consume">,
  now: number = Date.now(),
): Promise<MagicLinkRecord | null> {
  if (!looksLikeMagicToken(token)) return null;
  return store.consume(await sha256Base64Url(token), now);
}

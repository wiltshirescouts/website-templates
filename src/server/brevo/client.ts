import {
  EmailConfigError,
  EmailError,
  EmailNetworkError,
  EmailRejectedError,
  EmailTransientError,
} from "./errors";
import { type EmailTemplate, type RenderContext, renderEmail } from "./render";

export const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
export const BREVO_SENDERS_URL = "https://api.brevo.com/v3/senders";
const MAX_RETRY_WAIT_MS = 10_000;
const DEFAULT_RETRY_WAIT_MS = 500;

/** The binding. Server-side only: never put it in a response, a log line or an error message. */
export interface BrevoEnv {
  BREVO_API_KEY?: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: string;
  toName?: string;
  /** A sender verified in Brevo. */
  sender: EmailAddress;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/** Injectable for tests. */
export interface ClientOptions {
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: Date;
}

export interface SendResult {
  sent: boolean;
  skipped?: boolean;
  errorClass?: string;
}

export const brevoConfigured = (env: BrevoEnv) => Boolean(env.BREVO_API_KEY?.trim());

/** Retry-After is delta-seconds or an HTTP date. Capped so a Worker never waits long. */
function retryAfterMs(h: string | null): number | undefined {
  if (!h) return undefined;
  const secs = Number(h);
  const ms = Number.isFinite(secs) ? secs * 1000 : Date.parse(h) - Date.now();
  return Number.isFinite(ms) ? Math.min(Math.max(ms, 0), MAX_RETRY_WAIT_MS) : undefined;
}

async function discard(res: Response) {
  await res.body?.cancel().catch(() => undefined); // never read the body: it can echo addresses
}

async function request(env: BrevoEnv, url: string, init: RequestInit, o: ClientOptions): Promise<Response> {
  let res: Response;
  try {
    res = await (o.fetch ?? fetch)(url, {
      ...init,
      headers: {
        "api-key": env.BREVO_API_KEY as string,
        accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new EmailNetworkError();
  }
  if (res.ok) return res;
  await discard(res);
  if (res.status === 429 || res.status >= 500) {
    throw new EmailTransientError(res.status, retryAfterMs(res.headers.get("retry-after")));
  }
  throw new EmailRejectedError(res.status);
}

async function attempt(env: BrevoEnv, msg: EmailMessage, o: ClientOptions): Promise<void> {
  const res = await request(
    env,
    BREVO_URL,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sender: msg.sender,
        to: [msg.toName ? { email: msg.to, name: msg.toName } : { email: msg.to }],
        ...(msg.replyTo ? { replyTo: { email: msg.replyTo } } : {}),
        subject: msg.subject,
        htmlContent: msg.html,
        textContent: msg.text,
      }),
    },
    o,
  );
  await discard(res);
}

/**
 * Send one message through the Brevo transactional API. Throws a typed {@link EmailError} on failure.
 * Retries once on 429, 5xx or a network failure, waiting for Retry-After when given.
 */
export async function deliver(env: BrevoEnv, msg: EmailMessage, o: ClientOptions = {}): Promise<void> {
  if (!brevoConfigured(env)) throw new EmailConfigError();
  try {
    await attempt(env, msg, o);
  } catch (e) {
    if (!(e instanceof EmailTransientError || e instanceof EmailNetworkError)) throw e;
    const wait =
      e instanceof EmailTransientError ? (e.retryAfterMs ?? DEFAULT_RETRY_WAIT_MS) : DEFAULT_RETRY_WAIT_MS;
    await (o.sleep ?? ((ms) => new Promise<void>((r) => setTimeout(r, ms))))(wait);
    await attempt(env, msg, o);
  }
}

/**
 * Send and never throw: a failed email must never fail the request. With no key it resolves
 * `{ sent: false, skipped: true, errorClass: "not_configured" }` without a network call. Logs only the error class.
 */
export async function sendEmail(
  env: BrevoEnv,
  msg: EmailMessage,
  o: ClientOptions = {},
): Promise<SendResult> {
  try {
    await deliver(env, msg, o);
    return { sent: true };
  } catch (e) {
    if (e instanceof EmailConfigError) {
      console.log("email: BREVO_API_KEY is not set, so no email was sent");
      return { sent: false, skipped: true, errorClass: e.errorClass };
    }
    const cls = e instanceof EmailError ? e.errorClass : "unexpected";
    console.error("email: send failed", cls, e instanceof EmailError ? (e.status ?? "") : "");
    return { sent: false, errorClass: cls };
  }
}

const SIMPLE_EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

export const TEST_EMAIL_TEMPLATE: EmailTemplate = {
  subject: "Test email from {{siteName}}",
  body: "Hello {{name}},\n\nThis is a test email from {{siteName}}. It was sent because you asked for one while signed in.\n\nIf it has arrived, email sending is working.",
};

export interface TestEmailInput {
  /** The signed-in user's own address. A test email is only ever sent to this address. */
  to: string;
  toName?: string;
  sender: EmailAddress;
  context: RenderContext;
  replyTo?: string;
}

/** Send a test message to the signed-in user, and only to them. */
export async function sendTestEmail(
  env: BrevoEnv,
  input: TestEmailInput,
  o: ClientOptions = {},
): Promise<SendResult> {
  if (!SIMPLE_EMAIL.test(input.to)) return { sent: false, errorClass: "rejected" };
  const r = renderEmail(
    TEST_EMAIL_TEMPLATE,
    { name: input.toName || input.to, siteName: input.context.organisationName },
    input.context,
  );
  return sendEmail(
    env,
    { to: input.to, toName: input.toName, sender: input.sender, replyTo: input.replyTo, ...r },
    o,
  );
}

export interface BrevoSender {
  name: string;
  email: string;
  active: boolean;
}

export interface BrevoStatus {
  configured: boolean;
  ok: boolean;
  senders: BrevoSender[];
  /** ISO 8601 time of the check. */
  checkedAt: string;
  errorClass?: string;
}

/** Confirm the key works and list the senders. With no key there is no network call. Never throws. */
export async function checkStatus(env: BrevoEnv, o: ClientOptions = {}): Promise<BrevoStatus> {
  const checkedAt = (o.now ?? new Date()).toISOString();
  if (!brevoConfigured(env))
    return { configured: false, ok: false, senders: [], checkedAt, errorClass: "not_configured" };
  try {
    const res = await request(env, BREVO_SENDERS_URL, { method: "GET" }, o);
    const json = (await res.json().catch(() => ({}))) as { senders?: unknown };
    const senders = (Array.isArray(json.senders) ? json.senders : []).flatMap((s: Record<string, unknown>) =>
      typeof s?.email === "string"
        ? [{ name: typeof s.name === "string" ? s.name : "", email: s.email, active: s.active === true }]
        : [],
    );
    return { configured: true, ok: true, senders, checkedAt };
  } catch (e) {
    return {
      configured: true,
      ok: false,
      senders: [],
      checkedAt,
      errorClass: e instanceof EmailError ? e.errorClass : "unexpected",
    };
  }
}

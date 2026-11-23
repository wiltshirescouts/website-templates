/** The only failure classes callers ever see. Each is a short fixed word, safe to log and store. */
export type BrevoErrorClass = "not_configured" | "rejected" | "rate_limited" | "server" | "network";

/** Plain-English messages for the person using the site. They never contain a key, an address or a Brevo response. */
export const BREVO_ERROR_MESSAGES: Record<BrevoErrorClass, string> = {
  not_configured: "Brevo is not set up, so no email was sent.",
  rejected:
    "Brevo did not accept the email. Check the API key, and that the sender address or domain is verified in Brevo.",
  rate_limited: "Brevo is limiting requests right now. Try again in a minute.",
  server: "Brevo had a problem on its side. Try again in a minute.",
  network: "Could not reach Brevo. Try again in a minute.",
};

/** Message for any class, or for an unexpected one (`unexpected` falls back to the server wording). */
export const brevoErrorMessage = (errorClass: string | undefined): string =>
  BREVO_ERROR_MESSAGES[errorClass as BrevoErrorClass] ?? BREVO_ERROR_MESSAGES.server;

/** Typed failures. `errorClass` never contains an address, a subject, a body, the API key or anything Brevo echoed. */
export class EmailError extends Error {
  constructor(
    public readonly errorClass: BrevoErrorClass,
    public readonly status?: number,
    public readonly retryAfterMs?: number,
  ) {
    super(errorClass);
    this.name = new.target.name;
  }
}
/** BREVO_API_KEY is not set. */
export class EmailConfigError extends EmailError {
  constructor() {
    super("not_configured");
  }
}
/** Brevo refused the request (bad key, unverified sender, invalid address). Retrying will not help. */
export class EmailRejectedError extends EmailError {
  constructor(status: number) {
    super("rejected", status);
  }
}
/** Brevo is busy or down (429 or 5xx). */
export class EmailTransientError extends EmailError {
  constructor(status: number, retryAfterMs?: number) {
    super(status === 429 ? "rate_limited" : "server", status, retryAfterMs);
  }
}
/** The request never got a response. */
export class EmailNetworkError extends EmailError {
  constructor() {
    super("network");
  }
}

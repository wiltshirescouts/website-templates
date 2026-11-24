const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export interface SameOriginOptions {
  /** Origins that may send writes, for example `["https://va.wiltshirescouts.org.uk"]`. The request's own origin is always allowed. */
  allowedOrigins?: readonly string[];
  /**
   * Also require a JSON content type or an `x-ws-request` header on writes. Either forces a CORS preflight for a
   * cross-site page, so a plain HTML form on another site cannot send it. Defaults to true. Switch off for endpoints
   * that take multipart uploads from a same-site page.
   */
  requireJsonOrHeader?: boolean;
}

/**
 * CSRF protection for JSON APIs that use a SameSite=Lax session cookie. Returns true when the request may proceed.
 * Reads are always allowed. A write must come from an allowed origin (Origin header; when absent, `Sec-Fetch-Site`
 * must be `same-origin` or `none`) and, by default, carry a JSON content type or `x-ws-request` header.
 */
export function requireSameOrigin(request: Request, o: SameOriginOptions = {}): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;
  const allowed = new Set([new URL(request.url).origin, ...(o.allowedOrigins ?? [])]);
  const origin = request.headers.get("origin");
  if (origin) {
    if (!allowed.has(origin)) return false;
  } else {
    const site = request.headers.get("sec-fetch-site");
    if (site !== "same-origin" && site !== "none") return false;
  }
  if (o.requireJsonOrHeader === false) return true;
  const type = request.headers.get("content-type") ?? "";
  return /^application\/json\b/i.test(type) || request.headers.has("x-ws-request");
}

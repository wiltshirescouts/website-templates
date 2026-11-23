import { createRemoteJWKSet, type JWTPayload, type JWTVerifyGetKey, jwtVerify } from "jose";
import { authorityFor, type EntraConfig } from "./config";
import {
  randomToken,
  readCookie,
  serialiseCookie,
  sha256Base64Url,
  signValue,
  timingSafeEqualStrings,
  verifyValue,
} from "./crypto";
import { safeNext } from "./safeNext";

export const AUTH_COOKIE = "ws-auth";
const AUTH_COOKIE_SECONDS = 600;
const PURPOSE = "ws-auth-v1";
const SCOPE = "openid profile email";

/** What the signed ws-auth cookie carries between the redirect and the callback. */
interface AuthState {
  state: string;
  nonce: string;
  verifier: string;
  next: string;
  exp: number;
}

export interface AuthorisationRequest {
  /** Send the browser here (302). */
  url: string;
  /** A `Set-Cookie` header value to send with that redirect. */
  cookie: string;
}

export interface AuthorisationInput {
  /** The absolute callback URL registered in Entra, for example `https://example.org/auth/callback`. */
  redirectUri: string;
  /** Where to go after sign-in. Untrusted; passed through {@link safeNext}. */
  next?: string | null;
  secure?: boolean;
  now?: Date;
}

/** Start the authorisation code flow with PKCE (S256), state and nonce. */
export async function createAuthorisationRequest(
  config: EntraConfig,
  input: AuthorisationInput,
): Promise<AuthorisationRequest> {
  const redirect = new URL(input.redirectUri);
  const state = randomToken(24);
  const nonce = randomToken(24);
  const verifier = randomToken(48);
  const payload: AuthState = {
    state,
    nonce,
    verifier,
    next: safeNext(input.next, redirect.origin),
    exp: Math.floor((input.now ?? new Date()).getTime() / 1000) + AUTH_COOKIE_SECONDS,
  };
  const url = new URL(`${authorityFor(config.tenantId)}/oauth2/v2.0/authorize`);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: input.redirectUri,
    response_mode: "query",
    scope: SCOPE,
    state,
    nonce,
    code_challenge: await sha256Base64Url(verifier),
    code_challenge_method: "S256",
  }).toString();
  return {
    url: url.toString(),
    cookie: serialiseCookie(AUTH_COOKIE, await signValue(PURPOSE, payload, config.sessionSecret), {
      maxAge: AUTH_COOKIE_SECONDS,
      secure: input.secure,
    }),
  };
}

/**
 * Who may sign in, and as what. The site supplies at least one of these; with neither, nobody is allowed.
 *
 * - `groupRoles` maps an Entra group object id to a role. If a user is in several mapped groups they get every role,
 *   and the first in this object's key order is their primary role, so list the most privileged group first.
 * - `allowList` maps a lower-case email address to a role. It is the only way email grants access.
 *
 * Group overage: when a user is in too many groups Entra omits the `groups` claim and sets `_claim_names.groups`
 * (or `hasgroups`). We deliberately do not call Microsoft Graph to expand it, so groups are treated as unavailable:
 * the user is `not_allowed` unless `allowList` grants a role.
 */
export interface AllowRules {
  groupRoles?: Record<string, string>;
  allowList?: Record<string, string>;
}

export interface CallbackOptions {
  redirectUri: string;
  allow: AllowRules;
  /** Injectable for tests; defaults to a cached remote JWKS for the tenant. */
  jwks?: JWTVerifyGetKey;
  /** Injectable for tests; used for the token endpoint. */
  fetch?: typeof fetch;
  now?: Date;
}

export interface SignedInUser {
  /** The Entra object id (`oid`). */
  id: string;
  name: string;
  email: string;
  groups: string[];
  roles: string[];
}

export type CallbackFailure =
  | "state_mismatch"
  | "token_exchange_failed"
  | "invalid_token"
  | "wrong_tenant"
  | "not_allowed";

export type CallbackResult =
  | {
      ok: true;
      user: SignedInUser;
      /** The primary role (the first of `user.roles`). */
      role: string;
      /** Same-site path to redirect to. */
      next: string;
      /** `Set-Cookie` value that removes the ws-auth cookie. */
      clearAuthCookie: string;
    }
  | { ok: false; reason: CallbackFailure; clearAuthCookie: string };

const jwksCache = new Map<string, JWTVerifyGetKey>();
function remoteJwks(tenantId: string): JWTVerifyGetKey {
  let jwks = jwksCache.get(tenantId);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${authorityFor(tenantId)}/discovery/v2.0/keys`));
    jwksCache.set(tenantId, jwks);
  }
  return jwks;
}

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Complete the flow: check state, exchange the code, validate the ID token, then apply the allow rules. */
export async function handleCallback(
  config: EntraConfig,
  request: Request,
  options: CallbackOptions,
): Promise<CallbackResult> {
  const clearAuthCookie = serialiseCookie(AUTH_COOKIE, "", { maxAge: 0 });
  const fail = (reason: CallbackFailure): CallbackResult => ({ ok: false, reason, clearAuthCookie });
  const now = options.now ?? new Date();

  const params = new URL(request.url).searchParams;
  const raw = readCookie(request, AUTH_COOKIE);
  const saved = raw
    ? ((await verifyValue(PURPOSE, raw, config.sessionSecret)) as Partial<AuthState> | null)
    : null;
  const givenState = params.get("state");
  if (
    !saved ||
    typeof saved.state !== "string" ||
    typeof saved.nonce !== "string" ||
    typeof saved.verifier !== "string" ||
    typeof saved.exp !== "number" ||
    saved.exp <= Math.floor(now.getTime() / 1000) ||
    !givenState ||
    !timingSafeEqualStrings(givenState, saved.state)
  ) {
    return fail("state_mismatch");
  }

  const code = params.get("code");
  if (!code || params.get("error")) return fail("token_exchange_failed");

  // Exchange the code. The response body is never logged or echoed: it can contain account details.
  let idToken: string;
  try {
    const res = await (options.fetch ?? fetch)(`${authorityFor(config.tenantId)}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: options.redirectUri,
        code_verifier: saved.verifier,
        scope: SCOPE,
      }),
    });
    if (!res.ok) return fail("token_exchange_failed");
    const json = (await res.json()) as { id_token?: unknown };
    if (typeof json.id_token !== "string") return fail("token_exchange_failed");
    idToken = json.id_token;
  } catch {
    return fail("token_exchange_failed");
  }

  // Signature, audience and expiry are checked by jose; tenant, issuer and nonce are checked below so that a
  // foreign-tenant account gets its own reason code.
  let claims: JWTPayload & Record<string, unknown>;
  try {
    const { payload } = await jwtVerify(idToken, options.jwks ?? remoteJwks(config.tenantId), {
      audience: config.clientId,
      algorithms: ["RS256"],
      currentDate: now,
      requiredClaims: ["exp", "iss", "aud"],
    });
    claims = payload;
  } catch {
    return fail("invalid_token");
  }

  if (typeof claims.tid !== "string" || claims.tid.toLowerCase() !== config.tenantId.toLowerCase()) {
    return fail("wrong_tenant");
  }
  if (claims.iss !== `${authorityFor(config.tenantId)}/v2.0`) return fail("invalid_token");
  if (typeof claims.nonce !== "string" || !timingSafeEqualStrings(claims.nonce, saved.nonce))
    return fail("invalid_token");
  if (typeof claims.oid !== "string" || !claims.oid) return fail("invalid_token");

  const claimNames = claims._claim_names as { groups?: unknown } | undefined;
  const overage =
    Boolean(claimNames && typeof claimNames === "object" && "groups" in claimNames) ||
    claims.hasgroups === true;
  const groups = overage ? [] : strings(claims.groups);
  const email = String(claims.email ?? claims.preferred_username ?? claims.upn ?? "").trim();

  const roles: string[] = [];
  const add = (r: string | undefined) => {
    if (r && !roles.includes(r)) roles.push(r);
  };
  for (const [groupId, role] of Object.entries(options.allow.groupRoles ?? {})) {
    if (groups.some((g) => g.toLowerCase() === groupId.toLowerCase())) add(role);
  }
  const listed = email ? options.allow.allowList?.[email.toLowerCase()] : undefined;
  add(Object.hasOwn(options.allow.allowList ?? {}, email.toLowerCase()) ? listed : undefined);
  const [role] = roles;
  if (!role) return fail("not_allowed");

  return {
    ok: true,
    user: { id: claims.oid, name: String(claims.name ?? email), email, groups, roles },
    role,
    next: typeof saved.next === "string" ? safeNext(saved.next, new URL(options.redirectUri).origin) : "/",
    clearAuthCookie,
  };
}

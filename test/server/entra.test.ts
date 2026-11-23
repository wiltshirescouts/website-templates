import { createLocalJWKSet, exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import {
  AUTH_COOKIE,
  createAuthorisationRequest,
  type EntraConfig,
  EntraConfigError,
  handleCallback,
  readEntraConfig,
} from "../../src/server";

const TENANT = "00000000-0000-0000-0000-000000000000";
const CLIENT = "11111111-1111-1111-1111-111111111111";
const GROUP_ADMIN = "22222222-2222-2222-2222-222222222222";
const GROUP_EDITOR = "33333333-3333-3333-3333-333333333333";
const REDIRECT = "https://example.org/auth/callback";
const config: EntraConfig = {
  tenantId: TENANT,
  clientId: CLIENT,
  clientSecret: "test-client-secret",
  sessionSecret: "s".repeat(40),
};
const ISS = `https://login.microsoftonline.com/${TENANT}/v2.0`;

let privateKey: CryptoKey;
let jwks: ReturnType<typeof createLocalJWKSet>;
let otherKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  const jwk: JWK = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
  jwks = createLocalJWKSet({ keys: [jwk] });
  otherKey = (await generateKeyPair("RS256")).privateKey;
});

async function token(
  claims: Record<string, unknown> = {},
  o: { key?: CryptoKey; nonce: string; exp?: string | number },
) {
  const { exp = "10m", key, nonce } = o;
  const { iss = ISS, aud = CLIENT, ...rest } = claims;
  return new SignJWT({
    tid: TENANT,
    oid: "oid-1",
    name: "Test Person",
    email: "Test.Person@Example.org",
    nonce,
    groups: [GROUP_EDITOR],
    ...rest,
  })
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(iss as string)
    .setAudience(aud as string)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key ?? privateKey);
}

/** Runs the start of the flow, then builds the callback request the browser would make. */
async function flow(
  idClaims: Record<string, unknown> = {},
  o: {
    key?: CryptoKey;
    exp?: string | number;
    stateOverride?: string;
    nonceOverride?: string;
    tokenStatus?: number;
    next?: string;
  } = {},
) {
  const start = await createAuthorisationRequest(config, {
    redirectUri: REDIRECT,
    next: o.next ?? "/dashboard?x=1",
  });
  const u = new URL(start.url);
  const state = o.stateOverride ?? (u.searchParams.get("state") as string);
  const nonce = o.nonceOverride ?? (u.searchParams.get("nonce") as string);
  const cookie = start.cookie.split(";")[0] as string;
  const request = new Request(`${REDIRECT}?code=abc&state=${encodeURIComponent(state)}`, {
    headers: { cookie },
  });
  const calls: { url: string; body: URLSearchParams }[] = [];
  const idToken = await token(idClaims, { key: o.key, nonce, exp: o.exp });
  const fetchStub = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: init.body as URLSearchParams });
    return o.tokenStatus && o.tokenStatus !== 200
      ? new Response("{}", { status: o.tokenStatus })
      : Response.json({ id_token: idToken });
  }) as unknown as typeof fetch;
  return { start, calls, request, fetchStub };
}

const run = async (
  f: Awaited<ReturnType<typeof flow>>,
  allow: Parameters<typeof handleCallback>[2]["allow"],
) => handleCallback(config, f.request, { redirectUri: REDIRECT, allow, jwks, fetch: f.fetchStub });

describe("readEntraConfig", () => {
  it("reads valid bindings", () => {
    expect(
      readEntraConfig({
        ENTRA_TENANT_ID: TENANT,
        ENTRA_CLIENT_ID: CLIENT,
        ENTRA_CLIENT_SECRET: "x",
        SESSION_SECRET: "s".repeat(32),
      }),
    ).toMatchObject({ tenantId: TENANT, clientId: CLIENT });
  });
  it("lists missing bindings without values", () => {
    try {
      readEntraConfig({ ENTRA_TENANT_ID: TENANT });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(EntraConfigError);
      expect((e as EntraConfigError).missing).toEqual([
        "ENTRA_CLIENT_ID",
        "ENTRA_CLIENT_SECRET",
        "SESSION_SECRET",
      ]);
      expect((e as Error).message).not.toContain(TENANT);
    }
  });
  it("rejects a short session secret and a bad tenant", () => {
    const ok = {
      ENTRA_TENANT_ID: TENANT,
      ENTRA_CLIENT_ID: CLIENT,
      ENTRA_CLIENT_SECRET: "x",
      SESSION_SECRET: "s".repeat(32),
    };
    expect(() => readEntraConfig({ ...ok, SESSION_SECRET: "short" })).toThrow(EntraConfigError);
    expect(() => readEntraConfig({ ...ok, ENTRA_TENANT_ID: "../evil" })).toThrow(EntraConfigError);
  });
});

describe("createAuthorisationRequest", () => {
  it("builds a PKCE authorisation URL and a hardened cookie", async () => {
    const { url, cookie } = await createAuthorisationRequest(config, { redirectUri: REDIRECT, next: "/a" });
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`);
    expect(u.searchParams.get("client_id")).toBe(CLIENT);
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("response_mode")).toBe("query");
    expect(u.searchParams.get("scope")).toBe("openid profile email");
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    expect(u.searchParams.get("code_challenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(u.searchParams.get("state")).toBeTruthy();
    expect(u.searchParams.get("nonce")).toBeTruthy();
    expect(cookie).toMatch(new RegExp(`^${AUTH_COOKIE}=`));
    for (const a of ["HttpOnly", "Secure", "SameSite=Lax", "Max-Age=600", "Path=/"])
      expect(cookie).toContain(a);
    expect(cookie).not.toContain(config.clientSecret);
  });
  it("uses fresh state each time", async () => {
    const a = await createAuthorisationRequest(config, { redirectUri: REDIRECT });
    const b = await createAuthorisationRequest(config, { redirectUri: REDIRECT });
    expect(new URL(a.url).searchParams.get("state")).not.toBe(new URL(b.url).searchParams.get("state"));
  });
});

describe("handleCallback", () => {
  it("succeeds with group roles and sends the PKCE verifier and secret to the token endpoint", async () => {
    const f = await flow();
    const r = await run(f, { groupRoles: { [GROUP_ADMIN]: "admin", [GROUP_EDITOR]: "editor" } });
    expect(r).toMatchObject({ ok: true, role: "editor", next: "/dashboard?x=1" });
    if (!r.ok) throw new Error("unreachable");
    expect(r.user).toEqual({
      id: "oid-1",
      name: "Test Person",
      email: "Test.Person@Example.org",
      groups: [GROUP_EDITOR],
      roles: ["editor"],
    });
    expect(f.calls[0]?.url).toBe(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`);
    const body = f.calls[0]?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code_verifier")).toBeTruthy();
    expect(body.get("client_secret")).toBe(config.clientSecret);
    expect(r.clearAuthCookie).toContain("Max-Age=0");
  });

  it("rejects a bad signature", async () => {
    const f = await flow({}, { key: otherKey });
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "invalid_token",
    });
  });

  it("rejects the wrong issuer", async () => {
    const f = await flow({ iss: "https://login.microsoftonline.com/elsewhere/v2.0" });
    const r = await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } });
    expect(r).toMatchObject({ ok: false, reason: "invalid_token" });
  });

  it("rejects the wrong audience", async () => {
    const f = await flow({ aud: "99999999-9999-9999-9999-999999999999" });
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "invalid_token",
    });
  });

  it("reports a different tenant as wrong_tenant", async () => {
    const f = await flow({ tid: "44444444-4444-4444-4444-444444444444" });
    expect(await run(f, { allowList: { "test.person@example.org": "editor" } })).toMatchObject({
      ok: false,
      reason: "wrong_tenant",
    });
  });

  it("rejects an expired token", async () => {
    const f = await flow({}, { exp: Math.floor(Date.now() / 1000) - 3600 });
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "invalid_token",
    });
  });

  it("rejects a bad nonce", async () => {
    const f = await flow({}, { nonceOverride: "not-the-nonce" });
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "invalid_token",
    });
  });

  it("rejects a state mismatch, a missing cookie and a tampered cookie", async () => {
    const f = await flow({}, { stateOverride: "forged" });
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "state_mismatch",
    });
    const g = await flow();
    const noCookie = new Request(g.request.url);
    expect(
      await handleCallback(config, noCookie, { redirectUri: REDIRECT, allow: {}, jwks, fetch: g.fetchStub }),
    ).toMatchObject({ reason: "state_mismatch" });
    const tampered = new Request(g.request.url, {
      headers: { cookie: `${g.request.headers.get("cookie")}x` },
    });
    expect(
      await handleCallback(config, tampered, { redirectUri: REDIRECT, allow: {}, jwks, fetch: g.fetchStub }),
    ).toMatchObject({ reason: "state_mismatch" });
  });

  it("reports a failed token exchange", async () => {
    const f = await flow({}, { tokenStatus: 400 });
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "token_exchange_failed",
    });
    const g = await flow();
    const r = await handleCallback(config, g.request, {
      redirectUri: REDIRECT,
      allow: {},
      jwks,
      fetch: (async () => {
        throw new Error("boom");
      }) as unknown as typeof fetch,
    });
    expect(r).toMatchObject({ reason: "token_exchange_failed" });
  });

  it("is not allowed when no group or list entry grants a role", async () => {
    const f = await flow({ groups: ["55555555-5555-5555-5555-555555555555"] });
    expect(await run(f, { groupRoles: { [GROUP_ADMIN]: "admin" } })).toMatchObject({
      ok: false,
      reason: "not_allowed",
    });
    const g = await flow();
    expect(await run(g, {})).toMatchObject({ ok: false, reason: "not_allowed" });
  });

  it("grants roles from an allow-list, case-insensitively on the email", async () => {
    const f = await flow({ groups: [] });
    const r = await run(f, { allowList: { "test.person@example.org": "admin" } });
    expect(r).toMatchObject({ ok: true, role: "admin" });
  });

  it("ranks the first mapped group as the primary role", async () => {
    const f = await flow({ groups: [GROUP_EDITOR, GROUP_ADMIN] });
    const r = await run(f, { groupRoles: { [GROUP_ADMIN]: "admin", [GROUP_EDITOR]: "editor" } });
    expect(r).toMatchObject({ ok: true, role: "admin" });
    if (r.ok) expect(r.user.roles).toEqual(["admin", "editor"]);
  });

  it("does not trust the email alone", async () => {
    const f = await flow({ groups: [] });
    expect(await run(f, { groupRoles: { [GROUP_ADMIN]: "admin" } })).toMatchObject({ reason: "not_allowed" });
  });

  it("treats group overage as no groups: denied unless the allow-list grants a role", async () => {
    const overage = {
      groups: undefined,
      _claim_names: { groups: "src1" },
      _claim_sources: { src1: { endpoint: "x" } },
    };
    const f = await flow(overage);
    expect(await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "not_allowed",
    });
    const g = await flow({ ...overage, groups: [GROUP_EDITOR] });
    expect(await run(g, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "not_allowed",
    });
    const h = await flow({ hasgroups: true });
    expect(await run(h, { groupRoles: { [GROUP_EDITOR]: "editor" } })).toMatchObject({
      ok: false,
      reason: "not_allowed",
    });
    const i = await flow(overage);
    expect(await run(i, { allowList: { "test.person@example.org": "editor" } })).toMatchObject({
      ok: true,
      role: "editor",
    });
  });

  it("ignores a hostile next value stored in the flow", async () => {
    const f = await flow({}, { next: "//evil.example" });
    const r = await run(f, { groupRoles: { [GROUP_EDITOR]: "editor" } });
    expect(r).toMatchObject({ ok: true, next: "/" });
  });
});

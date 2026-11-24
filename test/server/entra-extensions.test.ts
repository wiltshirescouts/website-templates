import { createLocalJWKSet, exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createAuthorisationRequest,
  type EntraConfig,
  EntraConfigError,
  handleCallback,
  readEntraConfig,
} from "../../src/server";

const TENANT = "00000000-0000-0000-0000-000000000000";
const CLIENT = "11111111-1111-1111-1111-111111111111";
const REDIRECT = "https://example.org/auth/callback";
const HOST = "http://localhost:8788";
const config: EntraConfig = {
  tenantId: TENANT,
  clientId: CLIENT,
  clientSecret: "test-client-secret",
  sessionSecret: "s".repeat(40),
};

let privateKey: CryptoKey;
let jwks: ReturnType<typeof createLocalJWKSet>;

beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  const jwk: JWK = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
  jwks = createLocalJWKSet({ keys: [jwk] });
});

async function run(
  cfg: EntraConfig,
  allow: Parameters<typeof handleCallback>[2]["allow"],
  start: { context?: string; prompt?: "select_account" } = {},
) {
  const req = await createAuthorisationRequest(cfg, { redirectUri: REDIRECT, next: "/account", ...start });
  const u = new URL(req.url);
  const issuer = `${cfg.authorityHost ?? "https://login.microsoftonline.com"}/${TENANT}/v2.0`;
  const idToken = await new SignJWT({
    tid: TENANT,
    oid: "oid-9",
    name: "Party Leader",
    email: "Leader@Example.org",
    preferred_username: "leader.upn@example.org",
    nonce: u.searchParams.get("nonce"),
  })
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(issuer)
    .setAudience(CLIENT)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(privateKey);
  const urls: string[] = [];
  const fetchStub = (async (url: string) => {
    urls.push(url);
    return Response.json({ id_token: idToken });
  }) as unknown as typeof fetch;
  const request = new Request(`${REDIRECT}?code=abc&state=${u.searchParams.get("state")}`, {
    headers: { cookie: req.cookie.split(";")[0] as string },
  });
  const result = await handleCallback(cfg, request, { redirectUri: REDIRECT, allow, jwks, fetch: fetchStub });
  return { result, urls, start: u };
}

describe("allow.resolve", () => {
  it("admits a tenant member with roles from the site's own store", async () => {
    const seen: unknown[] = [];
    const { result } = await run(config, {
      resolve: (who) => {
        seen.push(who);
        return ["leader"];
      },
    });
    expect(result).toMatchObject({ ok: true, role: "leader", user: { id: "oid-9", roles: ["leader"] } });
    expect(seen).toEqual([
      {
        id: "oid-9",
        name: "Party Leader",
        email: "Leader@Example.org",
        username: "leader.upn@example.org",
        groups: [],
      },
    ]);
  });
  it("adds to roles from groups and the allow-list without duplicating", async () => {
    const { result } = await run(config, {
      allowList: { "leader@example.org": "admin" },
      resolve: async () => ["leader", "admin"],
    });
    expect(result).toMatchObject({ ok: true, role: "admin", user: { roles: ["admin", "leader"] } });
  });
  it("is not_allowed when resolve returns nothing and no other rule matches", async () => {
    expect(await run(config, { resolve: () => null }).then((r) => r.result)).toMatchObject({
      ok: false,
      reason: "not_allowed",
    });
    expect(await run(config, { resolve: () => [] }).then((r) => r.result)).toMatchObject({
      ok: false,
      reason: "not_allowed",
    });
  });
});

describe("context and prompt", () => {
  it("round-trips the context through the signed state cookie", async () => {
    const { result } = await run(config, { resolve: () => ["leader"] }, { context: "link" });
    expect(result).toMatchObject({ ok: true, context: "link", next: "/account" });
  });
  it("leaves context out when none was given", async () => {
    const { result } = await run(config, { resolve: () => ["leader"] });
    expect(result.ok && "context" in result).toBe(false);
  });
  it("sends prompt to Microsoft only when asked", async () => {
    expect(
      (await run(config, { resolve: () => ["x"] }, { prompt: "select_account" })).start.searchParams.get(
        "prompt",
      ),
    ).toBe("select_account");
    expect((await run(config, { resolve: () => ["x"] })).start.searchParams.has("prompt")).toBe(false);
  });
});

describe("authorityHost", () => {
  const local = { ...config, authorityHost: HOST };
  it("uses the host for the authorise, token and issuer checks", async () => {
    const { result, urls, start } = await run(local, { resolve: () => ["leader"] });
    expect(start.origin).toBe(HOST);
    expect(urls).toEqual([`${HOST}/${TENANT}/oauth2/v2.0/token`]);
    expect(result.ok).toBe(true);
  });
  it("rejects a token issued by the default host when a custom host is set", async () => {
    // A token whose issuer is the real Microsoft host must not validate against the fake one.
    const req = await createAuthorisationRequest(local, { redirectUri: REDIRECT });
    const u = new URL(req.url);
    const idToken = await new SignJWT({
      tid: TENANT,
      oid: "o",
      email: "a@b.org",
      nonce: u.searchParams.get("nonce"),
    })
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer(`https://login.microsoftonline.com/${TENANT}/v2.0`)
      .setAudience(CLIENT)
      .setExpirationTime("10m")
      .sign(privateKey);
    const r = await handleCallback(
      local,
      new Request(`${REDIRECT}?code=a&state=${u.searchParams.get("state")}`, {
        headers: { cookie: req.cookie.split(";")[0] as string },
      }),
      {
        redirectUri: REDIRECT,
        allow: { resolve: () => ["x"] },
        jwks,
        fetch: (async () => Response.json({ id_token: idToken })) as unknown as typeof fetch,
      },
    );
    expect(r).toMatchObject({ ok: false, reason: "invalid_token" });
  });
  it("is read from ENTRA_AUTHORITY_HOST and validated", () => {
    const env = {
      ENTRA_TENANT_ID: TENANT,
      ENTRA_CLIENT_ID: CLIENT,
      ENTRA_CLIENT_SECRET: "x",
      SESSION_SECRET: "s".repeat(32),
    };
    expect(readEntraConfig({ ...env, ENTRA_AUTHORITY_HOST: `${HOST}/` }).authorityHost).toBe(HOST);
    expect(readEntraConfig(env).authorityHost).toBeUndefined();
    for (const bad of ["http://evil.example", "not a url", "https://login.example/tenant"]) {
      expect(() => readEntraConfig({ ...env, ENTRA_AUTHORITY_HOST: bad })).toThrow(EntraConfigError);
    }
  });
});

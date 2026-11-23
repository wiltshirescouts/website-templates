import { describe, expect, it } from "vitest";
import { clearSessionCookie, createSessionCookie, readSession, safeNext } from "../../src/server";

const SECRET = "s".repeat(40);
const user = { id: "oid-1", name: "Test Person", email: "test@example.org", role: "editor" };
const requestWith = (setCookie: string) =>
  new Request("https://example.org/", { headers: { cookie: setCookie.split(";")[0] as string } });

describe("session cookie", () => {
  it("sets hardened attributes and defaults to eight hours", async () => {
    const c = await createSessionCookie(user, SECRET);
    for (const a of ["ws-session=", "HttpOnly", "Secure", "SameSite=Lax", "Path=/", `Max-Age=${8 * 3600}`])
      expect(c).toContain(a);
  });
  it("round-trips", async () => {
    const s = await readSession(requestWith(await createSessionCookie(user, SECRET)), SECRET);
    expect(s).toMatchObject(user);
    expect(s?.exp).toBeGreaterThan(Date.now() / 1000);
  });
  it("honours a custom lifetime", async () => {
    expect(await createSessionCookie(user, SECRET, { maxAgeSeconds: 60 })).toContain("Max-Age=60");
  });
  it("rejects the wrong secret", async () => {
    expect(
      await readSession(requestWith(await createSessionCookie(user, SECRET)), "t".repeat(40)),
    ).toBeNull();
  });
  it("rejects a tampered payload and signature", async () => {
    const c = (await createSessionCookie(user, SECRET)).split(";")[0] as string;
    const [name, value] = c.split("=") as [string, string];
    const [body, sig] = value.split(".") as [string, string];
    const forged = btoa(JSON.stringify({ ...user, role: "admin", exp: 9999999999 })).replace(/=+$/, "");
    expect(
      await readSession(
        new Request("https://example.org/", { headers: { cookie: `${name}=${forged}.${sig}` } }),
        SECRET,
      ),
    ).toBeNull();
    expect(
      await readSession(
        new Request("https://example.org/", { headers: { cookie: `${name}=${body}.${sig.slice(0, -2)}AA` } }),
        SECRET,
      ),
    ).toBeNull();
    expect(
      await readSession(
        new Request("https://example.org/", { headers: { cookie: `${name}=garbage` } }),
        SECRET,
      ),
    ).toBeNull();
  });
  it("rejects an expired session", async () => {
    const c = await createSessionCookie(user, SECRET, {
      maxAgeSeconds: 60,
      now: new Date(Date.now() - 120_000),
    });
    expect(await readSession(requestWith(c), SECRET)).toBeNull();
  });
  it("returns null with no cookie, and clears with Max-Age=0", async () => {
    expect(await readSession(new Request("https://example.org/"), SECRET)).toBeNull();
    expect(clearSessionCookie()).toMatch(/^ws-session=; .*Max-Age=0/);
  });
});

describe("safeNext", () => {
  const origin = "https://example.org";
  it.each([
    ["/", "/"],
    ["/dashboard", "/dashboard"],
    ["/a/b?x=1&y=2#top", "/a/b?x=1&y=2#top"],
  ])("keeps %s", (input, out) => expect(safeNext(input, origin)).toBe(out));

  it.each([
    ["//evil.com"],
    ["/\\evil.com"],
    ["\\\\evil.com"],
    ["https://evil.com"],
    ["http://example.org/x"],
    ["javascript:alert(1)"],
    ["%2f%2fevil.com"],
    ["/%2fevil.com"],
    ["/%5cevil.com"],
    ["/%09/evil.com"],
    ["/a\nb"],
    ["/a\u0000b"],
    ["/%0d%0aSet-Cookie:x"],
    ["evil.com"],
    ["/%zz"],
    [""],
  ])("falls back for %j", (input) => expect(safeNext(input, origin)).toBe("/"));

  it("falls back for null, undefined and over-long values", () => {
    expect(safeNext(null, origin)).toBe("/");
    expect(safeNext(undefined, origin)).toBe("/");
    expect(safeNext(`/${"a".repeat(3000)}`, origin)).toBe("/");
  });
});

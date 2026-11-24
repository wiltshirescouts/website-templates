import { describe, expect, it } from "vitest";
import {
  consumeMagicLink,
  createMagicLink,
  isPlausibleEmail,
  issueMagicLink,
  looksLikeMagicToken,
  type MagicLinkRecord,
  type MagicLinkStore,
} from "../../src/server";

function memoryStore() {
  const rows = new Map<string, MagicLinkRecord & { used?: boolean }>();
  const store: MagicLinkStore = {
    async save(hash, record) {
      rows.set(hash, record);
    },
    async consume(hash, now) {
      const r = rows.get(hash);
      if (!r || r.used || r.expiresAt <= now) return null;
      r.used = true;
      return r;
    },
  };
  return { store, rows };
}
const ORIGIN = "https://va.example.org";

describe("magic links", () => {
  it("stores only the hash and returns the token once", async () => {
    const { store, rows } = memoryStore();
    const made = await createMagicLink(
      { email: "  Leader@Example.org ", purpose: "signin", origin: ORIGIN },
      store,
    );
    expect(made).not.toBeNull();
    expect(looksLikeMagicToken(made?.token)).toBe(true);
    expect([...rows.keys()].some((k) => k === made?.token)).toBe(false);
    expect(made?.record).toMatchObject({ email: "leader@example.org", purpose: "signin", next: "/" });
  });
  it("is single use", async () => {
    const { store } = memoryStore();
    const made = await createMagicLink(
      { email: "a@b.org", purpose: "signin", next: "/visits", origin: ORIGIN },
      store,
    );
    const t = made?.token as string;
    expect(await consumeMagicLink(t, store)).toMatchObject({ email: "a@b.org", next: "/visits" });
    expect(await consumeMagicLink(t, store)).toBeNull();
  });
  it("expires after the lifetime (15 minutes by default)", async () => {
    const { store } = memoryStore();
    const now = 1_000_000;
    const made = await createMagicLink({ email: "a@b.org", purpose: "signin", origin: ORIGIN, now }, store);
    const t = made?.token as string;
    expect(await consumeMagicLink(t, store, now + 15 * 60 * 1000 + 1)).toBeNull();
    const again = await createMagicLink({ email: "a@b.org", purpose: "signin", origin: ORIGIN, now }, store);
    expect(await consumeMagicLink(again?.token as string, store, now + 14 * 60 * 1000)).not.toBeNull();
  });
  it("never lets next leave the site", async () => {
    const { store } = memoryStore();
    for (const next of ["https://evil.example/", "//evil.example", "/\\evil.example"]) {
      const made = await createMagicLink(
        { email: "a@b.org", purpose: "signin", next, origin: ORIGIN },
        store,
      );
      expect(made?.record.next).toBe("/");
    }
  });
  it("can issue a token without a store and carries the subject", async () => {
    const issued = await issueMagicLink({
      email: "a@b.org",
      purpose: "add_email",
      subject: "user-1",
      origin: ORIGIN,
    });
    expect(issued?.record).toMatchObject({ purpose: "add_email", subject: "user-1" });
    expect(issued?.tokenHash).not.toBe(issued?.token);
    const { store, rows } = memoryStore();
    await store.save(issued?.tokenHash as string, issued?.record as MagicLinkRecord);
    expect(await consumeMagicLink(issued?.token as string, store)).toMatchObject({ subject: "user-1" });
    expect(rows.size).toBe(1);
  });
  it("rejects implausible addresses and malformed tokens before using the store", async () => {
    const { store } = memoryStore();
    expect(
      await createMagicLink({ email: "not-an-email", purpose: "signin", origin: ORIGIN }, store),
    ).toBeNull();
    expect(isPlausibleEmail("a b@c.org")).toBe(false);
    expect(await consumeMagicLink("short", store)).toBeNull();
    expect(await consumeMagicLink("x".repeat(43), store)).toBeNull();
  });
});

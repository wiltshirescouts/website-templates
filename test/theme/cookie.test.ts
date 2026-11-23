import { describe, expect, it } from "vitest";
import { readPreference, resolve, type ThemeEnv, writePreference } from "../../src/theme/cookie";

function fakeEnv(hostname: string, cookie = ""): ThemeEnv & { jar: string[]; store: Map<string, string> } {
  const store = new Map<string, string>();
  const jar: string[] = [];
  return {
    jar,
    store,
    hostname,
    cookie: { get: () => cookie, set: (v) => jar.push(v) },
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
      removeItem: (k) => void store.delete(k),
    },
  };
}

describe("colour mode cookie", () => {
  it("writes the shared cookie with domain and Secure on wiltshirescouts.org.uk hosts", () => {
    const env = fakeEnv("go.wiltshirescouts.org.uk");
    writePreference("dark", env);
    expect(env.jar[0]).toBe(
      "ws-theme=dark; Max-Age=31536000; Path=/; SameSite=Lax; Domain=.wiltshirescouts.org.uk; Secure",
    );
  });

  it("omits Domain and Secure elsewhere and falls back to localStorage", () => {
    const env = fakeEnv("localhost");
    writePreference("light", env);
    expect(env.jar[0]).toBe("ws-theme=light; Max-Age=31536000; Path=/; SameSite=Lax");
    expect(env.store.get("ws-theme")).toBe("light");
    expect(readPreference(fakeEnvWith(env))).toBe("light");
  });

  it("auto deletes the cookie and the stored value", () => {
    const env = fakeEnv("wiltshirescouts.org.uk");
    env.store.set("ws-theme", "dark");
    writePreference("auto", env);
    expect(env.jar[0]).toContain("Max-Age=0");
    expect(env.store.has("ws-theme")).toBe(false);
  });

  it("reads the cookie first, ignores junk values, and defaults to auto", () => {
    expect(readPreference(fakeEnv("x.example", "a=1; ws-theme=dark; b=2"))).toBe("dark");
    expect(readPreference(fakeEnv("x.example", "ws-theme=purple"))).toBe("auto");
    expect(readPreference(fakeEnv("x.example"))).toBe("auto");
  });

  it("does not match a look-alike host", () => {
    const env = fakeEnv("evilwiltshirescouts.org.uk");
    writePreference("dark", env);
    expect(env.jar[0]).not.toContain("Domain");
  });

  it("resolves auto from the system setting", () => {
    expect(resolve("auto", true)).toBe("dark");
    expect(resolve("auto", false)).toBe("light");
    expect(resolve("light", true)).toBe("light");
    expect(resolve("dark", false)).toBe("dark");
  });
});

function fakeEnvWith(env: ReturnType<typeof fakeEnv>): ThemeEnv {
  return { ...env, cookie: { get: () => "", set: () => {} } };
}

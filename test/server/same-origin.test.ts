import { describe, expect, it } from "vitest";
import { requireSameOrigin } from "../../src/server";

const url = "https://va.example.org/api/visits";
const json = { "content-type": "application/json" };
const req = (method: string, headers: Record<string, string> = {}) => new Request(url, { method, headers });

describe("requireSameOrigin", () => {
  it("lets reads through", () => {
    expect(requireSameOrigin(req("GET"))).toBe(true);
    expect(requireSameOrigin(req("GET", { origin: "https://evil.example" }))).toBe(true);
  });
  it("accepts a same-origin JSON write", () => {
    expect(requireSameOrigin(req("POST", { ...json, origin: "https://va.example.org" }))).toBe(true);
  });
  it("rejects a cross-origin write even with JSON", () => {
    expect(requireSameOrigin(req("POST", { ...json, origin: "https://evil.example" }))).toBe(false);
  });
  it("uses Sec-Fetch-Site when Origin is absent", () => {
    expect(requireSameOrigin(req("PUT", { ...json, "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(requireSameOrigin(req("PUT", { ...json, "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(requireSameOrigin(req("PUT", json))).toBe(false);
  });
  it("rejects a form-encoded write unless the custom header is present", () => {
    const o = { origin: "https://va.example.org" };
    expect(
      requireSameOrigin(req("POST", { ...o, "content-type": "application/x-www-form-urlencoded" })),
    ).toBe(false);
    expect(
      requireSameOrigin(
        req("POST", { ...o, "content-type": "multipart/form-data; boundary=x", "x-ws-request": "1" }),
      ),
    ).toBe(true);
    expect(
      requireSameOrigin(req("POST", { ...o, "content-type": "multipart/form-data; boundary=x" }), {
        requireJsonOrHeader: false,
      }),
    ).toBe(true);
  });
  it("allows listed extra origins", () => {
    const r = req("POST", { ...json, origin: "https://other.example.org" });
    expect(requireSameOrigin(r)).toBe(false);
    expect(requireSameOrigin(r, { allowedOrigins: ["https://other.example.org"] })).toBe(true);
  });
});

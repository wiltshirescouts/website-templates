import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BREVO_ERROR_MESSAGES,
  BREVO_URL,
  checkStatus,
  deliver,
  EmailConfigError,
  type EmailMessage,
  EmailNetworkError,
  EmailRejectedError,
  EmailTransientError,
  placeholdersIn,
  type RenderContext,
  renderEmail,
  sendEmail,
  sendTestEmail,
} from "../../src/server";

const KEY = "xkeysib-fictional-test-key-123";
const env = { BREVO_API_KEY: KEY };
const msg: EmailMessage = {
  to: "person@example.org",
  sender: { email: "hello@example.org", name: "Example Scouts" },
  subject: "Hi",
  text: "Hi",
  html: "<p>Hi</p>",
};
const ctx: RenderContext = {
  origin: "https://example.org",
  organisationName: "Example Scouts",
  contactEmail: "hello@example.org",
};
const noSleep = vi.fn(async (_ms: number) => undefined);

const respond = (...rs: (Response | Error)[]) => {
  const f = vi.fn(async () => {
    const r = rs.shift() ?? new Response("{}", { status: 201 });
    if (r instanceof Error) throw r;
    return r;
  });
  return f as unknown as typeof fetch & ReturnType<typeof vi.fn>;
};

afterEach(() => {
  vi.restoreAllMocks();
  noSleep.mockClear();
});

describe("deliver and sendEmail", () => {
  it("posts to Brevo with the key in a header only", async () => {
    const f = respond(new Response('{"messageId":"x"}', { status: 201 }));
    await deliver(env, msg, { fetch: f, sleep: noSleep });
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(BREVO_URL);
    expect((init.headers as Record<string, string>)["api-key"]).toBe(KEY);
    expect(String(init.body)).not.toContain(KEY);
    expect(JSON.parse(String(init.body))).toMatchObject({
      to: [{ email: "person@example.org" }],
      sender: msg.sender,
      htmlContent: "<p>Hi</p>",
    });
  });

  it.each([
    [401, EmailRejectedError, "rejected"],
    [403, EmailRejectedError, "rejected"],
    [400, EmailRejectedError, "rejected"],
  ])("maps %i to %s without retrying", async (status, cls, errorClass) => {
    const f = respond(new Response(`{"message":"bad ${KEY}"}`, { status }));
    const e = await deliver(env, msg, { fetch: f, sleep: noSleep }).catch((x) => x);
    expect(e).toBeInstanceOf(cls);
    expect(e.errorClass).toBe(errorClass);
    expect(f).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(e)).not.toContain(KEY);
    expect(e.message).not.toContain(KEY);
  });

  it("retries a 429 once, waiting for Retry-After, then reports rate_limited", async () => {
    const f = respond(
      new Response("{}", { status: 429, headers: { "retry-after": "2" } }),
      new Response("{}", { status: 429, headers: { "retry-after": "2" } }),
    );
    const e = await deliver(env, msg, { fetch: f, sleep: noSleep }).catch((x) => x);
    expect(e).toBeInstanceOf(EmailTransientError);
    expect(e.errorClass).toBe("rate_limited");
    expect(f).toHaveBeenCalledTimes(2);
    expect(noSleep).toHaveBeenCalledWith(2000);
  });

  it("caps an excessive Retry-After", async () => {
    const f = respond(new Response("{}", { status: 429, headers: { "retry-after": "3600" } }));
    await deliver(env, msg, { fetch: f, sleep: noSleep });
    expect(noSleep).toHaveBeenCalledWith(10_000);
  });

  it("retries a 5xx once and can then succeed", async () => {
    const f = respond(new Response("{}", { status: 503 }), new Response("{}", { status: 201 }));
    await deliver(env, msg, { fetch: f, sleep: noSleep });
    expect(f).toHaveBeenCalledTimes(2);
    const g = respond(new Response("{}", { status: 500 }), new Response("{}", { status: 502 }));
    expect((await deliver(env, msg, { fetch: g, sleep: noSleep }).catch((x) => x)).errorClass).toBe("server");
  });

  it("maps a thrown fetch to network after one retry", async () => {
    const f = respond(new TypeError(`failed ${KEY}`), new TypeError("failed"));
    const e = await deliver(env, msg, { fetch: f, sleep: noSleep }).catch((x) => x);
    expect(e).toBeInstanceOf(EmailNetworkError);
    expect(e.errorClass).toBe("network");
    expect(f).toHaveBeenCalledTimes(2);
    expect(e.message).not.toContain(KEY);
  });

  it("throws not_configured without a key, with no network call", async () => {
    const f = respond();
    await expect(deliver({}, msg, { fetch: f })).rejects.toBeInstanceOf(EmailConfigError);
    await expect(deliver({ BREVO_API_KEY: "  " }, msg, { fetch: f })).rejects.toBeInstanceOf(
      EmailConfigError,
    );
    expect(f).not.toHaveBeenCalled();
  });

  it("sendEmail never throws and never logs the key or address", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await sendEmail(env, msg, { fetch: respond(new Response("{}", { status: 201 })) })).toEqual({
      sent: true,
    });
    expect(await sendEmail(env, msg, { fetch: respond(new Response(`${KEY}`, { status: 401 })) })).toEqual({
      sent: false,
      errorClass: "rejected",
    });
    expect(await sendEmail({}, msg)).toEqual({ sent: false, skipped: true, errorClass: "not_configured" });
    const logged = JSON.stringify([...log.mock.calls, ...err.mock.calls]);
    expect(logged).not.toContain(KEY);
    expect(logged).not.toContain("person@example.org");
  });

  it("has the exact plain-English messages", () => {
    expect(BREVO_ERROR_MESSAGES).toEqual({
      not_configured: "Brevo is not set up, so no email was sent.",
      rejected:
        "Brevo did not accept the email. Check the API key, and that the sender address or domain is verified in Brevo.",
      rate_limited: "Brevo is limiting requests right now. Try again in a minute.",
      server: "Brevo had a problem on its side. Try again in a minute.",
      network: "Could not reach Brevo. Try again in a minute.",
    });
  });
});

describe("sendTestEmail", () => {
  it("sends only to the given address", async () => {
    const f = respond(new Response("{}", { status: 201 }));
    const r = await sendTestEmail(
      env,
      { to: "me@example.org", toName: "Me", sender: msg.sender, context: ctx },
      { fetch: f },
    );
    expect(r.sent).toBe(true);
    const body = JSON.parse(
      String(((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit])[1].body),
    );
    expect(body.to).toEqual([{ email: "me@example.org", name: "Me" }]);
    expect(body.subject).toBe("Test email from Example Scouts");
  });
  it("refuses a malformed or multiple address without a network call", async () => {
    const f = respond();
    for (const to of ["not-an-address", "a@example.org, b@example.org", ""]) {
      expect(await sendTestEmail(env, { to, sender: msg.sender, context: ctx }, { fetch: f })).toMatchObject({
        sent: false,
      });
    }
    expect(f).not.toHaveBeenCalled();
  });
});

describe("checkStatus", () => {
  const now = new Date("2030-01-01T00:00:00Z");
  it("makes no network call without a key", async () => {
    const f = respond();
    expect(await checkStatus({}, { fetch: f, now })).toEqual({
      configured: false,
      ok: false,
      senders: [],
      checkedAt: "2030-01-01T00:00:00.000Z",
      errorClass: "not_configured",
    });
    expect(f).not.toHaveBeenCalled();
  });
  it("lists senders when the key works", async () => {
    const f = respond(
      Response.json({
        senders: [{ id: 1, name: "Example", email: "hello@example.org", active: true }, { id: 2 }],
      }),
    );
    const s = await checkStatus(env, { fetch: f, now });
    expect(s).toMatchObject({
      configured: true,
      ok: true,
      senders: [{ name: "Example", email: "hello@example.org", active: true }],
    });
    expect(((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string])[0]).toBe(
      "https://api.brevo.com/v3/senders",
    );
  });
  it("reports a rejected key and a network failure", async () => {
    expect(
      await checkStatus(env, { fetch: respond(new Response("{}", { status: 401 })), now }),
    ).toMatchObject({ configured: true, ok: false, errorClass: "rejected" });
    expect(await checkStatus(env, { fetch: respond(new TypeError("x")), now })).toMatchObject({
      ok: false,
      errorClass: "network",
    });
  });
});

describe("renderEmail", () => {
  const tpl = {
    subject: "Hello {{name}}",
    body: "Dear {{name}},\n\nSee https://example.org/path?a=1&b=2. Thanks!\n\nOpen {{link}}\n{{unknown}}Bye",
  };

  it("escapes values and the subject stays single-line", () => {
    const r = renderEmail(
      { subject: "Hi {{name}}", body: "Name: {{name}}" },
      { name: '<b>"Eve"</b>\nX' },
      ctx,
    );
    expect(r.html).toContain("&lt;b&gt;&quot;Eve&quot;&lt;/b&gt;<br>X");
    expect(r.html).not.toContain("<b>");
    expect(r.subject).toBe('Hi <b>"Eve"</b> X');
    expect(r.text).toContain('Name: <b>"Eve"</b>\nX');
  });

  it("makes paragraphs, linkifies bare URLs leaving trailing punctuation outside, and links only {{link}} values", () => {
    const r = renderEmail(tpl, { name: "https://evil.example", link: "https://example.org/go" }, ctx);
    expect(r.html.match(/<p /g)?.length).toBe(3);
    expect(r.html).toContain('href="https://example.org/path?a=1&amp;b=2"');
    expect(r.html).toContain("</a>. Thanks!");
    expect(r.html).toContain('href="https://example.org/go"');
    expect(r.html).not.toContain('href="https://evil.example"');
    expect(r.text).toContain("Dear https://evil.example,");
  });

  it("renders unknown placeholders as empty and does not link non-http values", () => {
    const r = renderEmail(tpl, { link: "javascript:alert(1)" }, ctx);
    expect(r.text).toContain("Open javascript:alert(1)\nBye");
    expect(r.html).not.toContain('href="javascript:');
  });

  it("uses the logo URL, the contact footer and the plain-text signature", () => {
    const a = renderEmail(tpl, {}, ctx);
    expect(a.html).toContain("https://example.org/brand/logos/scouts-wiltshire-linear-white.png");
    expect(a.html).toContain("mailto:hello@example.org");
    expect(a.text.endsWith("\n--\nExample Scouts\nhello@example.org\n")).toBe(true);
    const b = renderEmail(tpl, {}, {
      ...ctx,
      origin: undefined,
      logoUrl: "https://cdn.example.org/logo.png",
    } as RenderContext);
    expect(b.html).toContain("https://cdn.example.org/logo.png");
  });

  it("lists placeholders once, in order", () => {
    expect(placeholdersIn("{{a}} {{ b }} {{a}} {x} {{c-d}}")).toEqual(["a", "b"]);
  });
});

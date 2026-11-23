// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Home } from "lucide-react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { SiteFooter, SiteHeader, ThemeProvider } from "../../src";

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never;
});
afterEach(() => {
  cleanup();
  document.cookie = "ws-theme=; Max-Age=0; Path=/";
  localStorage.clear();
});

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe("SiteHeader", () => {
  it("rejects a title over 60 characters at runtime in development", () => {
    const long = "x".repeat(61);
    expect(() => wrap(<SiteHeader title={long} account={{ variant: "colour-only" }} />)).toThrow(/maximum is 60/);
  });

  it("has no menu button when there is no nav", () => {
    wrap(<SiteHeader title="Site" account={{ variant: "colour-only" }} />);
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
  });

  it("has a skip link and a labelled nav", () => {
    wrap(<SiteHeader title="Site" nav={[{ label: "Home", href: "/", icon: Home, current: true }]} account={{ variant: "colour-only" }} />);
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe("#main");
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("AccountMenu", () => {
  it("moves focus in on open, closes on Escape and returns focus", () => {
    wrap(<SiteHeader title="Site" account={{ variant: "signed-out", signInHref: "/sign-in" }} />);
    const btn = screen.getByRole("button", { name: "Account and colour mode" });
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toContain("Sign in");
    fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(btn);
  });

  it("colour-only variant is named for colour mode and has no sign-in", () => {
    wrap(<SiteHeader title="Site" account={{ variant: "colour-only" }} />);
    expect(screen.getByRole("button", { name: "Colour mode" })).toBeTruthy();
    expect(screen.queryByText("Sign in")).toBeNull();
  });

  it("signed-in variant shows name, email, role and sign out", () => {
    wrap(<SiteHeader title="Site" account={{ variant: "signed-in", name: "Alex Example", email: "alex@example.org", role: "Registrar", profileHref: "/me", signOutHref: "/out" }} />);
    expect(screen.getByText("alex@example.org")).toBeTruthy();
    expect(screen.getByText("Registrar")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Sign out" }).getAttribute("href")).toBe("/out");
  });

  it("choosing Dark sets data-theme and saves the preference; Auto clears it", () => {
    wrap(<SiteHeader title="Site" account={{ variant: "colour-only" }} />);
    fireEvent.click(screen.getByRole("radio", { name: /Dark/ }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("ws-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("radio", { name: /Auto/ }));
    expect(localStorage.getItem("ws-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("SiteFooter", () => {
  it("links to the privacy policy and shows the sign-off", () => {
    render(<SiteFooter version="v1.2.3" />);
    expect(screen.getByRole("link", { name: /Privacy policy/ }).getAttribute("href")).toBe("https://www.wiltshirescouts.org.uk/who-we-are/data-protection/");
    expect(screen.getByText("#PlaceToBelong")).toBeTruthy();
    expect(screen.getByText("v1.2.3")).toBeTruthy();
  });
});

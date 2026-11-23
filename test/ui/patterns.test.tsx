// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Lock } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BrevoStatus,
  MicrosoftSignInButton,
  PlaceholderChips,
  SignInCard,
  SignInNotAllowed,
  TripCard,
} from "../../src";

afterEach(cleanup);

describe("MicrosoftSignInButton", () => {
  it("is a link named 'Sign in with Microsoft' with the mark hidden from assistive tech", () => {
    const { container } = render(<MicrosoftSignInButton href="/auth/login?next=%2Femails" />);
    const link = screen.getByRole("link", { name: "Sign in with Microsoft" });
    expect(link.getAttribute("href")).toBe("/auth/login?next=%2Femails");
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
  it("renders a button when there is no href", () => {
    render(<MicrosoftSignInButton>Sign in</MicrosoftSignInButton>);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  });
});

describe("SignInCard", () => {
  it("names the destination and never renders a password field", () => {
    const { container } = render(<SignInCard destination="Email templates" signInHref="#" />);
    expect(screen.getByText(/To continue to/).textContent).toContain("Email templates");
    expect(container.querySelector("input")).toBeNull();
  });
  it("shows the not-allowed error as an alert with a retry link", () => {
    render(<SignInNotAllowed account="a@example.com" signInHref="#" contactEmail="d@example.org" />);
    expect(screen.getByRole("alert").textContent).toContain("a@example.com");
    expect(screen.getByRole("link", { name: "Try a different Microsoft account" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "d@example.org" }).getAttribute("href")).toBe(
      "mailto:d@example.org",
    );
  });
});

describe("TripCard", () => {
  it("has one link, on the heading, to the trip", () => {
    render(
      <TripCard
        title="Jamboree"
        href="/jamboree"
        chips={[{ label: "Adult sign-up: closed", icon: Lock, tone: "outline" }]}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe("/jamboree");
    expect(screen.getByRole("heading", { name: "Jamboree" })).toBeTruthy();
    expect(screen.getByText("Adult sign-up: closed")).toBeTruthy();
  });
});

describe("BrevoStatus", () => {
  it("connected shows sender, verified and last check", () => {
    render(
      <BrevoStatus
        state="connected"
        sender="S <s@example.org>"
        senderVerified
        lastCheck="today"
        checkHref="#"
      />,
    );
    expect(screen.getByText("Connected")).toBeTruthy();
    expect(screen.getByText(/s@example.org.*verified/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Check connection" })).toBeTruthy();
  });
  it("not set up shows a warning alert and no connected chip", () => {
    render(
      <BrevoStatus state="not-configured" notConfigured={{ title: "Not set up", message: "No key." }} />,
    );
    expect(screen.getByRole("alert").textContent).toContain("Not set up");
    expect(screen.queryByText("Connected")).toBeNull();
  });
});

describe("PlaceholderChips", () => {
  it("calls onInsert with the braced token", () => {
    const onInsert = vi.fn();
    render(
      <PlaceholderChips
        placeholders={[{ token: "recipientName", label: "Recipient name" }]}
        onInsert={onInsert}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Insert Recipient name" }));
    expect(onInsert).toHaveBeenCalledWith(
      "{{recipientName}}",
      expect.objectContaining({ token: "recipientName" }),
    );
  });
});

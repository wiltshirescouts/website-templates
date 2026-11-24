// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Plane } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Alert,
  BackLink,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  EnvironmentBanner,
  Input,
  MagicLinkConfirm,
  MagicLinkForm,
  MagicLinkSent,
  Main,
  OrDivider,
  PageHeader,
  SignInCard,
  SiteFooter,
} from "../../src";

afterEach(cleanup);

describe("SiteFooter contact", () => {
  it("shows the contact line before the links, with a decorative icon", () => {
    const { container } = render(
      <SiteFooter
        contact={
          <>
            Questions? Email <a href="mailto:a@b.org">a@b.org</a>
          </>
        }
      />,
    );
    expect(screen.getByRole("link", { name: "a@b.org" }).getAttribute("href")).toBe("mailto:a@b.org");
    expect(container.querySelector(".footer-contact svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(
      container
        .querySelector(".footer-contact")
        ?.compareDocumentPosition(container.querySelector(".footer-row") as Node),
    ).toBe(4);
  });
  it("leaves the line out when there is none", () => {
    const { container } = render(<SiteFooter />);
    expect(container.querySelector(".footer-contact")).toBeNull();
  });
});

describe("Main width", () => {
  it("is the default, medium or narrow container (and `narrow` still works)", () => {
    const cls = (el: React.ReactElement) => render(el).container.querySelector("main")?.className;
    expect(cls(<Main>x</Main>)).toBe("page-container");
    cleanup();
    expect(cls(<Main width="medium">x</Main>)).toContain("page-container-medium");
    cleanup();
    expect(cls(<Main width="narrow">x</Main>)).toContain("page-container-narrow");
    cleanup();
    expect(cls(<Main narrow>x</Main>)).toContain("page-container-narrow");
  });
});

describe("PageHeader", () => {
  it("adds an eyebrow above the title and meta below the intro", () => {
    const { container } = render(
      <PageHeader title="Part A" eyebrow="Visit WSVA-2027-0001" intro="Tell us." meta={<span>Draft</span>} />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Part A" })).toBeTruthy();
    expect(container.querySelector(".page-header__eyebrow")?.textContent).toBe("Visit WSVA-2027-0001");
    expect(container.querySelector(".page-header__meta")?.textContent).toBe("Draft");
  });
  it("renders BackLink as a link with a decorative arrow", () => {
    const { container } = render(<BackLink href="/visits">Back to all visits</BackLink>);
    expect(screen.getByRole("link", { name: "Back to all visits" }).getAttribute("href")).toBe("/visits");
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Alert", () => {
  it("takes a custom icon, a neutral kind and a level-4 heading", () => {
    const { container } = render(
      <Alert kind="neutral" title="Heads up" headingLevel={4} icon={Plane}>
        <p>Body</p>
      </Alert>,
    );
    expect(container.querySelector(".alert-neutral")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 4, name: "Heads up" })).toBeTruthy();
    expect(container.querySelector("svg.lucide-plane")).toBeTruthy();
  });
  it("keeps the kind's icon when none is given", () => {
    const { container } = render(<Alert kind="success" title="Saved" />);
    expect(container.querySelector("svg.lucide-circle-check, svg.lucide-check-circle-2")).toBeTruthy();
  });
});

describe("Button variants", () => {
  it.each([
    ["secondary", "btn-secondary"],
    ["link", "btn-link"],
    ["destructiveOutline", "btn-destructive-outline"],
  ] as const)("%s adds %s", (variant, cls) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain(cls);
  });
  it("has a small size and defaults to type=button", () => {
    render(<Button size="sm">Go</Button>);
    const b = screen.getByRole("button", { name: "Go" });
    expect(b.className).toContain("btn-sm");
    expect(b.getAttribute("type")).toBe("button");
  });
});

describe("Card parts", () => {
  it("composes header, title, description and footer; tone adds a class", () => {
    const { container } = render(
      <Card tone="accent">
        <CardHeader>
          <CardTitle as="h3" icon={<Plane aria-hidden="true" />}>
            Trip
          </CardTitle>
          <CardDescription>Details</CardDescription>
        </CardHeader>
        <CardFooter>Actions</CardFooter>
      </Card>,
    );
    expect(container.querySelector(".card--accent")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Trip" })).toBeTruthy();
    expect(container.querySelector(".card__description")?.textContent).toBe("Details");
    expect(container.querySelector(".card__footer")?.textContent).toBe("Actions");
  });
});

describe("Input width", () => {
  it.each(["sm", "md", "lg", "xl"] as const)("%s adds input-%s", (w) => {
    const { container } = render(<Input width={w} aria-label="x" />);
    expect(container.querySelector("input")?.className).toContain(`input-${w}`);
  });
});

describe("EnvironmentBanner and EmptyState", () => {
  it("announces a banner as a note", () => {
    render(<EnvironmentBanner>Development mode</EnvironmentBanner>);
    expect(screen.getByRole("note").textContent).toBe("Development mode");
  });
  it("shows a heading, text and actions; dashed is a modifier", () => {
    const { container } = render(
      <EmptyState icon={Plane} title="No visits yet" dashed actions={<a href="/new">Start</a>}>
        <p>Start your first.</p>
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "No visits yet" })).toBeTruthy();
    expect(container.querySelector(".empty-state--dashed")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start" })).toBeTruthy();
    expect(container.querySelector(".empty-state__icon svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("SignInCard with other ways in", () => {
  it("renders alternatives under the Microsoft button and can be a section", () => {
    const { container } = render(
      <SignInCard signInHref="/auth/entra/start" as="section">
        <OrDivider />
        <p>Other way</p>
      </SignInCard>,
    );
    expect(container.querySelector("main")).toBeNull();
    expect(container.querySelector("section.signin-wrap")).toBeTruthy();
    const order = [...container.querySelectorAll(".btn-ms, .or-divider, .card__body > p")].map(
      (e) => e.className || e.tagName,
    );
    expect(order.indexOf("btn-ms")).toBeLessThan(order.indexOf("or-divider"));
    expect(screen.getByText("or")).toBeTruthy();
  });
});

describe("MagicLinkForm", () => {
  it("submits the trimmed address and names the field", () => {
    const onSubmit = vi.fn();
    render(<MagicLinkForm onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Email address") as HTMLInputElement;
    expect(input.type).toBe("email");
    expect(input.autocomplete).toBe("email");
    fireEvent.change(input, { target: { value: "  me@example.org " } });
    fireEvent.click(screen.getByRole("button", { name: "Email me a sign-in link" }));
    expect(onSubmit).toHaveBeenCalledWith("me@example.org");
  });
  it("shows an error against the field and disables the button while busy", () => {
    render(
      <MagicLinkForm onSubmit={() => undefined} error="Enter an email address in the correct format" busy />,
    );
    expect(screen.getByLabelText("Email address").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Enter an email address in the correct format")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Sending…" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("MagicLinkSent and MagicLinkConfirm", () => {
  it("says the same thing whether or not the address has an account", () => {
    const again = vi.fn();
    render(<MagicLinkSent email="me@example.org" onTryAgain={again} />);
    expect(screen.getByRole("status").textContent).toContain(
      "If me@example.org can be used, we’ve sent a sign-in link",
    );
    fireEvent.click(screen.getByRole("button", { name: "Use a different address" }));
    expect(again).toHaveBeenCalled();
  });
  it("needs a click to sign in, and shows what went wrong", () => {
    const onConfirm = vi.fn();
    render(<MagicLinkConfirm onConfirm={onConfirm} error="That link has expired." />);
    expect(screen.getByRole("alert").textContent).toContain("That link has expired.");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe("Hero and StepCard", () => {
  it("labels the band by its title and shows eyebrow, lead and actions", async () => {
    const { Hero } = await import("../../src");
    const { container } = render(
      <Hero
        eyebrow="Visits Abroad"
        eyebrowIcon={Plane}
        title="Start here"
        decoration={Plane}
        actions={<a href="/x">Go</a>}
      >
        <p>Lead text</p>
      </Hero>,
    );
    expect(screen.getByRole("region", { name: "Start here" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Start here" })).toBeTruthy();
    expect(container.querySelector(".hero-band__art")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("link", { name: "Go" })).toBeTruthy();
  });
  it("numbers steps visually and for screen readers", async () => {
    const { StepGrid, StepCard } = await import("../../src");
    render(
      <StepGrid>
        <StepCard n={1} icon={Plane} title="Start">
          First.
        </StepCard>
        <StepCard n={2} title="Approve">
          Second.
        </StepCard>
      </StepGrid>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 3, name: "Step 2: Approve" })).toBeTruthy();
  });
});

describe("SectionTitle", () => {
  it("is a level-2 heading by default, level 3 on request, and a focus target when it has an id", async () => {
    const { SectionTitle } = await import("../../src");
    render(
      <>
        <SectionTitle id="a">How it works</SectionTitle>
        <SectionTitle as="h3">Details</SectionTitle>
      </>,
    );
    const h2 = screen.getByRole("heading", { level: 2, name: "How it works" });
    expect(h2.getAttribute("tabindex")).toBe("-1");
    expect(screen.getByRole("heading", { level: 3, name: "Details" }).getAttribute("tabindex")).toBeNull();
  });
});

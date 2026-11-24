// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  CheckboxCards,
  DateField,
  ErrorSummary,
  Field,
  FieldGroup,
  Input,
  RadioCards,
} from "../../src/forms";

afterEach(cleanup);

describe("Field", () => {
  it("wires hint and error, shows an asterisk and never says optional", () => {
    const { container } = render(
      <Field label="Surname" required hint="As on your card" error="Enter your surname">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText(/Surname/);
    const ids = input.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[1] ?? "")?.textContent).toBe("Error: Enter your surname");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector(".req")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.textContent?.toLowerCase()).not.toContain("optional");
  });

  it("has no marker on a not-required field", () => {
    const { container } = render(
      <Field label="Mobile">
        <Input />
      </Field>,
    );
    expect(container.querySelector(".req")).toBeNull();
    expect(container.textContent?.toLowerCase()).not.toContain("optional");
  });
});

describe("DateField", () => {
  it("renders a fieldset with day, month and year and describes it", () => {
    render(
      <DateField
        legend="Date of birth"
        id="dob"
        required
        hint="For example, 27 3 1985"
        error="Enter a real month"
        errorParts={["month"]}
      />,
    );
    const group = screen.getByRole("group", { name: /Date of birth/ });
    expect(group.getAttribute("aria-describedby")).toBe("dob-hint dob-err");
    expect(screen.getByLabelText("Month").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Day").getAttribute("aria-invalid")).toBeNull();
    expect(document.getElementById("dob-err")?.textContent).toContain("Error: Enter a real month");
  });

  it("is controlled", () => {
    let v = { day: "1", month: "2", year: "2000" };
    render(
      <DateField
        legend="D"
        id="d"
        value={v}
        onChange={(n) => {
          v = n;
        }}
      />,
    );
    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "5" } });
    expect(v.day).toBe("5");
  });
});

describe("Choice cards", () => {
  it("RadioCards uses native radios in a fieldset", () => {
    render(
      <RadioCards
        legend="Gender"
        name="g"
        required
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        defaultValue="b"
      />,
    );
    expect((screen.getByLabelText("B") as HTMLInputElement).checked).toBe(true);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("group", { name: /Gender/ })).toBeTruthy();
  });

  it("CheckboxCards reports the selection", () => {
    let v: string[] = ["a"];
    render(
      <CheckboxCards
        legend="Roles"
        name="r"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value={v}
        onChange={(n) => {
          v = n;
        }}
      />,
    );
    fireEvent.click(screen.getByLabelText("B"));
    expect(v).toEqual(["a", "b"]);
  });
});

describe("ErrorSummary", () => {
  it("is an alert, takes focus and links to fields", () => {
    render(<ErrorSummary items={[{ fieldId: "surname", message: "Enter your surname" }]} />);
    const alert = screen.getByRole("alert");
    expect(document.activeElement).toBe(alert);
    expect(alert.textContent).toContain("There is a problem");
    expect(screen.getByRole("link", { name: "Enter your surname" }).getAttribute("href")).toBe("#surname");
  });

  it("renders nothing when there are no errors", () => {
    const { container } = render(<ErrorSummary items={[]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("ErrorSummary links", () => {
  it("focus the first control when the target is a fieldset", () => {
    Element.prototype.scrollIntoView = () => {};
    render(
      <>
        <ErrorSummary items={[{ fieldId: "gender", message: "Choose one" }]} autoFocus={false} />
        <RadioCards
          id="gender"
          legend="Gender"
          name="gender"
          options={[
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ]}
        />
      </>,
    );
    fireEvent.click(screen.getByText("Choose one"));
    expect(document.activeElement?.getAttribute("id")).toBe("gender-0");
  });

  it("date fieldsets carry the id", () => {
    const { container } = render(<DateField legend="Date of birth" id="dob" />);
    expect(container.querySelector("fieldset")?.id).toBe("dob");
  });
});

describe("Field render function and FieldGroup", () => {
  it("hands a wrapped control its id, required and aria props", () => {
    render(
      <Field label="Trip email" required hint="Before the @" error="Enter a name">
        {(c) => (
          <div>
            <Input {...c} />
            <span>@wiltshirescouts.org.uk</span>
          </div>
        )}
      </Field>,
    );
    const input = screen.getByLabelText(/Trip email/);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
  });

  it("groups controls under a legend with hint and error", () => {
    render(
      <FieldGroup legend="Born between" id="range" hint="Both included" error="Start is after end">
        {(g) => <Input aria-label="From" aria-describedby={g.describedBy} />}
      </FieldGroup>,
    );
    const group = screen.getByRole("group", { name: /Born between/ });
    expect(group.id).toBe("range");
    expect(screen.getByLabelText("From").getAttribute("aria-describedby")).toBe("range-hint range-err");
    expect(group.textContent).toContain("Error: Start is after end");
  });
});

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Checkbox, Switch } from "../../src/forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../src/ui/Dialog";

afterEach(cleanup);

function SwitchDemo() {
  const [on, setOn] = useState(false);
  return (
    <>
      <label htmlFor="s">Open for sign-ups</label>
      <Switch id="s" checked={on} onCheckedChange={setOn} />
    </>
  );
}

describe("Dialog", () => {
  it("opens from its trigger with a title and description, and closes with the close button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Create trip</DialogTitle>
          <DialogDescription>Fill in the details.</DialogDescription>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByText("Open"));
    const dialog = screen.getByRole("dialog", { name: "Create trip" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Switch", () => {
  it("is a labelled switch that reports its state", () => {
    render(<SwitchDemo />);
    const sw = screen.getByRole("switch", { name: "Open for sign-ups" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });
});

describe("Checkbox", () => {
  it("is a native checkbox that takes a label", () => {
    render(
      <>
        <Checkbox id="c" />
        <label htmlFor="c">Dates provisional</label>
      </>,
    );
    const box = screen.getByLabelText("Dates provisional") as HTMLInputElement;
    expect(box.type).toBe("checkbox");
    fireEvent.click(box);
    expect(box.checked).toBe(true);
  });
});

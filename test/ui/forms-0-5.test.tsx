// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CheckboxCards,
  CheckboxList,
  Combobox,
  FieldGroup,
  FileList,
  FileUpload,
  Input,
  NativeDateField,
  RadioCards,
  RepeatableFieldset,
  SumField,
} from "../../src/forms";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const fields = [
  { key: "a", label: "Under 10" },
  { key: "b", label: "10 to 14" },
];
function SumHarness() {
  const [v, setV] = useState<Record<string, string>>({ a: "", b: "" });
  return (
    <SumField
      legend="Young people"
      id="yp"
      fields={fields}
      values={v}
      onChange={(k, x) => setV({ ...v, [k]: x })}
    />
  );
}

function RepeatHarness({ min }: { min?: number }) {
  const [rows, setRows] = useState([{ k: "r0", v: "" }]);
  const n = useState({ i: 1 })[0];
  return (
    <RepeatableFieldset
      legend="Destinations"
      items={rows}
      min={min}
      icon={MapPin}
      getKey={(r) => r.k}
      itemLabel={(i) => `Destination ${i + 1}`}
      addLabel="Add another destination"
      onAdd={() => setRows([...rows, { k: `r${n.i++}`, v: "" }])}
      onRemove={(i) => setRows(rows.filter((_, j) => j !== i))}
      renderItem={(r, i) => <Input aria-label={`Place ${i + 1}`} defaultValue={r.v} />}
    />
  );
}

const options = [
  { value: "fr", label: "France", synonyms: ["Francia"] },
  { value: "de", label: "Germany", synonyms: ["Deutschland"] },
  { value: "es", label: "Spain", synonyms: ["Espana"] },
  { value: "fi", label: "Finland" },
];
function ComboHarness({ initial = null as string | null, onValue = (_v: string | null) => {} }) {
  const [v, setV] = useState<string | null>(initial);
  return (
    <Combobox
      label="Country"
      name="country"
      options={options}
      value={v}
      notListed={{ value: "other", label: "My country is not listed" }}
      onChange={(x) => {
        setV(x);
        onValue(x);
      }}
    />
  );
}
const optionNames = () => screen.getAllByRole("option", { hidden: false }).map((o) => o.textContent);

describe("Choice cards 0.5", () => {
  const opts = [
    { value: "a", label: "Alpha", hint: "First letter" },
    { value: "b", label: "Beta", conditional: <Input aria-label="Details" /> },
  ];

  it("reveals conditional content only while selected, keeping it in the DOM", () => {
    const { container } = render(
      <RadioCards legend="Pick" name="p" id="p" options={opts} defaultValue="a" />,
    );
    const panel = container.querySelector("#p-1-conditional") as HTMLElement;
    expect(panel.hidden).toBe(true);
    expect(screen.getByLabelText("Details")).toBeTruthy();
    const beta = screen.getByLabelText("Beta");
    expect(beta.getAttribute("aria-controls")).toBe("p-1-conditional");
    fireEvent.click(beta);
    expect(panel.hidden).toBe(false);
    fireEvent.click(screen.getByLabelText(/Alpha/));
    expect(panel.hidden).toBe(true);
  });

  it("forces the stacked layout with conditional content and honours layout otherwise", () => {
    const { container, rerender } = render(
      <RadioCards legend="Pick" name="p" options={opts} layout="grid-3" />,
    );
    expect(container.querySelector(".choice-list--stack")).toBeTruthy();
    rerender(<RadioCards legend="Pick" name="p" options={[{ value: "a", label: "A" }]} layout="grid-3" />);
    expect(container.querySelector(".choice-list--grid-3")).toBeTruthy();
  });

  it("shows the hint inside the card and keeps the first radio id", () => {
    const { container } = render(<RadioCards legend="Pick" name="p" id="p" options={opts} />);
    expect(container.querySelector("#p-0")).toBeTruthy();
    expect(container.querySelector(".choice__hint")?.textContent).toBe("First letter");
  });

  it("fires onChange in uncontrolled CheckboxCards", () => {
    const onChange = vi.fn();
    render(
      <CheckboxCards
        legend="Pick"
        name="c"
        defaultValue={["a"]}
        onChange={onChange}
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />,
    );
    fireEvent.click(screen.getByLabelText("B"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
    fireEvent.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    expect((screen.getByLabelText("A") as HTMLInputElement).checked).toBe(false);
  });
});

describe("FieldGroup legendSize", () => {
  it("renders a heading legend", () => {
    const { container } = render(
      <FieldGroup legend="Trip" legendSize="heading">
        <Input aria-label="x" />
      </FieldGroup>,
    );
    expect(container.querySelector("legend.legend-heading")).toBeTruthy();
  });
});

describe("NativeDateField", () => {
  it("emits ISO strings, controlled and uncontrolled", () => {
    const onChange = vi.fn();
    render(<NativeDateField label="Start" defaultValue="2026-07-01" onChange={onChange} required />);
    const input = screen.getByLabelText(/Start/) as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.value).toBe("2026-07-01");
    fireEvent.change(input, { target: { value: "2026-08-02" } });
    expect(onChange).toHaveBeenCalledWith("2026-08-02");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("is wired to its error", () => {
    render(<NativeDateField label="End" error="Enter a date" value="" />);
    const input = screen.getByLabelText("End");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby") ?? "")?.textContent).toContain(
      "Error: Enter a date",
    );
  });
});

describe("CheckboxList", () => {
  it("toggles values in uncontrolled mode and reports the array", () => {
    const onChange = vi.fn();
    render(
      <CheckboxList
        legend="Roles"
        id="roles"
        onChange={onChange}
        options={[
          { value: "a", label: "Admin" },
          { value: "b", label: "Editor" },
        ]}
      />,
    );
    fireEvent.click(screen.getByLabelText("Editor"));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    expect(screen.getByRole("group", { name: "Roles" }).id).toBe("roles");
  });
});

describe("SumField", () => {
  it("updates the total live and ignores junk", () => {
    render(<SumHarness />);
    const total = screen.getByLabelText("Total");
    expect(total.tagName).toBe("OUTPUT");
    expect(total.getAttribute("aria-live")).toBe("polite");
    expect(total.textContent).toBe("0");
    fireEvent.change(screen.getByLabelText("Under 10"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("10 to 14"), { target: { value: "6" } });
    expect(total.textContent).toBe("10");
    fireEvent.change(screen.getByLabelText("10 to 14"), { target: { value: "-3" } });
    expect(total.textContent).toBe("4");
    fireEvent.change(screen.getByLabelText("10 to 14"), { target: { value: "2.5" } });
    expect(total.textContent).toBe("4");
    fireEvent.change(screen.getByLabelText("10 to 14"), { target: { value: "abc" } });
    expect(total.textContent).toBe("4");
  });

  it("builds input ids from the prefix", () => {
    render(<SumHarness />);
    expect(screen.getByLabelText("Under 10").id).toBe("yp-a");
    expect(screen.getByLabelText("Under 10").getAttribute("inputmode")).toBe("numeric");
  });
});

describe("FileUpload", () => {
  const file = new File(["x"], "report.pdf", { type: "application/pdf" });
  const pick = (input: HTMLInputElement) => {
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
  };

  it("asks for a file when none is selected", () => {
    const onUpload = vi.fn();
    render(<FileUpload label="Report" onUpload={onUpload} />);
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(onUpload).not.toHaveBeenCalled();
    expect(screen.getByText("Select a file to upload")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Report"));
  });

  it("shows progress in 25% steps, then announces success and clears the input", async () => {
    let report: (p: number) => void = () => {};
    let finish: () => void = () => {};
    const onUpload = vi.fn(
      (_f: File, p: (n: number) => void) =>
        new Promise<void>((res) => {
          report = p;
          finish = res;
        }),
    );
    const { container } = render(<FileUpload label="Report" onUpload={onUpload} />);
    const input = screen.getByLabelText("Report") as HTMLInputElement;
    pick(input);
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(onUpload).toHaveBeenCalledWith(file, expect.any(Function));
    const bar = container.querySelector("progress") as HTMLProgressElement;
    expect(bar).toBeTruthy();
    act(() => report(60));
    expect(bar.getAttribute("aria-valuetext")).toBe("50%");
    expect(screen.getByRole("status").textContent).toBe("Uploading 50%");
    await act(async () => {
      finish();
    });
    expect(screen.getByRole("status").textContent).toBe("Uploaded");
    expect(container.querySelector("progress")).toBeNull();
    expect(input.value).toBe("");
  });

  it("shows the error message and returns focus to the input on failure", async () => {
    const onError = vi.fn();
    render(
      <FileUpload label="Report" onError={onError} onUpload={() => Promise.reject(new Error("Too large"))} />,
    );
    const input = screen.getByLabelText("Report") as HTMLInputElement;
    pick(input);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    });
    expect(onError).toHaveBeenCalled();
    expect(screen.getByText("Too large")).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it("prefers the error prop", () => {
    render(<FileUpload label="Report" error="Server said no" onUpload={async () => {}} />);
    expect(screen.getByText("Server said no")).toBeTruthy();
  });
});

describe("FileList", () => {
  it("names each remove button after its file and formats sizes", () => {
    const onRemove = vi.fn();
    render(
      <FileList
        onRemove={onRemove}
        files={[
          { id: "1", name: "report.pdf", href: "/r.pdf", size: 1_258_291, inline: true, meta: "Added today" },
          { id: "2", name: "plan.docx", href: "/p.docx", size: 2048 },
        ]}
      />,
    );
    expect(screen.getByRole("list", { name: "Files" })).toBeTruthy();
    expect(screen.getByText("1.2 MB")).toBeTruthy();
    expect(screen.getByText("2 KB")).toBeTruthy();
    const link = screen.getByRole("link", { name: /report\.pdf/ });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.textContent).toContain("(opens in a new tab)");
    expect(screen.getByRole("link", { name: "plan.docx" }).hasAttribute("download")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Remove report.pdf" }));
    expect(onRemove).toHaveBeenCalledWith("1");
  });

  it("has no remove buttons without onRemove, and shows the empty text", () => {
    const { rerender } = render(<FileList files={[{ id: "1", name: "a.pdf" }]} />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<FileList files={[]} empty="No files yet" />);
    expect(screen.getByText("No files yet")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("RepeatableFieldset", () => {
  it("adds a row, focuses its first control and announces", () => {
    render(<RepeatHarness />);
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add another destination" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Place 2"));
    expect(
      screen.getAllByRole("status").some((s) => s.textContent === "Destination 2 added. 2 in total."),
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Remove destination 1" })).toBeTruthy();
  });

  it("removes a row, renumbers, moves focus and announces", () => {
    render(<RepeatHarness />);
    const add = screen.getByRole("button", { name: "Add another destination" });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(screen.getByRole("button", { name: "Remove destination 2" }));
    expect(screen.getAllByRole("group", { name: /^Destination \d/ })).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Destination 2" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Place 2"));
    expect(
      screen.getAllByRole("status").some((s) => s.textContent === "Destination 2 removed. 2 left."),
    ).toBe(true);
  });

  it("focuses the previous row when the last row is removed, and respects min", () => {
    render(<RepeatHarness min={2} />);
    fireEvent.click(screen.getByRole("button", { name: "Add another destination" }));
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add another destination" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove destination 3" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Place 2"));
  });
});

describe("Combobox", () => {
  it("has the ARIA 1.2 wiring and opens on focus with every option", () => {
    render(<ComboHarness />);
    const input = screen.getByRole("combobox", { name: "Country" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-controls") ?? "")?.getAttribute("role")).toBe(
      "listbox",
    );
    expect(optionNames()).toEqual(["France", "Germany", "Spain", "Finland", "My country is not listed"]);
  });

  it("filters by label and synonym, prefix first, with notListed always last", () => {
    render(<ComboHarness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "ny" } });
    expect(optionNames()).toEqual(["Germany", "My country is not listed"]);
    fireEvent.change(input, { target: { value: "fr" } });
    expect(optionNames()).toEqual(["France", "My country is not listed"]);
    fireEvent.change(input, { target: { value: "deutsch" } });
    expect(optionNames()).toEqual(["Germany", "My country is not listed"]);
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(optionNames()).toEqual(["My country is not listed"]);
    expect(screen.getByText("No matches", { selector: ".combobox__empty" })).toBeTruthy();
  });

  it("ranks prefix matches before contains matches", () => {
    render(<ComboHarness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    // Spain starts with "s"; Espana-less others only contain it (Germany has none: it is filtered out)
    fireEvent.change(input, { target: { value: "s" } });
    expect(optionNames()[0]).toBe("Spain");
  });

  it("supports the keyboard: arrows, Home, End, Enter, Escape", () => {
    const onValue = vi.fn();
    render(<ComboHarness onValue={onValue} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[0]?.id);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[1]?.id);
    fireEvent.keyDown(input, { key: "End" });
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[4]?.id);
    fireEvent.keyDown(input, { key: "Home" });
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[0]?.id);
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[4]?.id);
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValue).toHaveBeenLastCalledWith("de");
    expect(input.value).toBe("Germany");
    expect(input.getAttribute("aria-expanded")).toBe("false");

    fireEvent.change(input, { target: { value: "xyz" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("Germany");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("selects with the mouse and with notListed", () => {
    const onValue = vi.fn();
    render(<ComboHarness onValue={onValue} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole("option", { name: "Spain" }));
    expect(onValue).toHaveBeenLastCalledWith("es");
    expect(input.value).toBe("Spain");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzz" } });
    fireEvent.click(screen.getByRole("option", { name: "My country is not listed" }));
    expect(onValue).toHaveBeenLastCalledWith("other");
    expect((document.querySelector('input[type="hidden"][name="country"]') as HTMLInputElement).value).toBe(
      "other",
    );
  });

  it("commits on blur only when the text exactly equals a label, otherwise restores", () => {
    const onValue = vi.fn();
    render(<ComboHarness initial="fr" onValue={onValue} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("France");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Ger" } });
    fireEvent.blur(input);
    expect(input.value).toBe("France");
    expect(onValue).not.toHaveBeenCalled();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Germany" } });
    fireEvent.blur(input);
    expect(onValue).toHaveBeenLastCalledWith("de");
    expect(input.value).toBe("Germany");
  });

  it("clears with onChange(null) when the text is emptied", () => {
    const onValue = vi.fn();
    render(<ComboHarness initial="fr" onValue={onValue} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    expect(onValue).toHaveBeenLastCalledWith(null);
  });

  it("announces the result count once typing settles", () => {
    vi.useFakeTimers();
    const { container } = render(<ComboHarness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "fr" } });
    const live = container.querySelector(".combobox .sr-only[aria-live]") as HTMLElement;
    expect(live.textContent).toBe("");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(live.textContent).toBe("1 result available");
    fireEvent.change(input, { target: { value: "zzz" } });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(live.textContent).toBe("No matches");
    fireEvent.change(input, { target: { value: "f" } });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(live.textContent).toBe("2 results available");
  });

  it("renders no hidden input without a name", async () => {
    const { container } = render(<Combobox label="X" options={options} value={null} onChange={() => {}} />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
    await waitFor(() => expect(screen.getByRole("combobox")).toBeTruthy());
  });
});

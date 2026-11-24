// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Plane } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BarList,
  Callout,
  CommentCard,
  ConfirmationPanel,
  DataTable,
  type DataTableColumn,
  Disclosure,
  FactsCard,
  HistoryList,
  ItemCard,
  Meter,
  NavTabs,
  OnThisPage,
  StatCard,
  StatusChip,
  Steps,
  SummaryCard,
  SummaryList,
} from "../../src";

afterEach(cleanup);

describe("ItemCard", () => {
  it("is a group named by its heading, with the title as a link and no overlay", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ItemCard
        title="Summer camp"
        href="/visits/1"
        headingLevel={3}
        chips={<StatusChip>Draft</StatusChip>}
        meta="Leader: Sam"
        actions={
          <button type="button" onClick={onClick}>
            Withdraw
          </button>
        }
        callout="Changes needed"
        calloutTone="warning"
      >
        Body text
      </ItemCard>,
    );
    const group = screen.getByRole("group", { name: "Summer camp" });
    expect(within(group).getByRole("heading", { level: 3, name: "Summer camp" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Summer camp" }).getAttribute("href")).toBe("/visits/1");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(container.querySelector(".item-card__callout--warning")?.textContent).toBe("Changes needed");
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(onClick).toHaveBeenCalled();
    expect(container.querySelector("a::after, .item-card__overlay")).toBeNull();
  });
  it("renders a plain heading without href and defaults to h2", () => {
    render(<ItemCard title="Plain" />);
    expect(screen.getByRole("heading", { level: 2, name: "Plain" })).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("SummaryList", () => {
  it("shows empty text for empty and whitespace-only values and keeps line breaks", () => {
    render(
      <SummaryList
        emptyText="Nothing yet"
        rows={[
          { key: "Name", value: "Alex" },
          { key: "Notes", value: "  \n " },
          { key: "Address", value: "1 High St\nSalisbury" },
        ]}
      />,
    );
    expect(screen.getByText("Nothing yet").className).toContain("summary-list__empty");
    expect(screen.getByText(/Salisbury/).textContent).toBe("1 High St\nSalisbury");
  });
  it("defaults the empty text", () => {
    render(<SummaryList rows={[{ key: "A", value: null }]} />);
    expect(screen.getByText("Not provided")).toBeTruthy();
  });
  it("names Change links with their hidden text, and uses a button for onClick", () => {
    const onClick = vi.fn();
    render(
      <SummaryList
        rows={[
          { key: "Destinations", value: "Paris", action: { href: "/edit/dest", hiddenText: "destinations" } },
          { key: "Dates", value: "May", action: { onClick, hiddenText: "dates" } },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Change destinations" }).getAttribute("href")).toBe("/edit/dest");
    const btn = screen.getByRole("button", { name: "Change dates" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("SummaryCard puts the heading and the change link in the header", () => {
    render(
      <SummaryCard title="Trip" headingLevel={3} action={{ href: "#", hiddenText: "trip" }}>
        <SummaryList rows={[{ key: "A", value: "B" }]} />
      </SummaryCard>,
    );
    expect(screen.getByRole("region", { name: "Trip" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Trip" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Change trip" })).toBeTruthy();
  });
});

describe("Disclosure", () => {
  it("toggles and reports the new state", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <Disclosure summary="More" onToggle={onToggle}>
        Hidden
      </Disclosure>,
    );
    const details = container.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    details.open = true;
    fireEvent(details, new Event("toggle"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
  it("starts open with defaultOpen and marks destructive with an icon", () => {
    const { container } = render(
      <Disclosure summary="Withdraw" tone="destructive" bordered defaultOpen>
        Body
      </Disclosure>,
    );
    expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
    expect(container.querySelector("details")?.className).toContain("disclosure--destructive");
    expect(container.querySelectorAll("summary svg").length).toBe(2);
  });
});

describe("NavTabs", () => {
  it("marks the current link with aria-current=page", () => {
    render(
      <NavTabs
        ariaLabel="Visit sections"
        items={[
          { label: "Overview", href: "/a", current: true, icon: Plane },
          { label: "Costs", href: "/b" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Visit sections" });
    expect(within(nav).getByRole("link", { name: "Overview" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Costs" }).getAttribute("aria-current")).toBeNull();
  });
});

describe("Steps", () => {
  const steps = ["One", "Two", "Three", "Four", "Five", "Six"];
  it("sets the column count from the steps and is a labelled group of an ordered list, not a nav", () => {
    const { container } = render(<Steps steps={steps} current={2} />);
    expect((container.querySelector(".steps") as HTMLElement).style.getPropertyValue("--steps")).toBe("6");
    expect(screen.getByRole("group", { name: "Progress" })).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(container.querySelector("ol")).not.toBeNull();
    expect(screen.getByText("Step 2 of 6")).toBeTruthy();
    expect(container.querySelector("[aria-current='step']")?.textContent).toContain("Two");
  });
  it("shows Complete when current is past the last step", () => {
    const { container } = render(<Steps steps={steps} current={7} ariaLabel="Review" />);
    expect(screen.getByText("Complete")).toBeTruthy();
    expect(container.querySelectorAll("li.done")).toHaveLength(6);
    expect(container.querySelector("[aria-current]")).toBeNull();
    expect(screen.getByRole("group", { name: "Review" })).toBeTruthy();
  });
  it("renders nothing when current is 0", () => {
    const { container } = render(<Steps steps={steps} current={0} />);
    expect(container.innerHTML).toBe("");
  });
  it("applies the success tone to completed steps", () => {
    const { container } = render(<Steps steps={steps} current={3} doneTone="success" />);
    expect(container.querySelector(".steps")?.className).toContain("steps--success");
  });
});

describe("CommentCard and HistoryList", () => {
  it("shows who, when and where on a comment", () => {
    render(
      <CommentCard label="Changes requested" author="Sam" at="3 May 2026, 10:15" context="Part A, version 2">
        {"Line one\nLine two"}
      </CommentCard>,
    );
    expect(screen.getByText("Changes requested")).toBeTruthy();
    expect(screen.getByText(/Sam, 3 May 2026, 10:15/).textContent).toContain("Part A, version 2");
    expect(screen.getByText(/Line one/).textContent).toBe("Line one\nLine two");
  });
  it("marks the current item with aria-current and a Current chip", () => {
    render(
      <HistoryList
        ariaLabel="Versions"
        items={[
          { label: "Version 2", current: true, meta: "today" },
          { label: "Version 1", href: "/v1" },
        ]}
      />,
    );
    const items = within(screen.getByRole("list", { name: "Versions" })).getAllByRole("listitem");
    expect(items[0]?.getAttribute("aria-current")).toBe("true");
    expect(within(items[0] as HTMLElement).getByText("Current")).toBeTruthy();
    expect(items[1]?.getAttribute("aria-current")).toBeNull();
    expect(within(items[1] as HTMLElement).getByRole("link", { name: "Version 1" })).toBeTruthy();
  });
});

describe("StatCard, BarList and Meter", () => {
  it("uses the label as the heading", () => {
    render(<StatCard label="Open visits" value={12} hint="3 new" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Open visits" })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });
  it("hides the bars from assistive technology by default, hides zero bars and formats values", () => {
    const { container } = render(
      <BarList
        rows={[
          { label: "A", value: 50 },
          { label: "B", value: 0 },
          { label: "C", value: 0.1 },
        ]}
        max={100}
        format={(n) => `${n} visits`}
      />,
    );
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    const bars = container.querySelectorAll<HTMLElement>(".bar-list__bar");
    expect(bars).toHaveLength(2);
    expect(bars[0]?.style.width).toBe("50%");
    expect(bars[1]?.style.width).toBe("2%");
    expect(screen.getByText("50 visits")).toBeTruthy();
  });
  it("can be exposed with ariaHidden false", () => {
    const { container } = render(<BarList rows={[{ label: "A", value: 1 }]} ariaHidden={false} />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBeNull();
  });
  it("labels the progress element", () => {
    render(<Meter label="Parts complete" value={3} max={5} text="3 of 5" />);
    const p = screen.getByLabelText("Parts complete") as HTMLProgressElement;
    expect(p.tagName).toBe("PROGRESS");
    expect(p.value).toBe(3);
    expect(p.max).toBe(5);
    expect(screen.getByText("3 of 5")).toBeTruthy();
  });
});

describe("ConfirmationPanel and Callout", () => {
  it("shows the title as h1 and the reference under a label", () => {
    const { container } = render(
      <ConfirmationPanel title="Visit submitted" reference="VA-2026-0042">
        <p>We will email you.</p>
      </ConfirmationPanel>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Visit submitted" })).toBeTruthy();
    expect(screen.getByText("Your reference")).toBeTruthy();
    expect(screen.getByText("VA-2026-0042")).toBeTruthy();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("We will email you.")).toBeTruthy();
  });
  it("omits the reference line when there is none and honours headingLevel", () => {
    render(<ConfirmationPanel title="Done" headingLevel={2} />);
    expect(screen.queryByText("Your reference")).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();
  });
  it("renders a titled callout", () => {
    const { container } = render(
      <Callout tone="neutral" title="Declaration">
        I agree.
      </Callout>,
    );
    expect(screen.getByText("Declaration")).toBeTruthy();
    expect(container.querySelector(".callout--neutral")).not.toBeNull();
  });
});

describe("layout helpers", () => {
  it("FactsCard grid adds the grid class", () => {
    const { container } = render(
      <FactsCard layout="grid" facts={[{ icon: Plane, label: "Where", value: "Paris" }]} />,
    );
    expect(container.querySelector(".facts")?.className).toContain("facts--grid");
    const { container: c2 } = render(<FactsCard facts={[{ icon: Plane, label: "Where", value: "Paris" }]} />);
    expect(c2.querySelector(".facts")?.className).not.toContain("facts--grid");
  });
  it("OnThisPage lists anchor links in a labelled nav", () => {
    render(
      <OnThisPage
        items={[
          { label: "Overview", href: "#overview" },
          { label: "Costs", href: "#costs" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(within(nav).getByRole("link", { name: "Costs" }).getAttribute("href")).toBe("#costs");
  });
});

describe("StatusChip additions", () => {
  it("has a solid tone and an opt-in wrap", () => {
    const { container } = render(
      <>
        <StatusChip tone="solid">Approved</StatusChip>
        <StatusChip wrap>Long text</StatusChip>
        <StatusChip>Short</StatusChip>
      </>,
    );
    const chips = container.querySelectorAll(".chip");
    expect(chips[0]?.className).toContain("chip-solid");
    expect(chips[1]?.className).toContain("chip--wrap");
    expect(chips[2]?.className).not.toContain("chip--wrap");
  });
});

describe("DataTable additions", () => {
  interface Row {
    id: string;
    name: string;
    size: number;
  }
  const data: Row[] = [
    { id: "b", name: "Beta", size: 10 },
    { id: "a", name: "Alpha", size: 2 },
  ];
  const columns: DataTableColumn<Row>[] = [
    { id: "name", header: "Name", accessor: "name" },
    { id: "size", header: "Size", accessor: "size", type: "number", numeric: true },
  ];

  it("sortable false removes sort buttons, the mobile select and aria-sort", () => {
    const { container } = render(
      <DataTable
        caption="People"
        columns={columns}
        data={data}
        sortable={false}
        defaultSort={{ id: "name", direction: "ascending" }}
      />,
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByLabelText("Sort by")).toBeNull();
    expect(container.querySelector("[aria-sort]")).toBeNull();
    expect(screen.getAllByRole("rowheader").map((e) => e.textContent)).toEqual(["Beta", "Alpha"]);
    expect(screen.getByRole("table").getAttribute("aria-sort")).toBeNull();
    expect(container.querySelector("caption")?.textContent).toBe("People");
  });
  it("hides the caption visually but keeps it", () => {
    const { container } = render(<DataTable caption="People" columns={columns} data={data} captionHidden />);
    expect(container.querySelector("caption")?.className).toContain("sr-only");
    expect(screen.getByRole("table", { name: /People/ })).toBeTruthy();
  });
  it("rowHeader false has no row headers; a string picks the column", () => {
    const { unmount } = render(<DataTable caption="P" columns={columns} data={data} rowHeader={false} />);
    expect(screen.queryAllByRole("rowheader")).toHaveLength(0);
    unmount();
    render(<DataTable caption="P" columns={columns} data={data} rowHeader="size" />);
    expect(screen.getAllByRole("rowheader").map((e) => e.textContent)).toEqual(["10", "2"]);
  });
  it("passes rowProps to each body row", () => {
    render(
      <DataTable
        caption="P"
        columns={columns}
        data={data}
        rowProps={(row, i) => ({ "data-row": row.id, "data-index": String(i) }) as never}
      />,
    );
    const first = screen.getByRole("rowheader", { name: "Beta" }).closest("tr");
    expect(first?.getAttribute("data-row")).toBe("b");
    expect(first?.getAttribute("data-index")).toBe("0");
  });
  it("shows the empty message in one cell spanning all columns", () => {
    const { container } = render(
      <DataTable caption="P" columns={columns} data={[]} empty="No people yet." />,
    );
    const cell = screen.getByText("No people yet.");
    expect(cell.getAttribute("colspan")).toBe("2");
    expect(container.querySelector("tr.data-empty")).not.toBeNull();
  });
});

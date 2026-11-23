// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "../../src/table";

afterEach(cleanup);

interface Row {
  name: string;
  size: number;
}
const data: Row[] = [
  { name: "Beta", size: 10 },
  { name: "Alpha", size: 2 },
  { name: "Gamma", size: 33 },
];
const columns: DataTableColumn<Row>[] = [
  { header: "Name", accessor: "name" },
  { header: "Group size", accessor: "size", type: "number", numeric: true },
];

const names = () => screen.getAllByRole("rowheader").map((e) => e.textContent);

describe("DataTable", () => {
  it("sorts ascending then descending, with aria-sort and hint text", () => {
    render(<DataTable caption="People" columns={columns} data={data} />);
    const th = screen.getByRole("columnheader", { name: /Name/ });
    expect(th.getAttribute("aria-sort")).toBeNull();
    expect(th.textContent).toContain("Not sorted. Activate to sort ascending.");

    fireEvent.click(within(th).getByRole("button"));
    expect(th.getAttribute("aria-sort")).toBe("ascending");
    expect(th.textContent).toContain(", sorted ascending. Activate to sort descending.");
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"]);

    fireEvent.click(within(th).getByRole("button"));
    expect(th.getAttribute("aria-sort")).toBe("descending");
    expect(names()).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("sorts numbers numerically and updates caption and live region", () => {
    render(<DataTable caption="People" columns={columns} data={data} />);
    fireEvent.click(within(screen.getByRole("columnheader", { name: /Group size/ })).getByRole("button"));
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(screen.getByRole("status").textContent).toBe("Table sorted by Group size, ascending.");
    expect(document.querySelector("caption")?.textContent).toBe("People, sorted by group size, ascending");
  });

  it("honours defaultSort and clears aria-sort on other columns", () => {
    render(
      <DataTable
        caption="People"
        columns={columns}
        data={data}
        defaultSort={{ id: "size", direction: "descending" }}
      />,
    );
    expect(names()).toEqual(["Gamma", "Beta", "Alpha"]);
    expect(screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort")).toBeNull();
  });

  it("has a mobile sort select and direction button", () => {
    render(
      <DataTable
        caption="People"
        columns={columns}
        data={data}
        defaultSort={{ id: "name", direction: "ascending" }}
      />,
    );
    const select = screen.getByLabelText("Sort by") as HTMLSelectElement;
    expect(select.value).toBe("name");
    const dir = screen.getByRole("button", {
      name: "Sort direction: ascending. Activate to sort descending.",
    });
    fireEvent.click(dir);
    expect(names()).toEqual(["Gamma", "Beta", "Alpha"]);
    expect(
      screen.getByRole("button", { name: "Sort direction: descending. Activate to sort ascending." }),
    ).toBeTruthy();
    fireEvent.change(select, { target: { value: "size" } });
    expect(screen.getByRole("status").textContent).toBe("Table sorted by Group size, descending.");
  });

  it("labels cells for the card layout and supports controlled sort", () => {
    const calls: string[] = [];
    render(
      <DataTable
        caption="People"
        columns={columns}
        data={data}
        sort={{ id: "name", direction: "ascending" }}
        onSortChange={(s) => calls.push(`${s.id}:${s.direction}`)}
      />,
    );
    expect(document.querySelector('td[data-label="Group size"]')).toBeTruthy();
    fireEvent.click(within(screen.getByRole("columnheader", { name: /Name/ })).getByRole("button"));
    expect(calls).toEqual(["name:descending"]);
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("omits the sort select in scroll mode", () => {
    render(<DataTable caption="People" columns={columns} data={data} scroll />);
    expect(screen.queryByLabelText("Sort by")).toBeNull();
    expect(document.querySelector(".scroll-table")).toBeTruthy();
  });
});

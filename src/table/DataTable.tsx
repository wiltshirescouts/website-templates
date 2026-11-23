import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingFn,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type ReactNode, useId, useMemo, useState } from "react";
import { cn } from "../lib/cn";

export type SortDirection = "ascending" | "descending";
export interface SortState {
  /** Column `id`. */
  id: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Unique id. Defaults to the accessor key when that is a string. */
  id?: string;
  /** Visible heading. Also used as the card label on narrow screens and in announcements. */
  header: string;
  /** A key of the row, or a function returning the sort value. */
  accessor: keyof T | ((row: T) => string | number | Date | null | undefined);
  /** How to compare values. Default text (locale-aware); number also handles Dates. */
  type?: "text" | "number";
  /** Right-align (numbers, money). */
  numeric?: boolean;
  /** Custom cell content. Defaults to the accessor value. */
  cell?: (row: T) => ReactNode;
  /** Set false for a heading that does not sort. */
  sortable?: boolean;
  /** Render this column's cells as the row header (`th scope="row"`). Default: the first column. */
  rowHeader?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** The table's accessible name. The sorted state is appended automatically. */
  caption: string;
  getRowId?: (row: T, index: number) => string;
  /** Initial sort (uncontrolled). */
  defaultSort?: SortState;
  /** Controlled sort. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Shown above the table, outside the card (search, filters). */
  toolbar?: ReactNode;
  /** Shown inside the card below the table (use `TableFoot`). */
  footer?: ReactNode;
  /** Keep a real table on narrow screens and scroll sideways with the first column pinned, instead of cards. */
  scroll?: boolean;
  /** Message when there are no rows. */
  empty?: ReactNode;
  className?: string;
}

const opposite = (d: SortDirection): SortDirection => (d === "ascending" ? "descending" : "ascending");

const toNumber = (v: unknown) => (v instanceof Date ? v.getTime() : Number(v));

const textSort: SortingFn<unknown> = (a, b, id) =>
  String(a.getValue(id) ?? "").localeCompare(String(b.getValue(id) ?? ""), "en-GB", {
    numeric: true,
    sensitivity: "base",
  });
const numberSort: SortingFn<unknown> = (a, b, id) => toNumber(a.getValue(id)) - toNumber(b.getValue(id));

function colId<T>(c: DataTableColumn<T>, i: number) {
  return c.id ?? (typeof c.accessor === "string" ? c.accessor : `col-${i}`);
}

/**
 * Sortable data table. Headings are buttons with aria-sort and hidden state text; changes are announced in a polite
 * live region. Below 640px rows become cards with a "Sort by" select and direction button (or set `scroll`).
 */
export function DataTable<T>({
  columns,
  data,
  caption,
  getRowId,
  defaultSort,
  sort: sortProp,
  onSortChange,
  toolbar,
  footer,
  scroll,
  empty,
  className,
}: DataTableProps<T>) {
  const uid = useId();
  const [inner, setInner] = useState<SortState | null>(defaultSort ?? null);
  const [announce, setAnnounce] = useState("");
  const sort = sortProp !== undefined ? sortProp : inner;

  // Stable column definitions: new ones on every render make TanStack Table reset its state in a loop.
  const defs: ColumnDef<T>[] = useMemo(
    () =>
      columns.map((c, i) => ({
        id: colId(c, i),
        header: c.header,
        accessorFn: (row: T) =>
          typeof c.accessor === "function" ? c.accessor(row) : (row[c.accessor] as unknown),
        sortingFn: (c.type === "number" ? numberSort : textSort) as unknown as SortingFn<T>,
        enableSorting: c.sortable !== false,
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: defs,
    state: { sorting: sort ? [{ id: sort.id, desc: sort.direction === "descending" }] : [] },
    getRowId: getRowId ? (row, i) => getRowId(row, i) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    enableMultiSort: false,
    autoResetPageIndex: false,
  });

  const label = (id: string) => columns.find((c, i) => colId(c, i) === id)?.header ?? id;

  const apply = (next: SortState) => {
    if (sortProp === undefined) setInner(next);
    onSortChange?.(next);
    setAnnounce(`Table sorted by ${label(next.id)}, ${next.direction}.`);
  };
  const sortBy = (id: string) =>
    apply({ id, direction: sort?.id === id ? opposite(sort.direction) : "ascending" });

  const sortable = columns.map((c, i) => ({ c, id: colId(c, i) })).filter(({ c }) => c.sortable !== false);
  const rowHeaderIndex = Math.max(
    0,
    columns.findIndex((c) => c.rowHeader),
  );
  const rows: Row<T>[] = table.getRowModel().rows;
  const dir = sort?.direction ?? "ascending";
  const selectId = `${uid}-sort-select`;

  return (
    <>
      {toolbar}
      {!scroll && sortable.length > 0 && (
        <div className="mobile-sort">
          <div className="field">
            <label className="label" htmlFor={selectId}>
              Sort by
            </label>
            <select
              className="select"
              id={selectId}
              value={sort?.id ?? ""}
              onChange={(e) => apply({ id: e.target.value, direction: dir })}
            >
              {!sort && (
                <option value="" disabled>
                  Choose a column
                </option>
              )}
              {sortable.map(({ c, id }) => (
                <option key={id} value={id}>
                  {c.header}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-outline"
            type="button"
            style={{ minHeight: "3rem", minWidth: "7rem" }}
            aria-label={`${dir === "ascending" ? "A to Z" : "Z to A"}. Sort direction: ${dir}. Activate to sort ${opposite(dir)}.`}
            onClick={() => apply({ id: sort?.id ?? sortable[0]?.id ?? "", direction: opposite(dir) })}
          >
            {dir === "ascending" ? (
              <ArrowUp className="icon icon-md" aria-hidden="true" focusable="false" />
            ) : (
              <ArrowDown className="icon icon-md" aria-hidden="true" focusable="false" />
            )}
            <span>{dir === "ascending" ? "A to Z" : "Z to A"}</span>
          </button>
        </div>
      )}
      <div
        className={cn("table-wrap", scroll && "scroll-table", className)}
        {...(scroll ? { tabIndex: 0, role: "region", "aria-label": `${caption} (scrollable)` } : {})}
      >
        <table className="data">
          <caption>
            {caption}
            {sort && (
              <>
                , sorted by {label(sort.id).toLowerCase()}, {sort.direction}
              </>
            )}
          </caption>
          <thead>
            <tr>
              {columns.map((c, i) => {
                const id = colId(c, i);
                const active = sort?.id === id;
                return (
                  <th
                    key={id}
                    scope="col"
                    className={c.numeric ? "num" : undefined}
                    aria-sort={active ? sort.direction : undefined}
                    style={c.sortable === false ? { paddingInline: "1rem" } : undefined}
                  >
                    {c.sortable === false ? (
                      c.header
                    ) : (
                      <button className="sort-btn" type="button" onClick={() => sortBy(id)}>
                        <span>{c.header}</span>
                        <ArrowUpDown
                          className="icon icon-sm icon-none"
                          aria-hidden="true"
                          focusable="false"
                        />
                        <ArrowUp className="icon icon-sm icon-asc" aria-hidden="true" focusable="false" />
                        <ArrowDown className="icon icon-sm icon-desc" aria-hidden="true" focusable="false" />
                        <span className="sr-only sort-hint">
                          {active
                            ? `, sorted ${sort.direction}. Activate to sort ${opposite(sort.direction)}.`
                            : ". Not sorted. Activate to sort ascending."}
                        </span>
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>{empty ?? "No results."}</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c, i) => {
                  const content = c.cell ? c.cell(r.original) : (r.getValue(colId(c, i)) as ReactNode);
                  const cls = c.numeric ? "num" : undefined;
                  return i === rowHeaderIndex ? (
                    <th key={colId(c, i)} scope="row" className={cls}>
                      {content}
                    </th>
                  ) : (
                    <td key={colId(c, i)} data-label={c.header} className={cls}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {footer}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
    </>
  );
}

/** "Showing 1 to 8 of 42" with an optional pager (children), for the `footer` slot. */
export function TableFoot({ summary, children }: { summary: ReactNode; children?: ReactNode }) {
  return (
    <div className="table-foot">
      <span>{summary}</span>
      {children && <div className="pager">{children}</div>}
    </div>
  );
}

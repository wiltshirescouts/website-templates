import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useId, useMemo, useState } from "react";
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
  /** Message when there are no rows. Shown centred and muted, across every column. */
  empty?: ReactNode;
  /** Set false to turn sorting off for every column: no sort buttons, no "Sort by" select, no `aria-sort`. Default true. */
  sortable?: boolean;
  /** Hide the caption visually. It stays as the table's accessible name. */
  captionHidden?: boolean;
  /**
   * Which cell is the row header. `true` (default): the column flagged `rowHeader`, else the first. `false`: none, every
   * cell is a `td`. A string: the `id` of the column to use.
   */
  rowHeader?: boolean | string;
  /** Extra attributes for each body row (class, data attributes, `aria-*`). `index` is the row's position in `data`. */
  rowProps?: (row: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  className?: string;
}

const opposite = (d: SortDirection): SortDirection => (d === "ascending" ? "descending" : "ascending");

const toNumber = (v: unknown) => (v instanceof Date ? v.getTime() : Number(v));

const textSort = (a: unknown, b: unknown) =>
  String(a ?? "").localeCompare(String(b ?? ""), "en-GB", { numeric: true, sensitivity: "base" });
const numberSort = (a: unknown, b: unknown) => toNumber(a) - toNumber(b);

function readValue<T>(c: DataTableColumn<T>, row: T): unknown {
  return typeof c.accessor === "function" ? c.accessor(row) : (row[c.accessor] as unknown);
}

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
  sortable: sortableProp = true,
  captionHidden,
  rowHeader = true,
  rowProps,
  className,
}: DataTableProps<T>) {
  const uid = useId();
  const [inner, setInner] = useState<SortState | null>(defaultSort ?? null);
  const [announce, setAnnounce] = useState("");
  const sort = !sortableProp ? null : sortProp !== undefined ? sortProp : inner;

  // Rows in sorted order. Array.prototype.sort is stable, so equal rows keep their original order.
  const rows = useMemo(() => {
    const all = data.map((original, i) => ({
      id: getRowId ? getRowId(original, i) : String(i),
      index: i,
      original,
    }));
    const idx = sort ? columns.findIndex((c, i) => colId(c, i) === sort.id) : -1;
    const col = columns[idx];
    if (!sort || !col) return all;
    const cmp = col.type === "number" ? numberSort : textSort;
    const mult = sort.direction === "ascending" ? 1 : -1;
    return [...all].sort((a, b) => mult * cmp(readValue(col, a.original), readValue(col, b.original)));
  }, [data, columns, sort, getRowId]);

  const label = (id: string) => columns.find((c, i) => colId(c, i) === id)?.header ?? id;

  const apply = (next: SortState) => {
    if (sortProp === undefined) setInner(next);
    onSortChange?.(next);
    setAnnounce(`Table sorted by ${label(next.id)}, ${next.direction}.`);
  };
  const sortBy = (id: string) =>
    apply({ id, direction: sort?.id === id ? opposite(sort.direction) : "ascending" });

  const sortable = sortableProp
    ? columns.map((c, i) => ({ c, id: colId(c, i) })).filter(({ c }) => c.sortable !== false)
    : [];
  const flagged = Math.max(
    0,
    columns.findIndex((c) => c.rowHeader),
  );
  const named = typeof rowHeader === "string" ? columns.findIndex((c, i) => colId(c, i) === rowHeader) : -1;
  const rowHeaderIndex = rowHeader === false ? -1 : named >= 0 ? named : flagged;
  const dir = sort?.direction ?? "ascending";
  const selectId = `${uid}-sort-select`;

  return (
    <>
      {toolbar && <div className="data-table-toolbar">{toolbar}</div>}
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
          <caption className={captionHidden ? "sr-only" : undefined}>
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
                const plain = !sortableProp || c.sortable === false;
                return (
                  <th
                    key={id}
                    scope="col"
                    className={c.numeric ? "num" : undefined}
                    aria-sort={active && sort ? sort.direction : undefined}
                    style={plain ? { paddingInline: "1rem" } : undefined}
                  >
                    {plain ? (
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
                          {active && sort
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
              <tr className="data-empty">
                <td colSpan={columns.length}>{empty ?? "No results."}</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} {...rowProps?.(r.original, r.index)}>
                {columns.map((c, i) => {
                  const content = c.cell ? c.cell(r.original) : (readValue(c, r.original) as ReactNode);
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

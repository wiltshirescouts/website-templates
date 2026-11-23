import {
  Button,
  ButtonLink,
  DataTable,
  type DataTableColumn,
  type NavItem,
  PageHeader,
  SearchField,
  Select,
  type SortDirection,
  StatusChip,
  TableFoot,
} from "@wiltshirescouts/theme";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  ListChecks,
  Shield,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Site, signedIn } from "../site";

type Status = "Confirmed" | "Provisional" | "Withdrawn";
interface Registration {
  name: string;
  district: string;
  group: number;
  deposit: number;
  registered: number;
  status: Status;
}

const rows: Registration[] = [
  {
    name: "Amara Okafor",
    district: "Mid Wiltshire",
    group: 2,
    deposit: 150,
    registered: 1795046400000,
    status: "Confirmed",
  },
  {
    name: "Ben Whitfield",
    district: "Swindon North",
    group: 1,
    deposit: 75,
    registered: 1794960000000,
    status: "Provisional",
  },
  {
    name: "Chloe Hartley",
    district: "Wiltshire West",
    group: 4,
    deposit: 300,
    registered: 1794441600000,
    status: "Confirmed",
  },
  {
    name: "Daniel Mercer",
    district: "Salisbury & South",
    group: 1,
    deposit: 0,
    registered: 1794182400000,
    status: "Provisional",
  },
  {
    name: "Eleni Kosta",
    district: "North East Wiltshire",
    group: 3,
    deposit: 225,
    registered: 1793750400000,
    status: "Confirmed",
  },
  {
    name: "Finn Gallagher",
    district: "Swindon Ridgeway",
    group: 2,
    deposit: 150,
    registered: 1793145600000,
    status: "Withdrawn",
  },
  {
    name: "Grace Lindqvist",
    district: "Wiltshire North",
    group: 1,
    deposit: 150,
    registered: 1792540800000,
    status: "Confirmed",
  },
  {
    name: "Harvey Moss",
    district: "Mid Wiltshire",
    group: 5,
    deposit: 375,
    registered: 1791936000000,
    status: "Provisional",
  },
];

const chip = {
  Confirmed: { tone: "success", icon: CircleCheck },
  Provisional: { tone: "warning", icon: Clock },
  Withdrawn: { tone: "muted", icon: CircleX },
} as const;

const money = (n: number) => `£${n.toFixed(2)}`;
const date = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const columns: DataTableColumn<Registration>[] = [
  { header: "Name", accessor: "name", cell: (r) => <a href="#">{r.name}</a> },
  { header: "District", accessor: "district" },
  { header: "Group size", accessor: "group", type: "number", numeric: true },
  {
    header: "Deposit paid",
    accessor: "deposit",
    type: "number",
    numeric: true,
    cell: (r) => money(r.deposit),
  },
  { header: "Registered", accessor: "registered", type: "number", cell: (r) => date(r.registered) },
  {
    header: "Status",
    accessor: "status",
    sortable: false,
    cell: (r) => (
      <StatusChip tone={chip[r.status].tone} icon={chip[r.status].icon}>
        {r.status}
      </StatusChip>
    ),
  },
];

const adminNav: NavItem[] = [
  { label: "Admin", href: "#", icon: Shield },
  { label: "Assess", href: "#", icon: ClipboardCheck },
  { label: "Review", href: "#", icon: Eye, current: true },
  { label: "Leaderboard", href: "#", icon: Trophy },
  { label: "Selection", href: "#", icon: ListChecks },
];

/** `?sort=<colIndex>:<ascending|descending>`, as in the mockup. */
function initialSort() {
  const q = new URLSearchParams(window.location.search).get("sort");
  const [i, d] = (q ?? "4:descending").split(":");
  const col = columns[Number(i)];
  const direction: SortDirection = d === "ascending" ? "ascending" : "descending";
  return { id: typeof col?.accessor === "string" ? col.accessor : "registered", direction };
}

export default function Table() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All statuses");
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "All statuses" || r.status === status) &&
          `${r.name} ${r.district}`.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [q, status],
  );
  const filtered = shown.length !== rows.length;

  return (
    <Site title="Trip registrations" nav={adminNav} account={signedIn}>
      <PageHeader
        title="Registrations"
        intro="42 sign-ups for Jamboree Alternative 2027. All names and figures are fictional."
        actions={
          <ButtonLink variant="outline" href="#">
            <Download className="icon icon-md" aria-hidden="true" focusable="false" />
            Export CSV
          </ButtonLink>
        }
      />
      <DataTable
        caption="Registrations"
        columns={columns}
        data={shown}
        getRowId={(r) => r.name}
        defaultSort={initialSort()}
        empty="No registrations match your search."
        toolbar={
          <div className="toolbar">
            <SearchField placeholder="Name or district" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="field small">
              <label className="label" htmlFor="status">
                Status
              </label>
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>All statuses</option>
                <option>Confirmed</option>
                <option>Provisional</option>
                <option>Withdrawn</option>
              </Select>
            </div>
          </div>
        }
        footer={
          <TableFoot
            summary={filtered ? `Showing ${shown.length} of 8 on this page` : "Showing 1 to 8 of 42"}
          >
            <Button variant="outline" disabled aria-label="Previous page">
              <ChevronLeft className="icon icon-md" aria-hidden="true" focusable="false" />
              Previous
            </Button>
            <Button variant="outline" aria-label="Next page">
              Next
              <ChevronRight className="icon icon-md" aria-hidden="true" focusable="false" />
            </Button>
          </TableFoot>
        }
      />
    </Site>
  );
}

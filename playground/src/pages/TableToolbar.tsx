import { DataTable, Field, SearchField, Select, TableFoot } from "@wiltshirescouts/theme";
import { useState } from "react";
import { Site, signedIn } from "../site";

const rows = [
  { slug: "go.example.org/jaws", owner: "Alex Example", created: 3 },
  { slug: "go.example.org/camp", owner: "Sam Sample", created: 2 },
];

/** A toolbar built by a site with its own flex row (no .toolbar class), under a section heading. */
export default function TableToolbar() {
  const [q, setQ] = useState("");
  return (
    <Site title="Short links" account={signedIn}>
      <h1>Short links</h1>
      <section aria-labelledby="your-links" style={{ marginTop: "2rem" }}>
        <h2 id="your-links">Your links</h2>
        <DataTable
          caption="Your links"
          data={rows}
          getRowId={(r) => r.slug}
          columns={[
            { id: "slug", header: "Short link", accessor: "slug", rowHeader: true },
            { id: "owner", header: "Owner", accessor: "owner" },
            { id: "created", header: "Created", accessor: "created", type: "number" },
          ]}
          toolbar={
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                alignItems: "end",
                marginBottom: "1rem",
              }}
            >
              <SearchField
                label="Search links"
                placeholder="Title, short link or destination"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Field label="Show" id="scope">
                <Select defaultValue="mine">
                  <option value="mine">My links and my teams' links</option>
                  <option value="all">All links</option>
                </Select>
              </Field>
            </div>
          }
          footer={<TableFoot summary="Showing 2 of 2 links" />}
        />
      </section>
    </Site>
  );
}

import {
  BarList,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
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
  PageHeader,
  StatCard,
  StatusChip,
  Steps,
  SummaryCard,
  SummaryList,
} from "@wiltshirescouts/theme";
import { CalendarDays, CircleCheck, Clock, FileText, MapPin, PlaneTakeoff, Send, Users } from "lucide-react";
import { Site, signedIn } from "../site";

interface Country {
  id: string;
  country: string;
  visits: number;
}
const countries: Country[] = [
  { id: "fr", country: "France", visits: 14 },
  { id: "no", country: "Norway", visits: 9 },
  { id: "pl", country: "Poland", visits: 5 },
  { id: "jp", country: "Japan", visits: 0 },
];
const countryColumns: DataTableColumn<Country>[] = [
  { header: "Country", accessor: "country" },
  { header: "Visits", accessor: "visits", type: "number", numeric: true },
];

export default function Pieces06() {
  return (
    <Site title="Visits Abroad" account={signedIn}>
      <PageHeader
        title="Page pieces (0.6)"
        intro="Building blocks for the visits abroad review and report pages."
      />

      <NavTabs
        ariaLabel="Visit sections"
        items={[
          { label: "Overview", href: "#overview", current: true, icon: FileText },
          { label: "Itinerary", href: "#itinerary", icon: PlaneTakeoff },
          { label: "Participants", href: "#participants", icon: Users },
          { label: "History", href: "#history" },
        ]}
      />

      <div className="two-col two-col--sticky" style={{ marginTop: "1rem" }}>
        <div style={{ display: "grid", gap: "1.5rem", minWidth: 0 }}>
          <section id="overview" aria-labelledby="overview-h" style={{ display: "grid", gap: "1rem" }}>
            <h2 id="overview-h">Review progress</h2>
            <Steps
              ariaLabel="Review stages"
              steps={[
                "Submitted",
                "County check",
                "Regional check",
                "International check",
                "Decision",
                "Report",
              ]}
              current={3}
            />
            <Steps
              ariaLabel="Review stages, finished"
              steps={["Submitted", "Checked", "Decision"]}
              current={4}
              doneTone="success"
            />
            <Steps steps={["Not shown"]} current={0} />
            <FactsCard
              layout="grid"
              facts={[
                { icon: MapPin, label: "Destination", value: "Lyon, France" },
                { icon: CalendarDays, label: "Dates", value: "2 to 9 August 2026" },
                { icon: Users, label: "Group size", value: "24 people" },
                { icon: Clock, label: "Submitted", value: "12 May 2026" },
              ]}
            />
          </section>

          <section id="itinerary" aria-labelledby="itinerary-h" style={{ display: "grid", gap: "1rem" }}>
            <h2 id="itinerary-h">Visits</h2>
            <ItemCard
              title="Summer camp in Lyon"
              href="#visit-1"
              headingLevel={3}
              chips={
                <>
                  <StatusChip tone="solid" icon={CircleCheck}>
                    Approved
                  </StatusChip>
                  <StatusChip tone="info" wrap>
                    Report due in 30 days
                  </StatusChip>
                </>
              }
              meta={
                <>
                  <span>2 to 9 August 2026</span>
                  <span>Leader: Sam Taylor</span>
                </>
              }
              actions={
                <>
                  <ButtonLink href="#visit-1" variant="outline">
                    View visit
                  </ButtonLink>
                  <Button variant="outline">Start report</Button>
                </>
              }
            >
              <p>Troop trip with two nights in a hostel and a day at a sailing centre.</p>
            </ItemCard>
            <ItemCard
              title="Winter weekend in Bergen"
              headingLevel={3}
              chips={
                <StatusChip tone="warning" wrap>
                  Changes requested
                </StatusChip>
              }
              meta="Leader: Priya Shah"
              callout="Please add the second adult's DBS number to part B before resubmitting."
              calloutTone="warning"
              actions={<Button>Edit and resubmit</Button>}
            />
            <ItemCard
              title="Day trip to Cherbourg"
              headingLevel={3}
              chips={<StatusChip>Draft</StatusChip>}
              callout="Saved automatically. Nobody else can see this yet."
              actions={
                <Button variant="outline">
                  <Send className="icon icon-md" aria-hidden="true" focusable="false" />
                  Submit
                </Button>
              }
            />
          </section>

          <section id="participants" aria-labelledby="summary-h" style={{ display: "grid", gap: "1rem" }}>
            <h2 id="summary-h">Check your answers</h2>
            <SummaryCard
              title="About the visit"
              headingLevel={3}
              action={{ href: "#about", hiddenText: "about the visit" }}
            >
              <SummaryList
                ariaLabel="About the visit"
                rows={[
                  {
                    key: "Destinations",
                    value: "Lyon, France\nAnnecy, France",
                    action: { href: "#dest", hiddenText: "destinations" },
                  },
                  {
                    key: "Dates",
                    value: "2 to 9 August 2026",
                    action: { onClick: () => {}, hiddenText: "dates" },
                  },
                  { key: "Insurance", value: "  " },
                  { key: "Notes", value: null },
                ]}
              />
            </SummaryCard>
            <SummaryList
              rows={[
                { key: "Leader", value: "Sam Taylor" },
                { key: "A very long label that has to wrap in the narrow column", value: "Yes" },
              ]}
            />
            <Disclosure summary="What happens next?" bordered>
              <p>The county international contact checks your answers and replies within ten working days.</p>
            </Disclosure>
            <Disclosure summary="Withdraw this visit" tone="destructive" bordered>
              <p>Withdrawing cannot be undone. Your answers are kept for audit.</p>
              <Button variant="destructive">Withdraw visit</Button>
            </Disclosure>
            <Disclosure summary="Show earlier answers">
              <p>Earlier answers appear here.</p>
            </Disclosure>
            <Callout title="Declaration">
              <p>
                I confirm the information is correct and the group has the right adult to young person ratio.
              </p>
            </Callout>
            <Callout tone="neutral">
              <p>Your answers are saved as you go.</p>
            </Callout>
          </section>

          <section id="history" aria-labelledby="history-h" style={{ display: "grid", gap: "1rem" }}>
            <h2 id="history-h">History</h2>
            <CommentCard
              label="Changes requested"
              author="Jo Reviewer"
              at="14 May 2026, 10:15"
              context="Part B, version 2"
              tone="warning"
            >
              {"Please add the second adult's DBS number.\nAlso confirm the hostel's fire certificate."}
            </CommentCard>
            <CommentCard label="Comment" author="Sam Taylor" at="13 May 2026, 18:02">
              Thanks, will do.
            </CommentCard>
            <HistoryList
              ariaLabel="Versions of part B"
              items={[
                { label: "Version 3", href: "#v3", current: true, meta: "Saved 15 May 2026" },
                {
                  label: "Version 2",
                  href: "#v2",
                  meta: "Submitted 12 May 2026",
                  chips: <StatusChip tone="warning">Changes requested</StatusChip>,
                },
                { label: "Version 1", href: "#v1", meta: "Draft" },
              ]}
            />
          </section>

          <section aria-labelledby="stats-h" style={{ display: "grid", gap: "1rem" }}>
            <h2 id="stats-h">Report</h2>
            <div className="card-grid">
              <StatCard
                icon={PlaneTakeoff}
                label="Visits this year"
                value={28}
                hint="4 more than last year"
              />
              <StatCard icon={Users} label="Young people" value="412" />
              <StatCard label="Average group size" value="14.7" headingLevel={3} />
            </div>
            <div className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
              <h3>Visits by country</h3>
              <BarList
                rows={countries.map((c) => ({ label: c.country, value: c.visits }))}
                format={(n) => `${n}`}
              />
              <DataTable
                caption="Visits by country"
                captionHidden
                sortable={false}
                columns={countryColumns}
                data={countries}
                getRowId={(r) => r.id}
                rowProps={(r) => (r.visits === 0 ? { className: "is-zero" } : {})}
              />
            </div>
            <Meter label="Reports received" value={18} max={28} text="18 of 28" />
            <DataTable
              sortable={false}
              caption="Visits with no entries"
              columns={countryColumns}
              data={[]}
              empty="No visits match your filters."
            />
          </section>

          <ConfirmationPanel title="Visit submitted" reference="VA-2026-0042" headingLevel={2}>
            <p>We have emailed a copy to you. The county contact will reply within ten working days.</p>
          </ConfirmationPanel>

          <form onSubmit={(e) => e.preventDefault()}>
            <p>Make sure everything is correct before you send it.</p>
            <div className="form-actions form-actions--sticky">
              <Button variant="outline">Save and come back later</Button>
              <Button type="submit">Send for review</Button>
            </div>
          </form>
        </div>

        <aside style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <OnThisPage
            items={[
              { label: "Review progress", href: "#overview" },
              { label: "Visits", href: "#itinerary" },
              { label: "Check your answers", href: "#participants" },
              { label: "History", href: "#history" },
            ]}
          />
        </aside>
      </div>

      <section aria-labelledby="lists-title" style={{ marginTop: "2rem" }}>
        <h2 id="lists-title" className="section-title">
          Plain lists in boxes
        </h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          <Card data-testid="list-card">
            <CardHeader>
              <CardTitle>Before you start</CardTitle>
            </CardHeader>
            <CardBody>
              <ul>
                <li>Read the guidance and the rules for visits abroad.</li>
                <li>Check the travel advice for every country you will visit, every time you submit.</li>
                <li>Make sure the whole party has insurance that covers every planned activity.</li>
                <li>
                  https://www.example.org/a-very-long-web-address-with-no-spaces-in-it/that-keeps-going/and-going/and-going
                </li>
              </ul>
            </CardBody>
          </Card>
          <Callout>
            <p>
              <strong>As leader of this party, I undertake to:</strong>
            </p>
            <ul data-testid="list-callout">
              <li>Organise this visit in accordance with the rules.</li>
              <li>Arrange adequate travel insurance for the party.</li>
            </ul>
          </Callout>
          <Card>
            <CardBody>
              <ul className="own-list" data-testid="list-classed">
                <li>A list with its own class keeps whatever its site gives it.</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>
    </Site>
  );
}

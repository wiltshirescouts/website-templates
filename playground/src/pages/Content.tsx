import { Alert, ButtonLink, Breadcrumb, Card, CardBody, Eyebrow } from "@wiltshirescouts/theme";
import { CalendarDays, ChevronRight, Mail, PlaneTakeoff, UserPlus, Users } from "lucide-react";
import { publicNav, Site, signedOut } from "../site";

const dates = [
  { label: "Opens", icon: CalendarDays, date: "1 February 2027", note: "Sign-ups open to everyone." },
  { label: "Closes", icon: CalendarDays, date: "31 March 2027", note: "Last day to sign up." },
  { label: "Departure", icon: PlaneTakeoff, date: "24 July 2027", note: "Travelling together from Swindon." },
];
const links = ["Costs and payments", "Kit list", "Safeguarding on trips", "Frequently asked questions"];

export default function Content() {
  return (
    <Site title="Wiltshire Scouts International Trips and Jamboree Info" nav={publicNav("Trips")} account={signedOut}>
      <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Trips", href: "#" }, { label: "Jamboree Alternative" }]} />
      <section className="hero" aria-labelledby="page-title">
        <div>
          <h1 id="page-title">Jamboree Alternative 2027</h1>
          <p>
            A two-week international adventure for Scouts, Explorers and volunteers from across Wiltshire. Read how
            it works, then sign up in about five minutes.
          </p>
        </div>
        <div className="hero__actions">
          <ButtonLink variant="onPurple" href="#">
            <UserPlus className="icon icon-md" aria-hidden="true" focusable="false" />
            Adult sign-up
          </ButtonLink>
          <ButtonLink variant="outlineOnPurple" href="#">
            <Users className="icon icon-md" aria-hidden="true" focusable="false" />
            Young person sign-up
          </ButtonLink>
        </div>
      </section>
      <div className="two-col">
        <article className="prose">
          <h2 style={{ marginTop: 0 }}>Who can take part</h2>
          <p>
            The trip is open to Scouts and Explorers aged 14 to 17 on 1 August 2027, and to adult volunteers who are
            at least 18. You do not need to have been abroad with Scouts before.
          </p>
          <ul>
            <li>Young people need a parent or carer’s consent.</li>
            <li>Adults must hold a current Disclosure and Barring Service check through Scouts.</li>
            <li>Everyone completes the health and dietary form before the deposit is due.</li>
          </ul>
          <Alert kind="info" title="Deposit">
            <p>
              A £150 deposit secures a place. The trip team send payment details separately. No payment is taken
              through this website.
            </p>
          </Alert>
          <h2>How places are decided</h2>
          <p>
            The trip team review every sign-up and build a balanced group. You will hear the outcome by email within
            two weeks of the closing date. Your place is provisional until the trip team confirm it.
          </p>
          <h3>Key dates</h3>
          <div className="card-grid" style={{ marginTop: ".5rem" }}>
            {dates.map(({ label, icon: Icon, date, note }) => (
              <Card key={label}>
                <CardBody>
                  <Eyebrow>
                    <Icon className="icon icon-sm" aria-hidden="true" focusable="false" /> {label}
                  </Eyebrow>
                  <h3 style={{ marginTop: ".25rem" }}>{date}</h3>
                  <p className="hint" style={{ marginTop: ".25rem" }}>
                    {note}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </article>
        <aside aria-label="Related">
          <Card>
            <CardBody>
              <h2 style={{ fontSize: "1.0625rem" }}>Useful links</h2>
              <ul className="aside-list" style={{ marginTop: ".5rem" }}>
                {links.map((l) => (
                  <li key={l}>
                    <a href="#">
                      {l} <ChevronRight className="icon icon-md" aria-hidden="true" focusable="false" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card className="mt-4">
            <CardBody>
              <h2 style={{ fontSize: "1.0625rem" }}>Questions?</h2>
              <p style={{ margin: ".5rem 0 .75rem" }}>
                Email the trip team and we will reply within three working days.
              </p>
              <ButtonLink variant="outline" href="#">
                <Mail className="icon icon-md" aria-hidden="true" focusable="false" />
                Contact the team
              </ButtonLink>
            </CardBody>
          </Card>
        </aside>
      </div>
    </Site>
  );
}

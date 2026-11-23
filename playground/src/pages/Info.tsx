import {
  ButtonLink,
  FactsCard,
  InfoPanel,
  PageShell,
  SignupCard,
  SignupGrid,
  SiteFooter,
  SiteHeader,
  Tab,
  TabPanel,
  Tabs,
  TabsList,
} from "@wiltshirescouts/theme";
import { ArrowRight, Bell, CalendarDays, CirclePlay, Mail, PoundSterling } from "lucide-react";
import { useState } from "react";
import { MountainArt } from "../art";
import { colourOnly } from "../site";

const TABS = ["places", "deposit", "video"];

export default function Info() {
  const initial = new URLSearchParams(location.search).get("tab");
  const [tab, setTab] = useState(initial && TABS.includes(initial) ? initial : "places");
  return (
    <PageShell>
      <SiteHeader title="International Sign-Ups" account={colourOnly} />
      <InfoPanel
        art={<MountainArt palette="green" cover />}
        artNote="Placeholder photo"
        backHref="#"
        title="Jamboree Alternative"
        intro={
          <>
            <p>
              JAWS (Jamboree Alternative Wiltshire Scouts) is an international adventure for young people
              across Wiltshire, running alongside the 2027 World Scout Jamboree.
            </p>
            <p>
              You’ll spend a week at an international Scout centre in the mountains, taking on new challenges,
              building independence and making friends with Scouts from around the world.
            </p>
            <p>
              The programme is still being planned. Watch the video below for a taste of what’s on offer, and
              check whether you’re eligible on the sign-up form.
            </p>
          </>
        }
      >
        <FactsCard
          facts={[
            { icon: CalendarDays, label: "Event dates", value: "27 Jul 2027 to 7 Aug 2027" },
            { icon: PoundSterling, label: "Cost", value: "£1,500 per person" },
          ]}
          contact={
            <>
              <ButtonLink variant="outline" href="#">
                <Mail className="icon icon-md" aria-hidden="true" focusable="false" />
                Contact the leader team
              </ButtonLink>
              <small>internationals@example.org</small>
            </>
          }
        />
        <SignupGrid>
          <SignupCard
            id="su-a"
            title="Adult sign-up"
            description="For adults who would like to join the leader team or the trip."
            eligibility={[
              "You must be at least 18 years old on 1 Aug 2026. If your 18th birthday is on that date, you qualify.",
            ]}
            action={
              <ButtonLink size="lg" className="push" href="#">
                Adult sign-up
                <ArrowRight className="icon icon-md" aria-hidden="true" focusable="false" />
              </ButtonLink>
            }
          />
          <SignupCard
            id="su-y"
            title="Young person sign-up"
            description="For young people taking part in the trip."
            status="Sign-ups are not open yet."
            action={
              <ButtonLink variant="outline" size="lg" className="push" href="#">
                <Bell className="icon icon-md" aria-hidden="true" focusable="false" />
                Notify me when sign-ups open
              </ButtonLink>
            }
          />
        </SignupGrid>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="More about the trip">
            <Tab value="places">How places are decided</Tab>
            <Tab value="deposit">Deposit</Tab>
            <Tab value="video">
              <CirclePlay className="icon icon-md" aria-hidden="true" focusable="false" />
              Watch video
            </Tab>
          </TabsList>
          <TabPanel value="places">
            <p>
              <strong>Young people:</strong> Places are offered on a first come, first served basis, in the
              order eligible sign-ups are received.
            </p>
            <p>
              <strong>Adults:</strong> The trip team will review adult applications to build the leader team
              and will contact you with the outcome.
            </p>
            <p>Every sign-up is provisional until the trip team confirms your place.</p>
          </TabPanel>
          <TabPanel value="deposit">
            <p>
              A deposit will be due to secure a place. The trip team will send payment details separately; no
              payment is taken through this website.
            </p>
          </TabPanel>
          <TabPanel value="video">
            <p>The video opens in a pop-up with captions.</p>
          </TabPanel>
        </Tabs>
      </InfoPanel>
      <SiteFooter />
    </PageShell>
  );
}

import {
  LibraryGrid,
  Main,
  NoticeBar,
  PageHeader,
  PageShell,
  SiteFooter,
  SiteHeader,
  TripCard,
} from "@wiltshirescouts/theme";
import { CalendarDays, CircleCheck, Clock, Lock, PoundSterling } from "lucide-react";
import { MountainArt } from "../art";
import { colourOnly } from "../site";

const dates = (v: string) => ({ icon: CalendarDays, label: "Dates", value: v });
const cost = (v: React.ReactNode) => ({ icon: PoundSterling, label: "Cost", value: v });
const open = (who: string) => ({
  tone: "success" as const,
  icon: CircleCheck,
  label: `${who} sign-up: open`,
});
const closed = (who: string) => ({ tone: "outline" as const, icon: Lock, label: `${who} sign-up: closed` });
const soon = (who: string) => ({
  tone: "warning" as const,
  icon: Clock,
  label: `${who} sign-up: opens soon`,
});

export default function Library() {
  return (
    <PageShell>
      <SiteHeader title="International Sign-Ups" account={colourOnly} />
      <Main>
        <PageHeader
          title="Wiltshire Scouts International Sign-Ups"
          intro="Choose a trip to see the details and sign up."
        />
        <NoticeBar
          heading="Hear about new international events"
          actionLabel="Join the mailing list"
          actionHref="#"
        />
        <LibraryGrid label="Trips">
          <TripCard
            title="Jamboree Alternative"
            href="#"
            image={<MountainArt palette="green" />}
            chips={[open("Adult"), closed("Young person")]}
            meta={[dates("27 Jul 2027 to 7 Aug 2027"), cost("£1,500 per person")]}
          />
          <TripCard
            title="WEWA 2028"
            href="#"
            image={<MountainArt palette="blue" />}
            chips={[closed("Adult"), closed("Young person")]}
            meta={[
              dates("13 Feb 2028 to 19 Feb 2028"),
              cost(
                <>
                  £1,500 to £2,000 per person <span style={{ fontWeight: 400 }}>(provisional)</span>
                </>,
              ),
            ]}
          />
          <TripCard
            title="Summer Camp Abroad 2029"
            href="#"
            image={<MountainArt palette="purple" />}
            chips={[soon("Adult"), soon("Young person")]}
            meta={[dates("To be confirmed"), cost("To be confirmed")]}
          />
        </LibraryGrid>
      </Main>
      <SiteFooter />
    </PageShell>
  );
}

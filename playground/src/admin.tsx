import {
  type AccountConfig,
  AdminShell,
  type NavItem,
  SubNav,
  type SubNavSection,
} from "@wiltshirescouts/theme";
import {
  Archive,
  Award,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  Mail,
  MessageSquareText,
  PieChart,
  Plug,
  Send,
  Settings,
  Trophy,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Site, signedIn } from "./site";

export const adminNav: NavItem[] = [
  { label: "Admin", href: "#", icon: Settings, current: true },
  { label: "Assess", href: "#", icon: ClipboardCheck },
  { label: "Review", href: "#", icon: BookOpenText },
  { label: "Leaderboard", href: "#", icon: Trophy },
  { label: "Selection", href: "#", icon: UsersRound },
];

const it = (label: string, icon: SubNavSection["items"][number]["icon"], current?: boolean) => ({
  label,
  href: "#",
  icon,
  current,
});

export const adminSections: SubNavSection[] = [
  {
    heading: "People",
    items: [it("Applicants", Users), it("Staff", UserCog), it("People summary", PieChart)],
  },
  {
    heading: "Configuration",
    items: [
      it("Event", CalendarDays),
      it("Criteria", ListChecks),
      it("Registration", ClipboardList),
      it("Emails", Mail, true),
      it("Connections", Plug),
      it("Users", UserCog),
      it("Audit and retention", Archive),
    ],
  },
  {
    heading: "Assessments",
    items: [it("Answers", MessageSquareText), it("Submit scores", Send), it("Results", Award)],
  },
];

export function AdminSite({
  children,
  account = signedIn,
}: {
  children: ReactNode;
  account?: AccountConfig;
}) {
  return (
    <Site title="Jamboree selection" nav={adminNav} account={account}>
      <AdminShell nav={<SubNav sections={adminSections} label="Admin sections" />}>{children}</AdminShell>
    </Site>
  );
}

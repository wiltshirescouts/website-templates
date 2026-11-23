import { BrevoStatus, PageHeader } from "@wiltshirescouts/theme";
import { AdminSite } from "../admin";
import { emailsIntro, Templates } from "../emailData";

export default function EmailsBrevoOff() {
  return (
    <AdminSite>
      <div style={{ marginBottom: "1rem" }}>
        <PageHeader title="Email templates" intro={emailsIntro} />
      </div>
      <BrevoStatus state="not-configured" />
      <div style={{ height: "1.25rem" }} />
      <Templates />
    </AdminSite>
  );
}

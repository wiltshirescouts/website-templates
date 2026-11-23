import { BrevoStatus, PageHeader } from "@wiltshirescouts/theme";
import { AdminSite } from "../admin";
import { emailsIntro, Templates } from "../emailData";

export default function Emails() {
  return (
    <AdminSite>
      <div style={{ marginBottom: "1rem" }}>
        <PageHeader title="Email templates" intro={emailsIntro} />
      </div>
      <BrevoStatus
        state="connected"
        sender="Wiltshire Scouts <jamboree@example.org>"
        senderVerified
        lastCheck="23 Nov 2026, 08:00 · all recent emails delivered"
        checkHref="#"
        openHref="https://app.brevo.com"
      />
      <Templates />
    </AdminSite>
  );
}

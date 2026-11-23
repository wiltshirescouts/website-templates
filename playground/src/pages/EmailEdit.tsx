import {
  Button,
  EditorCard,
  EditorGrid,
  EditorHeader,
  EmailPreviewFrame,
  Field,
  Input,
  type Placeholder,
  PlaceholderChips,
  StatusChip,
  Textarea,
  UnsavedChip,
} from "@wiltshirescouts/theme";
import { CircleCheck, RotateCcw, Save, Send } from "lucide-react";
import { useRef, useState } from "react";
import { AdminSite } from "../admin";

const DEFAULT_BODY = `Hello {{recipientName}},

Thank you so much for offering to help with {{eventName}}. We have received your details and we really appreciate your time.

One of the team will look at the volunteer offers and get in touch with you about what happens next. In the meantime you can see your confirmation here:

{{link}}

If you need to change anything you have told us, or you have a question, just reply to this email or write to {{contactEmail}}.

With thanks,
{{organisationName}}`;

const PLACEHOLDERS: Placeholder[] = [
  {
    token: "recipientName",
    label: "Recipient name",
    description: "The name of the person receiving the email.",
  },
  {
    token: "eventName",
    label: "Event name",
    description: "The name of the event, for example Jamboree Alternative 2027.",
  },
  { token: "eventStartDate", label: "Event start date", description: "The first day of the event." },
  { token: "eventEndDate", label: "Event end date", description: "The last day of the event." },
  { token: "link", label: "Link", description: "A web address for the person to see their confirmation." },
  {
    token: "contactEmail",
    label: "Contact email",
    description: "The address people can write to with questions.",
  },
  { token: "organisationName", label: "Organisation name", description: "Wiltshire Scouts." },
];

const SAMPLE: Record<string, string> = {
  recipientName: "Jordan Lee",
  eventName: "Jamboree Alternative 2027",
  eventStartDate: "27 Jul 2027",
  eventEndDate: "7 Aug 2027",
  link: "https://example.org/link/abc123",
  contactEmail: "internationals@example.org",
  organisationName: "Wiltshire Scouts",
};

/** Tiny stand-in for the shared server renderer: fills {{placeholders}}, escapes values, links web addresses. */
const fill = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k: string) => SAMPLE[k] ?? "");
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
function renderHtml(text: string): string {
  return fill(text)
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p>${esc(para)
          .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
          .replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

export default function EmailEdit() {
  const [subject, setSubject] = useState("Thanks for volunteering");
  const [body, setBody] = useState(DEFAULT_BODY);
  const [sent, setSent] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const dirty = body !== DEFAULT_BODY || subject !== "Thanks for volunteering";

  const insert = (token: string) => {
    const el = ref.current?.querySelector("textarea");
    const at = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? at;
    setBody(body.slice(0, at) + token + body.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + token.length, at + token.length);
    });
  };

  return (
    <AdminSite>
      <EditorHeader
        backHref="/emails"
        title="Thanks for volunteering"
        chips={
          <>
            <StatusChip tone="muted">Default</StatusChip>
            {(dirty || new URLSearchParams(location.search).get("dirty") !== "0") && <UnsavedChip />}
          </>
        }
        description="Sent automatically when a volunteer registration is received. To: The volunteer."
      />
      <div className="alert alert-info" role="note">
        <Send className="icon icon-md" aria-hidden="true" focusable="false" />
        <div>
          <p style={{ margin: 0 }}>
            Sends through Brevo as Wiltshire Scouts &lt;jamboree@example.org&gt;.{" "}
            <a href="#">Connection status</a>
          </p>
        </div>
      </div>
      <div style={{ height: "1rem" }} />
      <EditorGrid>
        <EditorCard title="Wording">
          <Field label="Subject" required hint="One line. You can use placeholders here too.">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <PlaceholderChips placeholders={PLACEHOLDERS} onInsert={insert} />
          <div ref={ref} style={{ display: "contents" }}>
            <Field
              label="Email text"
              required
              hint="Plain text. Leave a blank line between paragraphs. Web addresses become links."
            >
              <Textarea mono value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </div>
          {sent && (
            <p role="status" className="alert alert-success" style={{ margin: "0 0 1rem" }}>
              <CircleCheck className="icon icon-md" aria-hidden="true" focusable="false" />
              <span style={{ fontWeight: 700, color: "var(--foreground)" }}>
                Test email sent to alex@example.org through Brevo. It can take a minute to arrive.
              </span>
            </p>
          )}
          <div className="btn-row">
            <Button>
              <Save className="icon icon-md" aria-hidden="true" focusable="false" />
              Save
            </Button>
            <Button variant="purpleOutline" onClick={() => setSent(true)}>
              <Send className="icon icon-md" aria-hidden="true" focusable="false" />
              Send test email to me
            </Button>
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => {
                setBody(DEFAULT_BODY);
                setSubject("Thanks for volunteering");
              }}
            >
              <RotateCcw className="icon icon-md" aria-hidden="true" focusable="false" />
              Reset to default
            </Button>
          </div>
          <p className="hint" style={{ marginTop: ".75rem" }}>
            The test email uses the wording above (even if unsaved) with example details, and goes only to
            alex@example.org.
          </p>
        </EditorCard>
        <EditorCard title="Preview">
          <p className="hint" style={{ marginBottom: ".75rem" }}>
            This is how it looks with example details. Names and dates are made up. Emails always show on a
            light background, as in a mail client.
          </p>
          <EmailPreviewFrame
            from="Wiltshire Scouts <jamboree@example.org>"
            to="Jordan Lee"
            subject={fill(subject)}
            html={renderHtml(body)}
            text={fill(body)}
            footer="Wiltshire Scouts · #PlaceToBelong"
          />
        </EditorCard>
      </EditorGrid>
    </AdminSite>
  );
}

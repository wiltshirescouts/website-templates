import { ArrowLeft, Check, ExternalLink, Mail, Pencil, Plus, RefreshCw } from "lucide-react";
import { Children, type ReactNode, useId, useState } from "react";
import { BrandLogo } from "../layout/BrandLogo";
import { cn } from "../lib/cn";
import { Alert } from "../ui/Alert";
import { Button, ButtonLink } from "../ui/Button";
import { StatusChip } from "../ui/StatusChip";

/* ------------------------------------------------------------------ Brevo status */

export interface BrevoStatusProps {
  state: "connected" | "not-configured";
  /** For example `Wiltshire Scouts <jamboree@example.org>`. */
  sender?: string;
  senderVerified?: boolean;
  /** Pre-formatted, for example `23 Nov 2026, 08:00 · all recent emails delivered`. */
  lastCheck?: string;
  /** Re-check the connection. Give `onCheck` for a button or `checkHref` for a link. */
  onCheck?: () => void;
  checkHref?: string;
  openHref?: string;
  /** Text for the not set up state. */
  notConfigured?: { title: string; message: ReactNode };
  headingLevel?: 2 | 3;
}

const NOT_CONFIGURED = {
  title: "Email sending is not set up",
  message:
    "The Brevo API key is not configured, so no emails are sent, including thank-you emails, invitations and test emails. You can still edit and preview templates. See the setup steps in the README.",
};

/** Connected: a card with sender and last check. Not set up: a warning, since nothing is sent. */
export function BrevoStatus({
  state,
  sender,
  senderVerified,
  lastCheck,
  onCheck,
  checkHref,
  openHref,
  notConfigured = NOT_CONFIGURED,
  headingLevel = 2,
}: BrevoStatusProps) {
  if (state === "not-configured") {
    return (
      <Alert kind="warning" role="alert" title={notConfigured.title} headingLevel={headingLevel}>
        <p>{notConfigured.message}</p>
      </Alert>
    );
  }
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <section className="card brevo" aria-label="Brevo email sending">
      <div className="brevo__main">
        <span className="brevo__logo" aria-hidden="true">
          <Mail className="icon icon-md" focusable="false" />
        </span>
        <div>
          <div className="chips" style={{ alignItems: "center" }}>
            <H style={{ fontSize: "1.0625rem" }}>Sending through Brevo</H>
            <StatusChip tone="success" icon={Check}>
              Connected
            </StatusChip>
          </div>
          <dl>
            {sender && (
              <>
                <dt>Sender</dt>
                <dd>
                  {sender}
                  {senderVerified ? " · verified" : ""}
                </dd>
              </>
            )}
            {lastCheck && (
              <>
                <dt>Last check</dt>
                <dd>{lastCheck}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
      <div className="btn-row">
        {checkHref ? (
          <ButtonLink variant="outline" href={checkHref}>
            <RefreshCw className="icon icon-md" aria-hidden="true" focusable="false" />
            Check connection
          </ButtonLink>
        ) : (
          onCheck && (
            <Button variant="outline" onClick={onCheck}>
              <RefreshCw className="icon icon-md" aria-hidden="true" focusable="false" />
              Check connection
            </Button>
          )
        )}
        {openHref && (
          <ButtonLink variant="ghost" href={openHref} target="_blank" rel="noopener">
            Open Brevo <ExternalLink className="icon icon-md" aria-hidden="true" focusable="false" />
            <span className="sr-only">(opens in a new tab)</span>
          </ButtonLink>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ template list */

export function TemplateList({
  children,
  label = "Email templates",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <ul className="tpl-list" aria-label={label}>
      {children}
    </ul>
  );
}

export interface TemplateCardProps {
  title: string;
  description: string;
  /** Who receives it, without the "To:" prefix. */
  to: string;
  subject: string;
  /** For example `Last edited 21 Nov 2026, 14:02 by Alex Example` or `Never edited`. */
  edited: string;
  customised?: boolean;
  editHref: string;
  /** Extra actions shown above Edit, such as a primary "Send to all reviewers" button. */
  actions?: ReactNode;
  editLabel?: string;
}

/** One email template in the list (renders a list item; put inside `TemplateList`). */
export function TemplateCard({
  title,
  description,
  to,
  subject,
  edited,
  customised,
  editHref,
  actions,
  editLabel = "Edit",
}: TemplateCardProps) {
  const id = useId();
  return (
    <li>
      <article className="card tpl" aria-labelledby={id}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="chips" style={{ alignItems: "center" }}>
            <h2 id={id}>{title}</h2>
            {customised ? (
              <StatusChip tone="purple" icon={Pencil}>
                Customised
              </StatusChip>
            ) : (
              <StatusChip tone="muted">Default</StatusChip>
            )}
          </div>
          <p>{description}</p>
          <p className="small">To: {to}</p>
          <p style={{ fontSize: ".9375rem", marginTop: ".5rem" }}>
            <strong>Subject:</strong> {subject}
          </p>
          <p className="small">{edited}</p>
        </div>
        <div className="tpl-actions">
          {actions}
          <ButtonLink variant="purpleOutline" href={editHref} aria-label={`${editLabel} ${title}`}>
            <Pencil className="icon icon-md" aria-hidden="true" focusable="false" />
            {editLabel}
          </ButtonLink>
        </div>
      </article>
    </li>
  );
}

/* ------------------------------------------------------------------ editor */

export interface Placeholder {
  /** Token without braces, for example `recipientName`. */
  token: string;
  label: string;
  /** What it fills in; shown when the chip is hovered or focused. */
  description?: string;
}

export interface PlaceholderChipsProps {
  placeholders: Placeholder[];
  /** Called with the full token, for example `{{recipientName}}`, to insert at the cursor. */
  onInsert: (token: string, placeholder: Placeholder) => void;
  heading?: string;
  hint?: ReactNode;
  idleHelp?: string;
}

/** Insert buttons for `{{placeholders}}`. Each is a button with an accessible name "Insert <label>". */
export function PlaceholderChips({
  placeholders,
  onInsert,
  heading = "Insert a placeholder",
  hint = "Adds it at the cursor in the email text. Each one is replaced with the real detail when the email is sent.",
  idleHelp = "Point at or focus a placeholder to see what it fills in.",
}: PlaceholderChipsProps) {
  const id = useId();
  const [help, setHelp] = useState<string | null>(null);
  return (
    <div className="field">
      <p className="label" id={id} style={{ margin: 0 }}>
        {heading}
      </p>
      <p className="hint">{hint}</p>
      <ul
        aria-labelledby={id}
        style={{
          listStyle: "none",
          display: "flex",
          flexWrap: "wrap",
          gap: ".5rem",
          margin: ".25rem 0 0",
          padding: 0,
        }}
      >
        {placeholders.map((p) => {
          const show = () => setHelp(p.description ?? null);
          const clear = () => setHelp(null);
          return (
            <li key={p.token}>
              <button
                type="button"
                className="chip-btn"
                aria-label={`Insert ${p.label}`}
                onClick={() => onInsert(`{{${p.token}}}`, p)}
                onMouseEnter={show}
                onFocus={show}
                onMouseLeave={clear}
                onBlur={clear}
              >
                <Plus className="icon icon-sm" aria-hidden="true" focusable="false" />
                {p.label}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="hint" aria-live="polite" style={{ minHeight: "1.5rem", marginTop: ".25rem" }}>
        {help ?? idleHelp}
      </p>
    </div>
  );
}

export interface EmailPreviewFrameProps {
  from?: string;
  to: string;
  subject: string;
  /**
   * The rendered email body as HTML (paragraphs). Must be the output of the shared server renderer, which escapes
   * every value; the frame inserts it as markup.
   */
  html: string;
  /** The plain-text alternative. */
  text: string;
  /** Line under the email, for example `Wiltshire Scouts · #PlaceToBelong`. */
  footer?: string;
  logoAlt?: string;
  plainTextLabel?: string;
}

/** The email as a mail client shows it. The body is always light, whatever the colour mode. */
export function EmailPreviewFrame({
  from,
  to,
  subject,
  html,
  text,
  footer,
  logoAlt = "Scouts Wiltshire",
  plainTextLabel = "Plain text version",
}: EmailPreviewFrameProps) {
  return (
    <>
      <div className="email-frame">
        <dl>
          {from && (
            <>
              <dt>From</dt>
              <dd>{from}</dd>
            </>
          )}
          <dt>To</dt>
          <dd>{to}</dd>
          <dt>Subject</dt>
          <dd style={{ fontWeight: 700 }}>{subject}</dd>
        </dl>
        <div className="email-body">
          <div className="mail">
            <div className="mail-head">
              <BrandLogo on="purple" alt={logoAlt} />
            </div>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, escaped output of the shared renderer */}
            <div className="mail-text" dangerouslySetInnerHTML={{ __html: html }} />
            {footer && <div className="mail-foot">{footer}</div>}
          </div>
        </div>
      </div>
      <details className="plain">
        <summary>{plainTextLabel}</summary>
        <pre>{text}</pre>
      </details>
    </>
  );
}

/** Two columns on desktop (wording, preview); stacked on narrow screens. */
export function EditorGrid({ children }: { children: ReactNode }) {
  return <div className="editor-grid">{Children.toArray(children)}</div>;
}

/** One card in the editor, titled by an h2. */
export function EditorCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section className={cn("card", className)} aria-labelledby={id}>
      <div className="card__body">
        <h2 className="card-title" id={id}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export interface EditorHeaderProps {
  backHref: string;
  backLabel?: string;
  title: string;
  /** Status chips beside the title, for example Default and Unsaved changes. */
  chips?: ReactNode;
  description?: ReactNode;
}

export function EditorHeader({
  backHref,
  backLabel = "All emails",
  title,
  chips,
  description,
}: EditorHeaderProps) {
  return (
    <>
      <a className="back-link" href={backHref}>
        <ArrowLeft className="icon icon-md" aria-hidden="true" focusable="false" />
        {backLabel}
      </a>
      <div className="title-row">
        <h1>{title}</h1>
        {chips}
      </div>
      {description && <p style={{ maxWidth: "48rem", color: "var(--muted-foreground)" }}>{description}</p>}
    </>
  );
}

/** Convenience chip for "Unsaved changes". */
export function UnsavedChip({ children = "Unsaved changes" }: { children?: ReactNode }) {
  return (
    <StatusChip tone="warning" icon={Pencil}>
      {children}
    </StatusChip>
  );
}

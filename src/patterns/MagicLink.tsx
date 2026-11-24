import { Mail, MailCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Input } from "../forms/controls";
import { Field } from "../forms/Field";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";

/** "or", between two ways of signing in. */
export function OrDivider() {
  return (
    <div className="or-divider">
      <span>or</span>
    </div>
  );
}

export interface MagicLinkFormProps {
  /** Called with the address when the form is submitted. */
  onSubmit: (email: string) => void;
  defaultEmail?: string;
  /** Message for the address field, without the "Error:" prefix. */
  error?: string;
  busy?: boolean;
  label?: string;
  hint?: string;
  buttonLabel?: string;
}

/** Ask for an email address and send a sign-in link. Pair it with `MagicLinkSent` once the request has gone. */
export function MagicLinkForm({
  onSubmit,
  defaultEmail = "",
  error,
  busy,
  label = "Email address",
  hint = "We’ll email you a link that works once and lasts 15 minutes. No password needed.",
  buttonLabel = "Email me a sign-in link",
}: MagicLinkFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email.trim());
  };
  return (
    <form className="magic-link-form" onSubmit={submit} noValidate>
      <Field label={label} hint={hint} error={error}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Button type="submit" variant="outline" disabled={busy}>
        <Mail className="icon icon-md" aria-hidden="true" focusable="false" />
        {busy ? "Sending…" : buttonLabel}
      </Button>
    </form>
  );
}

/** Shown after a link was requested. Says the same whether or not an account exists. */
export function MagicLinkSent({
  email,
  onTryAgain,
  minutes = 15,
}: {
  email: string;
  onTryAgain?: () => void;
  minutes?: number;
}) {
  return (
    <div className="magic-link-sent">
      <Alert kind="success" role="status" title="Check your email" icon={MailCheck} headingLevel={2}>
        <p>
          If <strong>{email}</strong> can be used, we’ve sent a sign-in link. It works once and lasts{" "}
          {minutes} minutes. Check your junk folder if it doesn’t arrive.
        </p>
      </Alert>
      {onTryAgain && (
        <Button variant="ghost" onClick={onTryAgain}>
          Use a different address
        </Button>
      )}
    </div>
  );
}

/**
 * The page a sign-in link opens. Signing in needs a click, because mail programs and scanners open links in emails
 * and would otherwise use them up.
 */
export function MagicLinkConfirm({
  onConfirm,
  busy,
  error,
  title = "Continue to sign in",
  children,
}: {
  onConfirm: () => void;
  busy?: boolean;
  error?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="magic-link-confirm">
      <h1>{title}</h1>
      {children && <p className="lede">{children}</p>}
      {error && (
        <Alert kind="error" role="alert" title="That didn’t work" headingLevel={2}>
          <p>{error}</p>
        </Alert>
      )}
      <Button size="lg" onClick={onConfirm} disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </div>
  );
}

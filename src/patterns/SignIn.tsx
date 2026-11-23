import { LifeBuoy, ShieldCheck } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { BrandLogo } from "../layout/BrandLogo";
import { cn } from "../lib/cn";
import { Alert } from "../ui/Alert";

/** Microsoft's four-square mark, in Microsoft's exact colours. Never recolour. */
export function MicrosoftMark({ className }: { className?: string }) {
  return (
    <svg className={cn("ms-mark", className)} viewBox="0 0 21 21" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

type LinkProps = { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;
type ButtonProps = { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;
export type MicrosoftSignInButtonProps = (LinkProps | ButtonProps) & {
  /** Microsoft allows "Sign in with Microsoft" or the shorter "Sign in". */
  children?: ReactNode;
};

/**
 * "Sign in with Microsoft", following Microsoft's branding guidance (four-square mark, 12px padding and gap,
 * Segoe UI 15px semibold, light and dark themes via tokens). An anchor when given `href`, otherwise a button.
 */
export function MicrosoftSignInButton({
  children = "Sign in with Microsoft",
  className,
  ...props
}: MicrosoftSignInButtonProps) {
  const content = (
    <>
      <MicrosoftMark />
      <span>{children}</span>
    </>
  );
  if (props.href !== undefined) {
    return (
      <a className={cn("btn-ms", className)} {...(props as LinkProps)}>
        {content}
      </a>
    );
  }
  const { type = "button", ...rest } = props as ButtonProps;
  return (
    <button type={type} className={cn("btn-ms", className)} {...rest}>
      {content}
    </button>
  );
}

export interface SignInCardProps {
  /** Where the person is going, for "To continue to <destination>". Omit for the plain lede. */
  destination?: string;
  /** Replaces the whole lede. */
  lede?: ReactNode;
  title?: string;
  signInHref: string;
  buttonLabel?: string;
  /** Shown instead of the lede's account wording, for example "Wiltshire Scouts work or school account". */
  accountLabel?: string;
  /** For the account-not-allowed state: rendered between the lede and the button. */
  error?: ReactNode;
  contactEmail?: string;
  passwordNote?: string;
  logoAlt?: string;
}

/** Centred sign-in card. Renders the `main` landmark. This site never handles a password. */
export function SignInCard({
  destination,
  lede,
  title = "Sign in",
  signInHref,
  buttonLabel,
  accountLabel = "Wiltshire Scouts work or school account",
  error,
  contactEmail,
  passwordNote = "Microsoft handles your password and any two-step check. This site never sees or stores your password.",
  logoAlt = "Scouts Wiltshire",
}: SignInCardProps) {
  const text =
    lede ??
    (destination ? (
      <>
        To continue to <strong style={{ color: "var(--foreground)" }}>{destination}</strong>, sign in with
        your {accountLabel}.
      </>
    ) : (
      <>Use your {accountLabel}.</>
    ));
  return (
    <main id="main" tabIndex={-1} className="signin-wrap">
      <section className="card signin-card" aria-labelledby="signin-h">
        <div className="card__body">
          <div className="signin-logo">
            <BrandLogo layout="stack" on="page" alt={logoAlt} />
          </div>
          <h1 id="signin-h">{title}</h1>
          <p className="lede">{text}</p>
          {error}
          <MicrosoftSignInButton href={signInHref}>{buttonLabel}</MicrosoftSignInButton>
          <hr className="divider" />
          <p className="signin-note">
            <ShieldCheck className="icon icon-md" aria-hidden="true" focusable="false" />
            <span>{passwordNote}</span>
          </p>
          {contactEmail && (
            <p className="signin-note">
              <LifeBuoy className="icon icon-md" aria-hidden="true" focusable="false" />
              <span>
                Trouble signing in? Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
              </span>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export interface SignInNotAllowedProps
  extends Omit<SignInCardProps, "error" | "destination" | "buttonLabel"> {
  /** The account that was refused; shown so the person can see which one they used. */
  account?: string;
  heading?: string;
  /** Replaces the plain-English explanation. */
  message?: ReactNode;
  buttonLabel?: string;
}

/** Account not allowed: an error alert, a retry button and the contact line. */
export function SignInNotAllowed({
  account,
  heading = "That account cannot sign in",
  message,
  buttonLabel = "Try a different Microsoft account",
  lede = "Use your Wiltshire Scouts work or school account.",
  ...rest
}: SignInNotAllowedProps) {
  return (
    <SignInCard
      {...rest}
      lede={lede}
      buttonLabel={buttonLabel}
      error={
        <Alert kind="error" role="alert" title={heading} headingLevel={2}>
          <p>
            {message ??
              `${account ?? "That account"} is not a Wiltshire Scouts work or school account, or has not been given access to this site. Try a different account, or ask the digital team for access.`}
          </p>
        </Alert>
      }
    />
  );
}

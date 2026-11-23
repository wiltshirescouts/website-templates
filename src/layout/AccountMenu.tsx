import { CircleUser, LogIn, LogOut, SunMoon, UserRound } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { ColourModeControl } from "./ColourModeControl";

export type AccountConfig =
  | { variant: "signed-out"; signInHref: string }
  | {
      variant: "signed-in";
      name: string;
      email: string;
      role?: string;
      profileHref?: string;
      /** Either a link (for a server sign-out route) or a callback. */
      signOutHref?: string;
      onSignOut?: () => void;
    }
  | { variant: "colour-only" };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

function Section({ children }: { children: ReactNode }) {
  return <div className="popover__section">{children}</div>;
}

/**
 * The header's account button and popover. Focus moves into the popover on open, Escape closes it and returns focus
 * to the button, and so does moving focus or clicking outside.
 */
export function AccountMenu({ account }: { account: AccountConfig }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const popover = useRef<HTMLDivElement>(null);
  const id = useId();
  const label = account.variant === "colour-only" ? "Colour mode" : "Account and colour mode";

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const first = popover.current?.querySelector<HTMLElement>("a[href], button, input:checked, input");
    first?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div
      className="account"
      ref={wrap}
      onBlur={(e) => {
        if (open && !wrap.current?.contains(e.relatedTarget as Node | null) && e.relatedTarget) close(false);
      }}
    >
      <button
        ref={button}
        className="account-btn"
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {account.variant === "signed-in" ? (
          <span className="avatar" aria-hidden="true" data-initials={initials(account.name)} />
        ) : account.variant === "colour-only" ? (
          <SunMoon className="icon icon-lg" aria-hidden="true" focusable="false" />
        ) : (
          <CircleUser className="icon icon-lg" aria-hidden="true" focusable="false" />
        )}
      </button>
      <div className="popover" id={id} ref={popover} role="dialog" aria-label={label} data-open={open}>
        {account.variant === "signed-out" && (
          <Section>
            <p style={{ margin: "0 0 .75rem", fontWeight: 700 }}>You are not signed in</p>
            <a className="btn btn-primary" style={{ width: "100%" }} href={account.signInHref}>
              <LogIn className="icon icon-md" aria-hidden="true" focusable="false" />
              Sign in
            </a>
          </Section>
        )}
        {account.variant === "signed-in" && (
          <>
            <Section>
              <div className="popover__who">
                <span className="avatar" aria-hidden="true">
                  {initials(account.name)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <strong>{account.name}</strong>
                  <div className="hint" style={{ margin: 0 }}>
                    {account.email}
                  </div>
                  {account.role && (
                    <div className="hint" style={{ margin: 0 }}>
                      {account.role}
                    </div>
                  )}
                </div>
              </div>
            </Section>
            {account.profileHref && (
              <Section>
                <a className="popover__link" href={account.profileHref}>
                  <UserRound className="icon icon-md" aria-hidden="true" focusable="false" />
                  Your profile
                </a>
              </Section>
            )}
          </>
        )}
        <Section>
          <ColourModeControl />
        </Section>
        {account.variant === "signed-in" && (
          <Section>
            {account.signOutHref ? (
              <a className="popover__link" href={account.signOutHref}>
                <LogOut className="icon icon-md" aria-hidden="true" focusable="false" />
                Sign out
              </a>
            ) : (
              <button className="popover__link" type="button" onClick={account.onSignOut}>
                <LogOut className="icon icon-md" aria-hidden="true" focusable="false" />
                Sign out
              </button>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

import { ExternalLink, Mail } from "lucide-react";
import type { ReactNode } from "react";

export const PRIVACY_URL = "https://www.wiltshirescouts.org.uk/who-we-are/data-protection/";

export interface SiteFooterProps {
  /** For example `<>Made by <a href="…">Wiltshire Scouts Digital</a></>`. */
  madeBy?: ReactNode;
  version?: string;
  /** A line above the links, for example "Questions about your visit? Email …". Shown with a mail icon. */
  contact?: ReactNode;
}

export function SiteFooter({ madeBy, version, contact }: SiteFooterProps) {
  return (
    <footer className="site-footer chrome">
      <div className="page-container site-footer__inner">
        {contact && (
          <p className="footer-contact">
            <Mail className="icon icon-sm" aria-hidden="true" focusable="false" />
            <span>{contact}</span>
          </p>
        )}
        <div className="footer-row">
          <div className="footer-links">
            <a href={PRIVACY_URL} target="_blank" rel="noopener">
              Privacy policy <ExternalLink className="icon icon-sm" aria-hidden="true" focusable="false" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {madeBy && <span>{madeBy}</span>}
            {version && <span className="muted">{version}</span>}
          </div>
          <div className="footer-signoff">
            <a href="https://wiltshirescouts.org.uk">wiltshirescouts.org.uk</a>
            <strong>#PlaceToBelong</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}

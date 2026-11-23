import { PageShell, SignInNotAllowed, SiteFooter, SiteHeader } from "@wiltshirescouts/theme";
import { colourOnly } from "../site";

export default function SignInNotAllowedPage() {
  return (
    <PageShell>
      <SiteHeader title="Jamboree selection" account={colourOnly} />
      <SignInNotAllowed account="alex.example@gmail.com" signInHref="#" contactEmail="digital@example.org" />
      <SiteFooter />
    </PageShell>
  );
}

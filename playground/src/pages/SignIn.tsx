import { PageShell, SignInCard, SiteFooter, SiteHeader } from "@wiltshirescouts/theme";
import { colourOnly } from "../site";

export default function SignIn() {
  return (
    <PageShell>
      <SiteHeader title="Jamboree selection" account={colourOnly} />
      <SignInCard destination="Email templates" signInHref="#" contactEmail="digital@example.org" />
      <SiteFooter />
    </PageShell>
  );
}

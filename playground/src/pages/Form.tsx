import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CharacterCounter,
  CheckboxCards,
  ConsentCheckbox,
  DateField,
  type DateValue,
  ErrorSummary,
  Field,
  HeroHeader,
  HeroMain,
  Input,
  PageShell,
  RadioCards,
  RequiredMark,
  Select,
  SiteFooter,
  Steps,
  Textarea,
} from "@wiltshirescouts/theme";
import { ArrowLeft, ArrowRight, Tent } from "lucide-react";
import { type FormEvent, useState } from "react";
import { colourOnly } from "../site";

const gender = ["Male", "Female", "Non-binary", "Prefer to self-describe", "Prefer not to say"].map((l) => ({
  value: l,
  label: l,
}));
const roles = ["Section leader", "Assistant leader", "First aider", "Cook or catering"].map((l) => ({
  value: l,
  label: l,
}));
const districts = [
  "Mid Wiltshire",
  "North East Wiltshire",
  "Salisbury & South",
  "Swindon North",
  "Swindon Ridgeway",
  "Wiltshire North",
  "Wiltshire West",
];

type Errors = Partial<Record<"surname" | "dob" | "email" | "consent", string>>;

const initialErrors: Errors = {
  surname: "Enter your surname",
  dob: "Date of birth must include a real month",
  email: "Enter an email address in the correct format, like name@example.org",
};

export default function Form() {
  const [errors, setErrors] = useState<Errors>(initialErrors);
  const [submits, setSubmits] = useState(0);
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState<DateValue>({ day: "14", month: "13", year: "1986" });
  const [email, setEmail] = useState("amara.example");
  const [consent, setConsent] = useState(false);
  const [support, setSupport] = useState("");

  const validate = (): Errors => {
    const e: Errors = {};
    if (!surname.trim()) e.surname = "Enter your surname";
    const m = Number(dob.month);
    if (!(m >= 1 && m <= 12)) e.dob = "Date of birth must include a real month";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter an email address in the correct format, like name@example.org";
    if (!consent) e.consent = "Confirm that you have read the privacy policy";
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setErrors(validate());
    setSubmits((n) => n + 1);
  };

  const items = [
    errors.surname && { fieldId: "surname", message: errors.surname },
    errors.dob && { fieldId: "dob-month", message: errors.dob },
    errors.email && { fieldId: "email", message: errors.email },
    errors.consent && { fieldId: "consent", message: errors.consent },
  ].filter((i): i is { fieldId: string; message: string } => Boolean(i));

  return (
    <PageShell>
      <HeroHeader
        title="Adult sign-up"
        icon={Tent}
        account={colourOnly}
        intro="Jamboree Alternative. It takes about five minutes. Answer a few questions, then check everything and send. All names and details on this page are fictional."
      />
      <HeroMain>
        <Steps steps={["About you", "Your Scouting", "Your answers", "Check and send"]} current={2} />
        <ErrorSummary items={items} focusKey={submits} autoFocus={submits > 0} />
        <Alert kind="info" title="Before you start" headingLevel={2}>
          <p>
            Fields marked <RequiredMark />
            <span className="sr-only">with an asterisk</span> are required. Your sign-up is saved as{" "}
            <strong>provisional</strong>. Your place is not confirmed until the trip team tells you.
          </p>
        </Alert>

        <form noValidate onSubmit={onSubmit}>
          <Card className="form-section">
            <CardBody>
              <h2>Who you are</h2>
              <p className="lede">As it appears on your Scouts membership.</p>
              <div className="row-2">
                <Field label="First name" required>
                  <Input id="first" autoComplete="given-name" defaultValue="Amara" />
                </Field>
                <Field label="Surname" required id="surname" error={errors.surname}>
                  <Input
                    autoComplete="family-name"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </Field>
              </div>
              <DateField
                legend="Date of birth"
                id="dob"
                name="dob"
                required
                hint="For example, 27 3 1985"
                error={errors.dob}
                value={dob}
                onChange={setDob}
              />
              <RadioCards
                legend="Gender"
                name="gender"
                required
                hint="We use this to plan room splits for the trip."
                options={gender}
                defaultValue="Female"
              />
            </CardBody>
          </Card>

          <Card className="form-section">
            <CardBody>
              <h2>Your Scouting</h2>
              <p className="lede">Tell us where you belong in Wiltshire Scouts.</p>
              <Field label="District" required>
                <Select defaultValue="Mid Wiltshire">
                  <option value="">Choose your district</option>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Scout group or unit"
                hint="Leave blank if you volunteer at district or county level."
              >
                <Input placeholder="For example, 1st Anytown" />
              </Field>
              <CheckboxCards
                legend="Role you are applying for"
                name="roles"
                required
                hint="Choose all that apply."
                options={roles}
                defaultValue={["Section leader", "First aider"]}
              />
            </CardBody>
          </Card>

          <Card className="form-section">
            <CardBody>
              <h2>How we contact you</h2>
              <Field
                label="Email address"
                required
                id="email"
                hint="We will use this to contact you about your application."
                error={errors.email}
              >
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Mobile number">
                <Input
                  type="tel"
                  autoComplete="tel"
                  width="md"
                  style={{ maxWidth: "16rem" }}
                  defaultValue="07700 900123"
                />
              </Field>
            </CardBody>
          </Card>

          <Card className="form-section">
            <CardBody>
              <h2>Support you might need</h2>
              <Field
                label="Anything that would help you take part"
                hint="A short summary the trip team can see, such as access needs. Medical detail goes on the health form."
              >
                <Textarea maxLength={500} value={support} onChange={(e) => setSupport(e.target.value)} />
              </Field>
              <CharacterCounter length={support.length} max={500} />
              <ConsentCheckbox
                id="consent"
                required
                checked={consent}
                onChange={setConsent}
                error={errors.consent}
              >
                I have read the{" "}
                <a href="https://www.wiltshirescouts.org.uk/who-we-are/data-protection/">Privacy policy</a>{" "}
                and agree to Wiltshire Scouts using my details for this trip.
              </ConsentCheckbox>
            </CardBody>
          </Card>

          <div className="form-actions">
            <ButtonLink variant="outline" size="lg" href="#">
              <ArrowLeft className="icon icon-md" aria-hidden="true" focusable="false" />
              Back
            </ButtonLink>
            <Button type="submit" size="lg">
              Continue
              <ArrowRight className="icon icon-md" aria-hidden="true" focusable="false" />
            </Button>
          </div>
        </form>
      </HeroMain>
      <SiteFooter madeBy="Run by the Jamboree trip team" />
    </PageShell>
  );
}

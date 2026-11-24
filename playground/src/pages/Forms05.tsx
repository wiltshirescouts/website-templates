import {
  Card,
  CardBody,
  CheckboxCards,
  CheckboxList,
  Combobox,
  type ComboboxOption,
  FieldGroup,
  FileList,
  type FileListItem,
  FileUpload,
  Input,
  NativeDateField,
  PageHeader,
  RadioCards,
  RepeatableFieldset,
  SumField,
} from "@wiltshirescouts/theme";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { Site, signedIn } from "../site";

const countries: ComboboxOption[] = [
  { value: "fr", label: "France", synonyms: ["Francia"] },
  { value: "de", label: "Germany", synonyms: ["Deutschland"] },
  { value: "it", label: "Italy", synonyms: ["Italia"] },
  { value: "es", label: "Spain", synonyms: ["Espana"] },
  { value: "pt", label: "Portugal" },
  { value: "nl", label: "Netherlands", synonyms: ["Holland"] },
  { value: "be", label: "Belgium" },
  { value: "ch", label: "Switzerland", synonyms: ["Schweiz", "Suisse"] },
  { value: "at", label: "Austria", synonyms: ["Osterreich"] },
  { value: "no", label: "Norway" },
  { value: "se", label: "Sweden" },
  { value: "is", label: "Iceland" },
];

const ages = [
  { key: "u10", label: "Under 10" },
  { key: "10-14", label: "10 to 14" },
  { key: "15-17", label: "15 to 17" },
  { key: "18", label: "18 and over" },
];

interface Stop {
  key: string;
  place: string;
}

export default function Forms05() {
  const [transport, setTransport] = useState("coach");
  const [needs, setNeeds] = useState<string[]>([]);
  const [start, setStart] = useState("2026-07-18");
  const [counts, setCounts] = useState<Record<string, string>>({
    u10: "",
    "10-14": "12",
    "15-17": "x",
    "18": "3",
  });
  const [roles, setRoles] = useState<string[]>(["viewer"]);
  const [country, setCountry] = useState<string | null>("fr");
  const [country2, setCountry2] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([{ key: "s0", place: "Paris" }]);
  const [nextKey, setNextKey] = useState(1);
  const [files, setFiles] = useState<FileListItem[]>([
    { id: "1", name: "risk-assessment.pdf", href: "#", size: 1_258_291, inline: true, meta: "Added 3 March" },
    { id: "2", name: "kit-list.docx", href: "#", size: 48_200, meta: "Added 5 March" },
    { id: "3", name: "route-map.png", href: "#", size: 904_000, inline: true },
  ]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [failUpload, setFailUpload] = useState(true);

  const upload = (file: File, onProgress: (p: number) => void) =>
    new Promise<void>((resolve, reject) => {
      let p = 0;
      const timer = setInterval(() => {
        p += 20;
        onProgress(p);
        if (p >= 100) {
          clearInterval(timer);
          if (failUpload) {
            setFailUpload(false);
            reject(new Error("The upload was interrupted. Try again."));
          } else {
            setFiles((f) => [...f, { id: String(Date.now()), name: file.name, href: "#", size: file.size }]);
            resolve();
          }
        }
      }, 250);
    });

  return (
    <Site title="Visits Abroad" account={signedIn}>
      <PageHeader title="Form controls (0.5)" />
      <div className="stack-lg" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Card>
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <FieldGroup legend="The trip" legendSize="heading" hint="Heading-style legend for a group.">
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <RadioCards
                    legend="How are you travelling?"
                    name="transport"
                    id="transport"
                    required
                    layout="stack"
                    value={transport}
                    onChange={setTransport}
                    options={[
                      { value: "coach", label: "Coach", hint: "Leaves from Devizes at 6am" },
                      { value: "train", label: "Train", hint: "Group booking through Eurostar" },
                      {
                        value: "other",
                        label: "Something else",
                        conditional: (
                          <div style={{ paddingBlock: "0.5rem" }}>
                            <label className="label" htmlFor="transport-other">
                              Describe how you will travel
                            </label>
                            <Input id="transport-other" />
                          </div>
                        ),
                      },
                    ]}
                  />
                  <CheckboxCards
                    legend="Access needs"
                    name="needs"
                    id="needs"
                    layout="grid-3"
                    hint="Choose all that apply."
                    value={needs}
                    onChange={setNeeds}
                    options={[
                      { value: "mobility", label: "Step-free access" },
                      { value: "diet", label: "Special diet", hint: "Tell us on the next page" },
                      { value: "quiet", label: "Quiet space" },
                    ]}
                  />
                  <CheckboxCards
                    legend="Activities"
                    name="activities"
                    id="activities"
                    required
                    error="Choose at least one activity"
                    layout="grid-2"
                    options={[
                      { value: "hike", label: "Hiking" },
                      { value: "swim", label: "Swimming" },
                    ]}
                  />
                </div>
              </FieldGroup>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <NativeDateField
                label="Departure date"
                id="start"
                required
                value={start}
                onChange={setStart}
                min="2026-01-01"
              />
              <NativeDateField
                label="Return date"
                id="end"
                required
                error="Enter a return date after the departure date"
                defaultValue=""
              />
              <SumField
                legend="Young people by age"
                id="ages"
                hint="Whole numbers only. Leave a box blank for none."
                fields={ages}
                values={counts}
                onChange={(k, v) => setCounts((c) => ({ ...c, [k]: v }))}
                totalLabel="Total people"
              />
              <SumField
                legend="Adults by role"
                id="adults"
                fields={[
                  { key: "leaders", label: "Leaders" },
                  { key: "helpers", label: "Helpers" },
                ]}
                values={{ leaders: "", helpers: "" }}
                onChange={() => {}}
                error="Enter at least one leader"
              />
              <CheckboxList
                legend="Roles for this person"
                id="roles"
                name="roles"
                hint="Administrators can change settings."
                value={roles}
                onChange={setRoles}
                options={[
                  { value: "viewer", label: "Can view visits" },
                  { value: "editor", label: "Can edit visits" },
                  { value: "admin", label: "Administrator" },
                  { value: "locked", label: "Locked by the county team", disabled: true },
                ]}
              />
              <CheckboxList
                legend="Notifications"
                id="notify"
                error="Choose at least one"
                options={[
                  { value: "email", label: "Email" },
                  { value: "sms", label: "Text message" },
                ]}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <RepeatableFieldset
                legend="Where are you going?"
                id="stops"
                hint="Add each place you will stay."
                items={stops}
                icon={MapPin}
                getKey={(s) => s.key}
                itemLabel={(i) => `Destination ${i + 1}`}
                addLabel="Add another destination"
                onAdd={() => {
                  setStops([...stops, { key: `s${nextKey}`, place: "" }]);
                  setNextKey(nextKey + 1);
                }}
                onRemove={(i) => setStops(stops.filter((_, j) => j !== i))}
                renderItem={(s, i) => (
                  <>
                    <label className="label" htmlFor={`stop-${s.key}`}>
                      Place {i + 1}
                    </label>
                    <Input
                      id={`stop-${s.key}`}
                      value={s.place}
                      onChange={(e) =>
                        setStops(stops.map((x) => (x.key === s.key ? { ...x, place: e.target.value } : x)))
                      }
                    />
                  </>
                )}
              />
              <Combobox
                label="Country"
                id="country"
                required
                hint="Start typing, or choose from the list."
                options={countries}
                value={country}
                onChange={setCountry}
                notListed={{ value: "other", label: "My country is not listed" }}
                name="country"
              />
              <Combobox
                label="Destination country"
                id="country2"
                required
                error="Choose a country"
                placeholder="For example, Norway"
                options={countries}
                value={country2}
                onChange={setCountry2}
                inputWidth="full"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Documents</h2>
              <FileList
                label="Trip documents"
                files={files}
                removingId={removing}
                empty="No documents yet."
                onRemove={(id) => {
                  setRemoving(id);
                  setTimeout(() => {
                    setFiles((f) => f.filter((x) => x.id !== id));
                    setRemoving(null);
                  }, 600);
                }}
              />
              <FileList files={[]} empty="No documents yet." label="Empty list" />
              <FileUpload
                id="doc"
                label="Add a document"
                hint="PDF, Word or image files. The first attempt fails so you can see the error."
                accept=".pdf,.doc,.docx,.png,.jpg"
                onUpload={upload}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </Site>
  );
}

import { Button, TemplateCard, TemplateList } from "@wiltshirescouts/theme";
import { Send } from "lucide-react";
import type { ReactNode } from "react";

const TEMPLATES = [
  [
    "Thanks for registering",
    "Sent automatically when a participant registration is received.",
    "The parent or carer email on the registration",
    "Thanks for registering",
    "Last edited 21 Nov 2026, 14:02 by Alex Example",
    true,
  ],
  [
    "Thanks for volunteering",
    "Sent automatically when a volunteer registration is received.",
    "The volunteer",
    "Thanks for volunteering",
    "Never edited",
    false,
  ],
  [
    "Outcome: successful",
    "Sent from the Selection screen to applicants who have a place.",
    "The parent or carer",
    "Good news about your application",
    "Never edited",
    false,
  ],
  [
    "Outcome: reserve",
    "Sent from the Selection screen to applicants on the reserve list.",
    "The parent or carer",
    "Your place on the reserve list",
    "Last edited 18 Nov 2026, 09:40 by Sam Example",
    true,
  ],
  [
    "Outcome: unsuccessful",
    "Sent from the Selection screen to applicants who have not been given a place.",
    "The parent or carer",
    "Your application",
    "Never edited",
    false,
  ],
  [
    "User invite",
    "Sent when an administrator adds a new user.",
    "The new user",
    "You have been invited",
    "Never edited",
    false,
  ],
  [
    "Reviewer briefing",
    "Sent by an administrator to brief application reviewers.",
    "Application reviewers",
    "Reading the application answers",
    "Never edited",
    false,
  ],
] as const;

export function Templates(): ReactNode {
  return (
    <TemplateList>
      {TEMPLATES.map(([title, description, to, subject, edited, customised]) => (
        <TemplateCard
          key={title}
          title={title}
          description={description}
          to={to}
          subject={subject}
          edited={edited}
          customised={customised}
          editHref="/email-edit"
          actions={
            title === "Reviewer briefing" ? (
              <Button>
                <Send className="icon icon-md" aria-hidden="true" focusable="false" />
                Send to all reviewers
              </Button>
            ) : undefined
          }
        />
      ))}
    </TemplateList>
  );
}

export const emailsIntro =
  "The wording of the emails the system sends. Each one starts with default wording; edit it to change what people receive. Outcome emails are never sent automatically: they are sent from the Selection screen.";

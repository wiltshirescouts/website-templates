import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useId } from "react";
import { type ColourPreference } from "../theme/cookie";
import { useTheme } from "../theme/ThemeProvider";

const OPTIONS: { value: ColourPreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "auto", label: "Auto", Icon: Monitor },
];

/** Light, Dark, Auto slider built on native radios. The selected option shows a tick as well as the purple thumb. */
export function ColourModeControl({ showHint = true }: { showHint?: boolean }) {
  const { preference, setPreference } = useTheme();
  const labelId = useId();
  return (
    <>
      <div className="popover__label" id={labelId}>
        <Sun className="icon icon-md" aria-hidden="true" focusable="false" />
        Colour mode
      </div>
      <div className="mode-seg" role="radiogroup" aria-labelledby={labelId}>
        {OPTIONS.map(({ value, label, Icon }) => (
          <label key={value}>
            <input
              className="sr-only"
              type="radio"
              name={`colour-mode-${labelId}`}
              value={value}
              checked={preference === value}
              onChange={() => setPreference(value)}
            />
            <Icon className="icon icon-sm" aria-hidden="true" focusable="false" />
            <span>{label}</span>
            <Check className="icon icon-sm tick" aria-hidden="true" focusable="false" />
          </label>
        ))}
      </div>
      {showHint && <p className="hint">Auto follows your device’s light or dark setting.</p>}
    </>
  );
}

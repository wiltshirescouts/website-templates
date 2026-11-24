import { Upload } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "./Field";

export interface FileUploadProps {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  /** The `accept` attribute, for example ".pdf,.jpg,.png". */
  accept?: string;
  /** A message to show as the field error (without the "Error:" prefix). Overrides the rejected error's message. */
  error?: ReactNode;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onError?: (e: unknown) => void;
  /** Default "Upload". */
  buttonLabel?: string;
  disabled?: boolean;
  className?: string;
}

type Status = "idle" | "uploading" | "done" | "failed";

/** Report progress in steps of 25% so assistive technology is not flooded. */
const step = (p: number) => Math.min(100, Math.max(0, Math.floor(p / 25) * 25));

/** A file input with an Upload button, native progress, a polite status line and focus return on failure. */
export function FileUpload({
  id,
  label,
  hint,
  accept,
  error,
  onUpload,
  onError,
  buttonLabel = "Upload",
  disabled,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [percent, setPercent] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusTick, setFocusTick] = useState(0);

  useEffect(() => {
    if (focusTick > 0) inputRef.current?.focus();
  }, [focusTick]);

  const fail = (message: string) => {
    setLocalError(message);
    setFocusTick((t) => t + 1);
  };

  const submit = async () => {
    if (status === "uploading" || disabled) return;
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus("idle");
      fail("Select a file to upload");
      return;
    }
    setLocalError(null);
    setPercent(0);
    setStatus("uploading");
    try {
      await onUpload(file, (p) => setPercent(step(p)));
      if (inputRef.current) inputRef.current.value = "";
      setStatus("done");
    } catch (e) {
      setStatus("failed");
      onError?.(e);
      fail(e instanceof Error && e.message ? e.message : "The file could not be uploaded. Try again.");
    }
  };

  const uploading = status === "uploading";
  const shown = error ?? localError;
  const statusText = uploading ? `Uploading ${percent}%` : status === "done" ? "Uploaded" : "";

  return (
    <Field label={label} hint={hint} error={shown} id={id} className={className}>
      {(control) => (
        <div className="file-upload">
          <input
            {...control}
            ref={inputRef}
            type="file"
            className="file-input"
            accept={accept}
            disabled={disabled}
            onChange={() => {
              setLocalError(null);
              if (status !== "uploading") setStatus("idle");
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-disabled={uploading || undefined}
            onClick={submit}
          >
            <Upload className="icon icon-sm" aria-hidden="true" focusable="false" />
            {buttonLabel}
          </Button>
          {uploading && (
            <progress
              className="file-upload__progress"
              max={100}
              value={percent}
              aria-label="Upload progress"
              aria-valuetext={`${percent}%`}
            />
          )}
          <p className="file-upload__status" role="status" aria-live="polite">
            {statusText}
          </p>
        </div>
      )}
    </Field>
  );
}

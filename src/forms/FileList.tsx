import { Archive, Download, File, FileSpreadsheet, FileText, Image } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/Button";

export interface FileListItem {
  id: string;
  name: string;
  href?: string;
  /** Bytes. */
  size?: number;
  meta?: ReactNode;
  /** Opens in a new tab (for example a PDF or image) instead of downloading. */
  inline?: boolean;
}

export interface FileListProps {
  files: FileListItem[];
  onRemove?: (id: string) => void;
  /** The id of a file being removed: its button is disabled and says "Removing". */
  removingId?: string | null;
  /** Shown (muted) when there are no files. */
  empty?: ReactNode;
  /** The list's accessible name. Default "Files". */
  label?: string;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"].includes(ext)) return Image;
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return FileSpreadsheet;
  if (["zip", "gz", "tar", "7z"].includes(ext)) return Archive;
  if (["pdf", "doc", "docx", "txt", "odt", "rtf"].includes(ext)) return FileText;
  return File;
}

/** Uploaded files as a list: type icon, name (link), size, optional meta and a Remove button. */
export function FileList({ files, onRemove, removingId, empty, label = "Files" }: FileListProps) {
  if (files.length === 0) return empty ? <p className="hint file-list__empty">{empty}</p> : null;
  return (
    <ul className="file-list" aria-label={label}>
      {files.map((f) => {
        const Icon = iconFor(f.name);
        const removing = removingId === f.id;
        return (
          <li className="file-list__row" key={f.id}>
            <Icon className="icon file-list__icon" aria-hidden="true" focusable="false" />
            <div className="file-list__main">
              {f.href ? (
                f.inline ? (
                  <a className="file-list__name" href={f.href} target="_blank" rel="noopener noreferrer">
                    {f.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <a className="file-list__name" href={f.href} download>
                    {f.name}
                    <Download className="icon icon-sm" aria-hidden="true" focusable="false" />
                  </a>
                )
              ) : (
                <span className="file-list__name">{f.name}</span>
              )}
              {(f.size !== undefined || f.meta) && (
                <span className="file-list__meta">
                  {f.size !== undefined && <span>{formatSize(f.size)}</span>}
                  {f.meta && <span>{f.meta}</span>}
                </span>
              )}
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                className="file-list__remove"
                disabled={removing}
                onClick={() => onRemove(f.id)}
              >
                {removing ? (
                  "Removing"
                ) : (
                  <>
                    Remove <span className="sr-only">{f.name}</span>
                  </>
                )}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

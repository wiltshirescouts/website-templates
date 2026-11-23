import { Search } from "lucide-react";
import { type InputHTMLAttributes, useId } from "react";

/** Search box with a magnifier, for the toolbar. */
export function SearchField({
  label = "Search",
  id,
  ...p
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const base = id ?? auto;
  return (
    <div className="field search">
      <label className="label" htmlFor={base}>
        {label}
      </label>
      <Search className="icon icon-md" aria-hidden="true" focusable="false" />
      <input className="input" id={base} type="search" {...p} />
    </div>
  );
}

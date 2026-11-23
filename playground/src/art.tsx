const PALETTES = {
  green: { sky: ["#9fc4a0", "#9b8168"], sun: "#c47f48", far: "#2f5f3e", near: "#1f4a2e" },
  blue: { sky: ["#b6c6e0", "#b49e86"], sun: "#e8bc5f", far: "#6f88b6", near: "#34497a" },
  purple: { sky: ["#efb27a", "#c89e80"], sun: "#f9d57a", far: "#7a4aa6", near: "#44296e" },
} as const;

/** Decorative placeholder illustration; stands in for a real photo. */
export function MountainArt({
  palette = "green",
  cover = false,
}: {
  palette?: keyof typeof PALETTES;
  cover?: boolean;
}) {
  const p = PALETTES[palette];
  const id = `sky-${palette}${cover ? "-c" : ""}`;
  return (
    <svg
      className="art"
      viewBox="0 0 320 180"
      preserveAspectRatio={cover ? "xMidYMax slice" : "xMidYMid slice"}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id})`} />
      <circle cx="245" cy="48" r="17" fill={p.sun} />
      <path d="M0 180V120L62 62l45 45 42-47 40 42 46-24 85 56V180Z" fill={p.far} />
      <path d="M0 180V140L55 106l50 30 55-33 60 37 40-25 60 25v40Z" fill={p.near} />
    </svg>
  );
}

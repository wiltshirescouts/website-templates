import linearBlack from "../assets/logos/scouts-wiltshire-linear-black.svg";
import linearPurple from "../assets/logos/scouts-wiltshire-linear-purple.svg";
import linearWhite from "../assets/logos/scouts-wiltshire-linear-white.svg";
import stackBlack from "../assets/logos/scouts-wiltshire-stack-black.svg";
import stackPurple from "../assets/logos/scouts-wiltshire-stack-purple.svg";
import stackWhite from "../assets/logos/scouts-wiltshire-stack-white.svg";

export const LOGOS = {
  linear: { white: linearWhite, black: linearBlack, purple: linearPurple },
  stack: { white: stackWhite, black: stackBlack, purple: stackPurple },
} as const;

export type LogoLayout = keyof typeof LOGOS;
export type LogoTone = keyof (typeof LOGOS)["linear"];
/**
 * What the logo sits on:
 * - `purple`: header, footer, hero band (always white ink)
 * - `page`: the page background, which follows the colour mode (purple on light, white on dark)
 * - `light`: a light surface such as a card or print (purple)
 * - `dark`: a dark surface (white)
 * - `print`: single colour (black)
 */
export type LogoBackground = "purple" | "page" | "light" | "dark" | "print";

const TONE: Record<Exclude<LogoBackground, "page">, LogoTone> = {
  purple: "white",
  dark: "white",
  light: "purple",
  print: "black",
};

export interface BrandLogoProps {
  layout?: LogoLayout;
  on: LogoBackground;
  /** Overrides the tone picked from `on`. Logos are never recoloured; this only picks another supplied file. */
  tone?: LogoTone;
  /** Empty by default, for a logo inside a link that already has a label. */
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function BrandLogo({ layout = "linear", on, tone, alt = "", width, height, className }: BrandLogoProps) {
  const size = { width, height };
  if (on === "page" && !tone) {
    return (
      <>
        <img className={`logo-light ${className ?? ""}`} src={LOGOS[layout].purple} alt={alt} {...size} />
        <img className={`logo-dark ${className ?? ""}`} src={LOGOS[layout].white} alt={alt} {...size} />
      </>
    );
  }
  const chosen = tone ?? TONE[on as Exclude<LogoBackground, "page">];
  return <img className={className} src={LOGOS[layout][chosen]} alt={alt} {...size} />;
}

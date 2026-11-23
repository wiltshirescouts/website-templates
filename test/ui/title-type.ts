import type { SiteHeaderProps } from "../../src";

const account = { variant: "colour-only" } as const;
const T60 = "012345678901234567890123456789012345678901234567890123456789" as const; // 60 characters
const T61 = "0123456789012345678901234567890123456789012345678901234567890" as const; // 61 characters

// Type-only checks, run by `npm run typecheck`.
export const fine: SiteHeaderProps<typeof T60> = { title: T60, account };
// @ts-expect-error 61 characters is over the limit
export const tooLong: SiteHeaderProps<typeof T61> = { title: T61, account };

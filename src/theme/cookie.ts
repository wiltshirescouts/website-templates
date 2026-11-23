export type ColourPreference = "light" | "dark" | "auto";

export const THEME_COOKIE = "ws-theme";
export const THEME_DOMAIN = ".wiltshirescouts.org.uk";
const ONE_YEAR = 31_536_000;
const HOST_RE = /(^|\.)wiltshirescouts\.org\.uk$/;

/** The parts of `document` and `location` we use, so the logic can be tested without a browser. */
export interface ThemeEnv {
  cookie: { get(): string; set(value: string): void };
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
  hostname: string;
}

export function browserEnv(): ThemeEnv {
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }
  return {
    cookie: {
      get: () => document.cookie,
      set: (v) => {
        document.cookie = v;
      },
    },
    storage,
    hostname: location.hostname,
  };
}

export const isSharedHost = (hostname: string) => HOST_RE.test(hostname);

export function readPreference(env: ThemeEnv = browserEnv()): ColourPreference {
  const m = env.cookie.get().match(/(?:^|;\s*)ws-theme=(light|dark)/);
  if (m) return m[1] as ColourPreference;
  try {
    const v = env.storage?.getItem(THEME_COOKIE);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}

/**
 * One cookie shared by every *.wiltshirescouts.org.uk site. "auto" deletes it.
 * On other hosts (localhost, previews) a Domain attribute would be rejected, so localStorage is used as well.
 */
export function writePreference(pref: ColourPreference, env: ThemeEnv = browserEnv()): void {
  const shared = isSharedHost(env.hostname);
  const attrs = `Path=/; SameSite=Lax${shared ? `; Domain=${THEME_DOMAIN}; Secure` : ""}`;
  env.cookie.set(
    pref === "auto"
      ? `${THEME_COOKIE}=; Max-Age=0; ${attrs}`
      : `${THEME_COOKIE}=${pref}; Max-Age=${ONE_YEAR}; ${attrs}`,
  );
  try {
    if (pref === "auto") env.storage?.removeItem(THEME_COOKIE);
    else env.storage?.setItem(THEME_COOKIE, pref);
  } catch {
    /* storage can be blocked; the cookie is enough */
  }
}

export const resolve = (pref: ColourPreference, systemDark: boolean): "light" | "dark" =>
  pref === "dark" || (pref === "auto" && systemDark) ? "dark" : "light";

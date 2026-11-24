/** Environment bindings the sign-in helpers read. All are secrets or per-site settings; nothing is hard-coded here. */
export interface EntraEnv {
  ENTRA_TENANT_ID?: string;
  ENTRA_CLIENT_ID?: string;
  ENTRA_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
  /** Optional. Defaults to `https://login.microsoftonline.com`. Set only for sovereign clouds or a local fake. */
  ENTRA_AUTHORITY_HOST?: string;
}

export interface EntraConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  sessionSecret: string;
  /** Origin of the identity provider, no trailing slash. */
  authorityHost?: string;
}

/** Thrown when a required binding is missing or malformed. The message names the binding, never its value. */
export class EntraConfigError extends Error {
  constructor(
    message: string,
    public readonly missing: readonly string[] = [],
  ) {
    super(message);
    this.name = "EntraConfigError";
  }
}

const MIN_SESSION_SECRET_LENGTH = 32;
// A tenant is a GUID or a verified domain; either way it is safe in a URL path segment.
const TENANT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9.-]*$/;

/** Read and validate the bindings. Throws {@link EntraConfigError} listing everything that is missing. */
export function readEntraConfig(env: EntraEnv): EntraConfig {
  const names = ["ENTRA_TENANT_ID", "ENTRA_CLIENT_ID", "ENTRA_CLIENT_SECRET", "SESSION_SECRET"] as const;
  const missing = names.filter((n) => !env[n]?.trim());
  if (missing.length > 0) {
    throw new EntraConfigError(
      `Microsoft sign-in is not configured. Missing: ${missing.join(", ")}.`,
      missing,
    );
  }
  const tenantId = (env.ENTRA_TENANT_ID as string).trim();
  const clientId = (env.ENTRA_CLIENT_ID as string).trim();
  if (!TENANT_PATTERN.test(tenantId))
    throw new EntraConfigError("ENTRA_TENANT_ID is not a valid tenant identifier.");
  if (!TENANT_PATTERN.test(clientId))
    throw new EntraConfigError("ENTRA_CLIENT_ID is not a valid client identifier.");
  const sessionSecret = env.SESSION_SECRET as string;
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new EntraConfigError(`SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters.`);
  }
  const host = env.ENTRA_AUTHORITY_HOST?.trim().replace(/\/+$/, "");
  if (host) {
    let url: URL;
    try {
      url = new URL(host);
    } catch {
      throw new EntraConfigError("ENTRA_AUTHORITY_HOST is not a valid URL.");
    }
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.pathname !== "/" || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) {
      throw new EntraConfigError("ENTRA_AUTHORITY_HOST must be an https origin (http only for localhost).");
    }
  }
  return {
    tenantId,
    clientId,
    clientSecret: env.ENTRA_CLIENT_SECRET as string,
    sessionSecret,
    ...(host ? { authorityHost: host } : {}),
  };
}

export const DEFAULT_AUTHORITY_HOST = "https://login.microsoftonline.com";

export const authorityFor = (tenantId: string, host: string = DEFAULT_AUTHORITY_HOST) =>
  `${host}/${tenantId}`;

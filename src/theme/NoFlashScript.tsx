import { NO_FLASH_SCRIPT } from "./noFlash";

/** Render in <head> of a server-rendered or static page. */
export function NoFlashScript({ nonce }: { nonce?: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: the script is a constant defined in this package
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />;
}

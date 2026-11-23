/**
 * Tiny inline script for <head>, so the right colour mode is set before first paint.
 * Under a strict CSP, give the <script> a nonce and use this string as its content.
 */
export const NO_FLASH_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)ws-theme=(light|dark)/),p=m?m[1]:null;if(!p){try{var s=localStorage.getItem("ws-theme");if(s==="light"||s==="dark")p=s}catch(e){}}var d=p==="dark"||(!p&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();`;

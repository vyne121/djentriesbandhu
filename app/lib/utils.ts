import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function spotifyEmbed(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/(album|track|artist|playlist)\/([a-zA-Z0-9]{22})\/?$/);
    if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || !match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
  } catch { return null; }
}
export function safeExternalUrl(value: string) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

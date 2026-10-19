export type Social = { name: string; url: string };
export type Release = { title: string; kind: string; spotify: string; artwork: string; year?: string };
export type PressQuote = { text: string; source: string; url: string };
export type Download = { label: string; detail: string; href: string | null };
export type ShopifyConfig = { domain: string; publicAccessToken: string; productHandles: string[]; country: string; language: string; policies: { label: string; url: string }[] };
export type BandContent = {
  name: string; genre: string; preview: boolean; siteUrl: string;
  heroPhoto: string | null; heroMobilePhoto: string | null; livePhoto: string | null;
  homeBase: string | null; shortBio: string | null; fullBio: string | null;
  lineup: { name: string; role: string }[]; setLengths: string | null;
  credentials: string[]; pressQuotes: PressQuote[];
  booking: { email: string | null; phone: string | null };
  socials: Social[]; releases: Release[]; spotifyArtist: string | null;
  bandsintown: { artist: string; url: string } | null;
  liveVideoId: string | null; downloads: Download[]; shopify: ShopifyConfig | null;
  privacyText: string | null;
};

// Supply approved facts and account identifiers here. preview=false hides unfinished pages and sections.
export const band: BandContent = {
  name: "Djentries", genre: "Modern Metal / Rock", preview: true,
  siteUrl: "https://djentries.azureflint1.chatgpt.site",
  heroPhoto: null, heroMobilePhoto: null, livePhoto: null,
  homeBase: null, shortBio: null, fullBio: null, lineup: [], setLengths: null,
  credentials: [], pressQuotes: [], booking: { email: null, phone: null },
  socials: [], releases: [], spotifyArtist: null, bandsintown: null, liveVideoId: null,
  downloads: [
    { label: "Teljes sajtóanyag", detail: "Biográfia, fotók és logók · ZIP", href: null },
    { label: "Sajtófotók", detail: "Nagy felbontású zenekari képek · ZIP", href: null },
    { label: "Zenekari logó", detail: "Világos és sötét változat · SVG / PNG", href: null },
    { label: "Technikai rider", detail: "Technikai igények · PDF", href: null },
    { label: "Stage plot", detail: "Színpadkép és csatornakiosztás · PDF", href: null },
  ],
  shopify: null, privacyText: null,
};

export const navigation = [
  { href: "/zene", label: "Zene" },
  { href: "/koncertek", label: "Koncertek" },
  { href: "/epk", label: "Sajtó / EPK" },
  { href: "/shop", label: "Shop" },
];
export function pageAvailable(path: string) {
  if (band.preview || path === "/" || path === "/404") return true;
  if (path === "/zene") return !!(band.releases.length || band.spotifyArtist);
  if (path === "/koncertek") return !!band.bandsintown;
  if (path === "/shop") return !!band.shopify;
  if (path === "/epk") return !!band.shortBio && !!band.booking.email;
  if (path === "/adatvedelem") return !!band.privacyText;
  return false;
}

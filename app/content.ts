export type Social = { name: string; url: string };
export type Release = { title: string; kind: string; spotify: string | null; artwork: string; year?: string };
export type PressQuote = { text: string; source: string; url: string };
export type Download = { label: string; detail: string; href: string | null };
export type ShopifyConfig = { domain: string; publicAccessToken: string; productHandles: string[]; country: string; language: string; policies: { label: string; url: string }[] };
export type BandContent = {
  name: string; genre: string; preview: boolean; siteUrl: string;
  heroPhoto: string | null; heroMobilePhoto: string | null;
  homeBase: string | null; shortBio: string | null; fullBio: string | null;
  lineup: { name: string; role: string; url?: string }[]; setLengths: string | null;
  credentials: string[]; pressQuotes: PressQuote[];
  booking: { email: string | null; phone: string | null; formEmail?: string | null };
  socials: Social[]; releases: Release[]; spotifyArtist: string | null;
  bandsintown: { artist: string; url: string } | null;
  video: { kind: "lyric" | "music" | "live"; title: string; youtubeId: string | null; poster: string };
  downloads: Download[]; shopify: ShopifyConfig | null;
  privacyText: string | null;
};

// Supply approved facts and account identifiers here. preview=false hides unfinished pages and sections.
export const band: BandContent = {
  name: "Djentries", genre: "Modern metalcore / rock", preview: true,
  siteUrl: "https://djentries.azureflint1.chatgpt.site",
  heroPhoto: "/images/brand/band-portrait.webp", heroMobilePhoto: "/images/brand/band-portrait.webp",
  homeBase: "Budapest", shortBio: "Dühös, lázadó és mélyen őszinte modern metalcore, olyan témákkal, mint a belső démonok és a kimondatlan feszültségek. Az erőteljes, de érzelmes hangzás célja nem a rombolás, hanem az ébresztés: szembenézni azzal, amit sokan elfojtanak.", fullBio: null, lineup: [
    { name: "Rezes Ádám - Rezi", role: "Ének, gitár", url: "https://iamrezi.com" },
    { name: "Kiss Dániel", role: "Gitár, vokál" },
    { name: "Kálozi Bence", role: "Dobok" },
    { name: "Szabó Imre", role: "Basszusgitár" },
  ], setLengths: "45-80 perc, igény szerint",
  credentials: [], pressQuotes: [], booking: { email: "djentriesband@gmail.com", phone: "+36 30 403 24 09", formEmail: "djentriesband+szervezes@gmail.com" },
  socials: [],
  releases: [
    { title: "A Szikra", kind: "Megjelent", spotify: null, artwork: "/images/brand/a-szikra.webp" },
    { title: "Végtelen az éj", kind: "Zene", spotify: null, artwork: "/images/brand/vegtelen-az-ej.webp" },
    { title: "Djentries", kind: "Zene", spotify: null, artwork: "/images/brand/cover-candidate.webp" },
    { title: "Vedd el ami kell", kind: "Zene", spotify: null, artwork: "/images/brand/vedd-el-ami-kell.jpg" },
    { title: "Harcra kész", kind: "Zene", spotify: null, artwork: "/images/brand/harcra-kesz.jpg" },
    { title: "Látomás", kind: "Zene", spotify: null, artwork: "/images/brand/latomas.jpg" },
  ],
  spotifyArtist: null, bandsintown: null,
  video: { kind: "lyric", title: "A Szikra", youtubeId: null, poster: "/images/brand/a-szikra.webp" },
  downloads: [
    { label: "Teljes sajtóanyag", detail: "Biográfia, fotók és logók · ZIP", href: null },
    { label: "Sajtófotók", detail: "Nagy felbontású zenekari képek · ZIP", href: null },
    { label: "Zenekari logó", detail: "Világos és sötét változat · SVG / PNG", href: null },
    { label: "Technikai rider", detail: "Technikai igények · PDF", href: null },
    { label: "Stage plot", detail: "Színpadkép és csatornakiosztás · PDF", href: null },
  ],
  shopify: null, privacyText: null,
};

export const brandAssets = {
  wordmark: "/images/brand/wordmark.png",
  mascot: "/images/brand/mascot.webp",
  merchPreview: "/images/brand/mascot-shirt.svg",
  livePhotos: [
    { src: "/images/brand/live-vocals.webp", alt: "A Djentries énekes-gitárosa koncert közben, színpadi fényekben" },
    { src: "/images/brand/live-drums.webp", alt: "A Djentries dobosa a dobok mögött koncerten" },
  ],
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

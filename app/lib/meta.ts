import { band } from "../content";
export function pageMeta(title: string, description: string, path: string) {
  return [{ title: `${title} - Djentries` }, { name: "description", content: description }, { property: "og:title", content: `${title} - Djentries` }, { property: "og:description", content: description }, { property: "og:url", content: `${band.siteUrl}${path}` }, { tagName: "link", rel: "canonical", href: `${band.siteUrl}${path}` }];
}

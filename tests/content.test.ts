import { describe, expect, it } from "vitest";
import { band, pageAvailable } from "../app/content";
import { spotifyEmbed, safeExternalUrl } from "../app/lib/utils";
import { validShop } from "../app/components/shopify";
describe("external integration boundaries", () => {
  it("only builds official Spotify embeds", () => {
    expect(spotifyEmbed("https://open.spotify.com/artist/25btqvZzKJ5fBQdg6usk9F")).toBe("https://open.spotify.com/embed/artist/25btqvZzKJ5fBQdg6usk9F?theme=0");
    for (const url of [null, "", "javascript:alert(1)", "https://evil.example/track/25btqvZzKJ5fBQdg6usk9F", "http://open.spotify.com/artist/25btqvZzKJ5fBQdg6usk9F", "https://open.spotify.com/artist/invalid"]) expect(spotifyEmbed(url)).toBeNull();
  });
  it("rejects unsafe social links and invalid Shopify configuration", () => {
    expect(safeExternalUrl("https://example.com")).toBe(true);
    expect(safeExternalUrl("javascript:alert(1)")).toBe(false);
    const shop = { domain: "https://djentries.myshopify.com", publicAccessToken: "public-test", productHandles: ["band-shirt"], country: "HU", language: "HU", policies: [] };
    expect(validShop(shop)).toBe(true);
    expect(validShop({ ...shop, domain: "https://example.com" })).toBe(false);
    expect(validShop({ ...shop, productHandles: ['shirt\" onclick=\"alert(1)'] })).toBe(false);
  });
});
describe("public content gating", () => {
  it("shows unfinished routes in preview and hides them on public launch", () => {
    const original = band.preview;
    try {
      band.preview = true;
      expect(pageAvailable("/shop")).toBe(true);
      band.preview = false;
      expect(pageAvailable("/shop")).toBe(false);
      expect(pageAvailable("/epk")).toBe(false);
      expect(pageAvailable("/zene")).toBe(false);
      expect(pageAvailable("/koncertek")).toBe(false);
      expect(pageAvailable("/")).toBe(true);
    } finally { band.preview = original; }
  });
});

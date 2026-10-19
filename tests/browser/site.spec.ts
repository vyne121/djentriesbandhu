import { test, expect } from "@playwright/test";
test("all pages render without overflow or hydration errors", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  for (const path of ["/", "/zene", "/koncertek", "/epk", "/shop", "/adatvedelem", "/missing-page"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "hu");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.goto("/");
  await page.screenshot({ path: `../${info.project.name}-preview.png`, fullPage: true });
});
test("missing integrations are honest and no third-party content loads automatically", async ({ page }) => {
  const external: string[] = [];
  page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1") && /^https?:/.test(r.url())) external.push(r.url()); });
  await page.goto("/");
  await page.getByRole("button", { name: "Belehallgatok", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Spotify");
  await page.getByRole("button", { name: "Bezárás", exact: true }).click();
  await page.goto("/epk");
  await expect(page.locator("a[download]")).toHaveCount(0);
  await page.goto("/shop");
  await expect(page.getByText("A shop hamarosan nyit.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kosárba", exact: true })).toHaveCount(0);
  expect(external).toEqual([]);
});
test("mobile navigation closes and restores focus", async ({ page }, info) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 768, "Mobile menu only");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Menü megnyitása" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("navigation", { name: "Mobil navigáció" }).getByRole("link", { name: "Zene", exact: true }).click();
  await expect(page).toHaveURL(/\/zene$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("Bandsintown fails clearly after activation without claiming no events", async ({ page }) => {
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace("bandsintown: null", 'bandsintown: {artist: "Djentries", url: "https://www.bandsintown.com/a/123-djentries"}') });
  });
  await page.route("https://widgetv3.bandsintown.com/**", route => route.abort());
  await page.goto("/koncertek");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Koncertek betöltése" }).click();
  await expect(page.getByRole("status")).toContainText("Ez nem jelenti azt, hogy nincs közelgő koncert");
  await expect(page.getByRole("link", { name: "Djentries a Bandsintownon" })).toHaveAttribute("href", /bandsintown/);
  await page.getByRole("button", { name: "Újrapróbálom" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
});
test("Shopify script failure keeps a real-store fallback", async ({ page }) => {
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace("shopify: null", 'shopify: {domain: "https://djentries-test.myshopify.com", publicAccessToken: "", productHandles: ["test-shirt"], country: "HU", language: "HU", policies: []}') });
  });
  await page.route("https://cdn.shopify.com/storefront/**", route => route.abort());
  await page.goto("/shop");
  await page.getByRole("button", { name: "Shop betöltése" }).click();
  await expect(page.getByRole("status")).toContainText("nem érhető el");
  await expect(page.getByRole("link", { name: "Shopify-áruház megnyitása" })).toHaveAttribute("href", "https://djentries-test.myshopify.com");
});
test("one Spotify iframe persists across internal page navigation", async ({ page }, info) => {
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace("spotifyArtist: null", 'spotifyArtist: "https://open.spotify.com/artist/25btqvZzKJ5fBQdg6usk9F"');
    await route.fulfill({ response, body });
  });
  await page.route("https://open.spotify.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Spotify test fixture</title>Player" }));
  await page.goto("/zene");
  await page.getByRole("button", { name: "Belehallgatok", exact: true }).click();
  await expect(page.getByTestId("spotify-player")).toHaveCount(1);
  await page.evaluate(() => (document.querySelector('[data-testid="spotify-player"]') as HTMLElement).dataset.instance = "persistent");
  await page.getByRole("link", { name: "Djentries főoldal" }).click();
  await expect(page.getByTestId("spotify-player")).toHaveAttribute("data-instance", "persistent");
  await page.getByRole("button", { name: "Lejátszó összecsukása" }).click();
  await expect(page.getByTestId("spotify-player")).toHaveCount(1);
  await page.getByRole("button", { name: "Lejátszó kibontása" }).click();
  await page.getByRole("button", { name: "Lejátszó bezárása és zene leállítása" }).click();
  await expect(page.getByTestId("spotify-player")).toHaveCount(0);
});

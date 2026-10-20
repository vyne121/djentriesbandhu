import { test, expect } from "@playwright/test";

test("concert activation waits until JavaScript is ready", async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: info.project.use.baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/koncertek");
    await expect(page.getByRole("button", { name: "Koncertek betöltése" })).toBeDisabled();
    await expect(page.locator("iframe")).toHaveCount(0);
  } finally { await context.close(); }
});

test("real music and social links stay inactive until the visitor chooses an embed", async ({ page }) => {
  const external: string[] = [];
  await page.route(/^https:\/\//, route => {
    external.push(route.request().url());
    return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>External content fixture</title>Preview" });
  });
  for (const path of ["/", "/zene", "/epk", "/koncertek"]) {
    await page.goto(path);
    await expect(page.locator("iframe")).toHaveCount(0);
  }
  expect(external).toEqual([]);
  await expect(page.getByRole("link", { name: "Djentries a Bandsintownon" })).toHaveAttribute("href", "https://www.bandsintown.com/a/15632384");
  const footer = page.locator("footer");
  for (const [name, href] of [
    ["Facebook", "https://www.facebook.com/djentries"],
    ["TikTok", "https://www.tiktok.com/@djentries"],
    ["Instagram", "https://www.instagram.com/djentries"],
    ["YouTube", "https://www.youtube.com/@Djentries"],
    ["Spotify", "https://open.spotify.com/artist/25btqvZzKJ5fBQdg6usk9F"],
    ["Apple Music", "https://music.apple.com/hu/artist/djentries/1614085728"],
  ]) {
    await expect(footer.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  await page.getByRole("button", { name: "Koncertek betöltése" }).click();
  await expect(page.locator(".events-frame")).toHaveAttribute("srcdoc", /data-artist-name="id_15632384"/);
  await expect.poll(() => external.some(url => url.startsWith("https://widgetv3.bandsintown.com/"))).toBe(true);
  await page.goto("/zene");
  await page.getByRole("button", { name: "Végtelen az éj - dalszövegvideó megnyitása" }).click();
  await expect(page.getByRole("dialog").locator("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/oPYge6KiqLw?autoplay=0");
});

test("each configured carousel release opens its own official Spotify embed", async ({ page }) => {
  await page.route("https://open.spotify.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Spotify fixture</title>Player" }));
  await page.goto("/zene");
  const carousel = page.getByRole("region", { name: "Megjelenések" });
  for (const [title, id] of [
    ["A Szikra", "3taDUP2vKAV3r5nefp99oP"],
    ["Végtelen az éj", "1WHpIS0SbbJ8RPcGgrHYAF"],
    ["Djentries", "4EkWjedrBqZpN5LNrWdZPr"],
    ["Vedd el ami kell", "2qJ86jAPwc1Tuocw1eUtwV"],
    ["Harcra kész", "5TIB46dabQdC7O9bMxQ2vW"],
    ["Látomás", "5NQ8hasEj9x8EN3YROsJuV"],
  ]) {
    await expect(carousel.getByRole("heading")).toHaveText(title);
    await carousel.getByRole("button", { name: "Hallgasd meg Spotify-on!", exact: true }).click();
    await expect(page.getByTestId("spotify-player")).toHaveCount(1);
    await expect(page.getByTestId("spotify-player")).toHaveAttribute("src", `https://open.spotify.com/embed/track/${id}?theme=0`);
    await page.getByRole("button", { name: "Lejátszó bezárása és zene leállítása" }).click();
    await carousel.getByRole("button", { name: "Következő megjelenés" }).click();
  }
});

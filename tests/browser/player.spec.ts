import { test, expect, type Page } from "@playwright/test";

const track = "https://open.spotify.com/track/25btqvZzKJ5fBQdg6usk9F";
const artist = "https://open.spotify.com/artist/25btqvZzKJ5fBQdg6usk9F";
async function configure(page: Page, first: string | null, second: string | null = null, fallback: string | null = artist) {
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    let index = 0;
    const body = (await response.text()).replace(/spotify: (?:null|"[^"]*")/g, () => {
      const value = [first, second][index++] ?? null;
      return `spotify: ${JSON.stringify(value)}`;
    }).replace(/spotifyArtist: (?:null|"[^"]*")/, `spotifyArtist: ${JSON.stringify(fallback)}`);
    await route.fulfill({ response, body });
  });
  await page.route("https://open.spotify.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Spotify fixture</title>Player" }));
}

for (const unavailable of [null, "https://example.com/not-spotify"]) {
  test(`specific release with ${unavailable === null ? "missing" : "invalid"} URL never plays a fallback`, async ({ page }) => {
    await configure(page, track, unavailable);
    await page.goto("/zene");
    const listen = page.getByRole("button", { name: "Hallgasd meg Spotify-on!", exact: true });
    await listen.click();
    const player = page.getByTestId("spotify-player");
    await expect(player).toHaveAttribute("src", /embed\/track\//);
    await player.evaluate(el => el.setAttribute("data-instance", "original"));
    await page.getByRole("button", { name: "Következő megjelenés" }).click();
    await listen.click();
    await expect(page.getByRole("dialog")).toContainText("Ez a megjelenés jelenleg nem hallgatható meg az oldalon.");
    await expect(player).toHaveAttribute("data-instance", "original");
    await expect(player).toHaveAttribute("src", /embed\/track\//);
  });
}

test("general listening falls back to the artist but a missing featured release does not", async ({ page }) => {
  await configure(page, null);
  await page.goto("/");
  await page.getByRole("button", { name: "Hallgasd meg Spotify-on!", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Ez a megjelenés jelenleg nem hallgatható meg az oldalon.");
  await expect(page.getByTestId("spotify-player")).toHaveCount(0);
  await page.getByRole("button", { name: "Bezárás", exact: true }).click();
  await page.getByRole("button", { name: "Hallgass minket!", exact: true }).click();
  await expect(page.getByTestId("spotify-player")).toHaveAttribute("src", /embed\/artist\//);
});

test("general listening reports unavailable when every link is missing", async ({ page }) => {
  await configure(page, null, null, null);
  await page.goto("/");
  await page.getByRole("button", { name: "Hallgass minket!", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Spotify");
  await expect(page.getByTestId("spotify-player")).toHaveCount(0);
});

test("Booking preserves the player and scrolls to contact from music and home", async ({ page }) => {
  await configure(page, track);
  let embeds = 0;
  page.on("request", request => { if (request.url().startsWith("https://open.spotify.com/embed/")) embeds++; });
  await page.goto("/");
  await page.getByRole("button", { name: "Hallgass minket!", exact: true }).click();
  const player = page.getByTestId("spotify-player");
  await expect(player).toHaveCount(1);
  await expect.poll(() => embeds).toBe(1);
  await player.evaluate(el => el.setAttribute("data-instance", "original"));
  await page.evaluate(() => { document.documentElement.dataset.instance = "original"; });
  await page.getByRole("button", { name: "Lejátszó összecsukása" }).click();
  if ((page.viewportSize()?.width ?? 1440) < 768) await page.getByRole("button", { name: "Menü megnyitása" }).click();
  await page.getByRole("link", { name: "Zene", exact: true }).click();
  for (const from of ["music", "home"]) {
    await page.locator(".header-booking").click();
    await expect(page).toHaveURL(/\/#kapcsolat$/);
    await expect(player).toHaveAttribute("data-instance", "original");
    await expect(page.locator("html")).toHaveAttribute("data-instance", "original");
    await expect.poll(() => page.locator("#kapcsolat").evaluate(el => Math.abs(el.getBoundingClientRect().top) < 100)).toBe(true);
    if (from === "music") await page.getByRole("link", { name: "Djentries főoldal" }).click();
  }
  expect(embeds).toBe(1);
});

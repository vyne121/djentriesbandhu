import { test, expect } from "@playwright/test";

test("convex release carousel selects by arrows, keyboard, covers and swipe", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/zene");
  await page.evaluate(() => document.fonts.ready);
  const carousel = page.getByRole("region", { name: "Megjelenések" });
  const title = carousel.getByRole("heading");
  await expect(title).toHaveText("A Szikra");
  await expect(carousel.locator(".release-cover")).toHaveCount(6);
  await expect(page.locator("iframe")).toHaveCount(0);
  const side = carousel.locator('.release-cover[data-offset="1"]');
  await expect(side).toHaveCSS("--angle", "44deg");
  await expect(side).toHaveCSS("--depth", "-180px");
  await carousel.getByRole("button", { name: "Következő megjelenés" }).click();
  await expect(title).toHaveText("Végtelen az éj");
  await carousel.getByRole("button", { name: "Következő megjelenés" }).click();
  await expect(title).toHaveText("Djentries");
  await expect(carousel.locator('.release-cover[data-offset="0"] img')).toHaveAttribute("src", "/images/brand/cover-candidate.webp");
  await carousel.getByRole("button", { name: "Következő megjelenés" }).click();
  for (const titleText of ["Vedd el ami kell", "Harcra kész", "Látomás"]) {
    await expect(title).toHaveText(titleText);
    const image = carousel.locator('.release-cover[data-offset="0"] img');
    await expect(image).toBeVisible();
    expect(await image.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(800);
    await carousel.getByRole("button", { name: "Következő megjelenés" }).click();
  }
  await expect(title).toHaveText("A Szikra");
  await carousel.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(title).toHaveText("Látomás");
  await carousel.getByRole("button", { name: "Megjelenés kiválasztása: A Szikra", exact: true }).click();
  await expect(title).toHaveText("A Szikra");
  const orbit = carousel.locator(".release-orbit");
  await orbit.dispatchEvent("pointerdown", { clientX: 250, clientY: 120 });
  await orbit.dispatchEvent("pointerup", { clientX: 150, clientY: 125 });
  await expect(title).toHaveText("Végtelen az éj");
  await expect(carousel.getByRole("status")).toHaveText("2 / 6 - Végtelen az éj");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(carousel.locator(".release-cover").first()).toHaveCSS("transition-duration", "0s");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await carousel.screenshot({ path: `../${info.project.name}-release-carousel.png` });
  expect(errors).toEqual([]);
});

test("single-release carousel keeps listening and disables paging", async ({ page }) => {
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/releases: \[[\s\S]*?\n  \],/, 'releases: [{ title: "A Szikra", kind: "Zene", spotify: null, artwork: "/images/brand/a-szikra.webp" }],');
    await route.fulfill({ response, body });
  });
  await page.goto("/zene");
  const carousel = page.getByRole("region", { name: "Megjelenések" });
  await expect(carousel.locator(".release-cover")).toHaveCount(1);
  await expect(carousel.getByRole("button", { name: "Előző megjelenés" })).toBeDisabled();
  await expect(carousel.getByRole("button", { name: "Következő megjelenés" })).toBeDisabled();
  await carousel.getByRole("button", { name: "Hallgasd meg Spotify-on!", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Spotify");
});


test("releases bend outward on both sides of the selected cover", async ({ page }) => {
  await page.goto("/zene");
  const carousel = page.getByRole("region", { name: "Megjelenések" });
  await expect(carousel.locator('.release-cover[data-offset="-1"]')).toHaveCSS("--angle", "-44deg");
  await expect(carousel.locator('.release-cover[data-offset="1"]')).toHaveCSS("--angle", "44deg");
  await expect(carousel.locator('.release-cover[data-offset="0"]')).toHaveCSS("--depth", "0px");
});

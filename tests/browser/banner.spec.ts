import { test, expect } from "@playwright/test";

test("band banner loops, pauses and respects reduced motion", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const track = page.locator(".banner-track");
  const groups = track.locator(".banner-group");
  await expect(groups).toHaveCount(2);
  expect(await groups.first().textContent()).toMatch(/^(DJENTRIES )+$/);
  expect(await groups.first().textContent()).toEqual(await groups.last().textContent());
  await expect(track).toHaveCSS("font-weight", "900");
  await expect(track).toHaveCSS("font-style", "italic");
  const initial = await track.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => track.evaluate(element => getComputedStyle(element).transform)).not.toBe(initial);
  await page.getByRole("button", { name: "Banner mozgásának szüneteltetése" }).click();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await expect(page.locator(".banner-toggle")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".manifesto-strip").screenshot({ path: `../${info.project.name}-banner.png` });
  await page.getByRole("button", { name: "Banner mozgásának folytatása" }).click();
  await expect(track).toHaveCSS("animation-play-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(track).toHaveCSS("animation-name", "none");
  await expect(page.locator(".banner-toggle")).toBeHidden();
  await expect(track).toBeVisible();
});

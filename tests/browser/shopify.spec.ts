import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

// These tests check our integration wiring. Live Shopify checkout remains a launch check.
test("Shopify opt-in, variants, sold-out state and cart use the selected product", async ({ page }) => {
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace("shopify: null", 'shopify: {domain: "https://djentries-test.myshopify.com", publicAccessToken: "", productHandles: ["test-shirt"], country: "HU", language: "HU", policies: []}') });
  });
  const external: string[] = [];
  await page.route(/^https:\/\//, async route => {
    external.push(route.request().url());
    if (route.request().url() === "https://cdn.shopify.com/storefront/web-components.js") {
      return route.fulfill({ path: fileURLToPath(new URL("./fixtures/shopify.js", import.meta.url)), contentType: "application/javascript" });
    }
    if (route.request().url() === "https://djentries-test.myshopify.com/checkouts/test") {
      return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Test checkout</title><h1>Test checkout intercepted - no payment</h1>" });
    }
    await route.abort();
  });
  await page.goto("/shop");
  expect(external).toEqual([]);
  await expect(page.locator("shopify-store")).toHaveCount(0);
  await page.getByRole("button", { name: "Shop betöltése" }).click();
  await expect(page.getByRole("heading", { name: "Teszt póló", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("A készletet és az árakat");
  await expect(page.locator("shopify-store")).toHaveAttribute("store-domain", "https://djentries-test.myshopify.com");
  await expect(page.locator("shopify-store")).toHaveAttribute("country", "HU");
  const sizes = page.getByRole("combobox", { name: "Méret" });
  await sizes.selectOption("XL");
  await expect(page.getByRole("button", { name: "Elfogyott", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Kosár megnyitása", exact: true }).click();
  const cart = page.getByRole("dialog", { name: "Kosár", exact: true });
  await expect(page.locator("shopify-cart").getByText("A kosarad még üres.", { exact: true })).toBeVisible();
  await cart.getByRole("button", { name: "Bezárás", exact: true }).click();
  for (const size of ["L", "M"]) {
    await sizes.selectOption(size);
    await page.getByRole("button", { name: "Kosárba", exact: true }).click();
    await expect(cart).toBeVisible();
    await expect(cart.getByRole("spinbutton", { name: `${size} mennyiség`, exact: true })).toHaveValue("1");
    await cart.getByRole("button", { name: "Bezárás", exact: true }).click();
  }
  await page.getByRole("button", { name: "Kosár megnyitása", exact: true }).click();
  await cart.getByRole("spinbutton", { name: "L mennyiség", exact: true }).fill("2");
  await cart.getByRole("spinbutton", { name: "L mennyiség", exact: true }).press("Tab");
  await cart.getByRole("button", { name: "Bezárás", exact: true }).click();
  await sizes.selectOption("L");
  await page.getByRole("button", { name: "Kosárba", exact: true }).click();
  await expect(cart.getByRole("spinbutton", { name: "L mennyiség", exact: true })).toHaveValue("3");
  await expect(cart.getByRole("spinbutton")).toHaveCount(2);
  const checkout = cart.getByRole("link", { name: "Tovább a fizetéshez" });
  await expect(checkout).toHaveAttribute("href", "https://djentries-test.myshopify.com/checkouts/test");
  await checkout.click();
  await expect(page.getByRole("heading")).toHaveText("Test checkout intercepted - no payment");
});

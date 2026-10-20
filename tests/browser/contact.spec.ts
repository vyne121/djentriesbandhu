import { test, expect, type Page } from "@playwright/test";

const recipient = "djentriesband+szervezes@gmail.com";
const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;
async function fillForm(page: Page) {
  const form = page.getByRole("form", { name: "Kapcsolatfelvételi űrlap" });
  await form.getByLabel("Név", { exact: true }).fill("Teszt Szervező");
  await form.getByLabel("E-mail-cím", { exact: true }).fill("booker@example.com");
  await form.getByLabel("Tárgy", { exact: true }).fill("Koncertmegkeresés");
  await form.getByLabel("Üzenet", { exact: true }).fill("Ez kizárólag helyi, elfogott tesztüzenet.");
  return form;
}

test("contact form sends once to the booking alias and shows confirmed success", async ({ page }, info) => {
  let requests = 0;
  let received: Record<string, string> = {};
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  await page.route("https://formsubmit.co/**", async route => {
    requests++;
    expect(route.request().url()).toBe(endpoint);
    expect(route.request().method()).toBe("POST");
    received = route.request().postDataJSON();
    await pending;
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: "true" }) });
  });
  await page.goto("/epk");
  expect(requests).toBe(0);
  await expect(page.getByRole("link", { name: "djentriesband@gmail.com", exact: true })).toHaveAttribute("href", "mailto:djentriesband@gmail.com");
  await expect(page.getByRole("link", { name: "+36 30 403 24 09", exact: true })).toHaveAttribute("href", "tel:+36304032409");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
  await expect(form.getByRole("button", { name: "Küldés folyamatban…" })).toBeDisabled();
  await expect.poll(() => requests).toBe(1);
  expect(received).toMatchObject({ name: "Teszt Szervező", email: "booker@example.com", _replyto: "booker@example.com", _subject: "Djentries kapcsolat: Koncertmegkeresés", message: "Ez kizárólag helyi, elfogott tesztüzenet.", _honey: "" });
  expect(received).not.toHaveProperty("_captcha");
  finish();
  await expect(form.getByRole("status")).toContainText("a küldőszolgáltatás fogadta");
  await expect(form.getByLabel("Üzenet", { exact: true })).toHaveValue("");
  expect(requests).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".booking").screenshot({ path: `../${info.project.name}-contact-form.png` });
});

test("failed or malformed service responses preserve the message for manual retry", async ({ page }) => {
  let attempt = 0;
  await page.route("https://formsubmit.co/**", async route => {
    attempt++;
    if (attempt === 1) return route.fulfill({ status: 503, contentType: "application/json", body: '{"success":false}' });
    if (attempt === 2) return route.fulfill({ contentType: "application/json", body: '{"success":"false"}' });
    if (attempt === 3) return route.fulfill({ contentType: "text/html", body: "Service error" });
    await route.fulfill({ contentType: "application/json", body: '{"success":true}' });
  });
  await page.goto("/");
  const form = await fillForm(page);
  for (let attemptNumber = 1; attemptNumber <= 3; attemptNumber++) {
    await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
    await expect(form.getByRole("status")).toContainText("Az üzeneted megmaradt");
    await expect(form.getByLabel("Üzenet", { exact: true })).toHaveValue("Ez kizárólag helyi, elfogott tesztüzenet.");
    expect(attempt).toBe(attemptNumber);
  }
  await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("a küldőszolgáltatás fogadta");
});

test("invalid or blank fields never contact the sending service", async ({ page }) => {
  let requests = 0;
  await page.route("https://formsubmit.co/**", async route => { requests++; await route.abort(); });
  await page.goto("/koncertek");
  const form = await fillForm(page);
  await form.getByLabel("E-mail-cím", { exact: true }).fill("invalid");
  await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
  expect(await form.getByLabel("E-mail-cím", { exact: true }).evaluate(input => (input as HTMLInputElement).validity.typeMismatch)).toBe(true);
  await form.getByLabel("E-mail-cím", { exact: true }).fill("booker@example.com");
  await form.getByLabel("Név", { exact: true }).fill("   ");
  await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("Ellenőrizd a mezőket");
  expect(requests).toBe(0);
});


test("activation response explains the missing confirmation without clearing the form", async ({ page }) => {
  await page.route("https://formsubmit.co/**", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: "false", message: "This form needs Activation. Check your email." }) }));
  await page.goto("/epk");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("A fogadó e-mail-címet még aktiválni kell");
  await expect(form.locator(".contact-provider-error")).toContainText("This form needs Activation");
  await expect(form.getByLabel("Üzenet", { exact: true })).toHaveValue("Ez kizárólag helyi, elfogott tesztüzenet.");
});

test("privacy opens separately and preserves every draft field", async ({ page }) => {
  await page.goto("/epk");
  const form = await fillForm(page);
  const link = form.getByRole("link", { name: "Adatkezelési tájékoztató (új lapon)" });
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  const popupPromise = page.waitForEvent("popup");
  await link.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/adatvedelem$/);
  await popup.close();
  await expect(page).toHaveURL(/\/epk$/);
  for (const [label, value] of [["Név", "Teszt Szervező"], ["E-mail-cím", "booker@example.com"], ["Tárgy", "Koncertmegkeresés"], ["Üzenet", "Ez kizárólag helyi, elfogott tesztüzenet."]]) {
    await expect(form.getByLabel(label, { exact: true })).toHaveValue(value);
  }
});

test("activation notice uses the configured recipient", async ({ page }) => {
  const configured = "booking-test@example.com";
  await page.route("**/app/content.ts*", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(`formEmail: "${recipient}"`, `formEmail: "${configured}"`) });
  });
  let destination = "";
  await page.route("https://formsubmit.co/**", route => {
    destination = route.request().url();
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: false, message: "This form needs Activation. Check your email." }) });
  });
  await page.goto("/epk");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Üzenet küldése", exact: true }).click();
  await expect(form.getByRole("status")).toContainText(configured);
  expect(destination).toBe(`https://formsubmit.co/ajax/${encodeURIComponent(configured)}`);
  await expect(form.getByRole("status")).not.toContainText(recipient);
  await expect(form.getByLabel("Üzenet", { exact: true })).toHaveValue("Ez kizárólag helyi, elfogott tesztüzenet.");
  await expect(page.getByRole("link", { name: "djentriesband@gmail.com", exact: true })).toBeVisible();
});

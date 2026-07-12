import { expect, test } from "@playwright/test";

test("public dashboard refreshes the 24-hour trend without changing the range", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByRole("columnheader", { name: "近24h趋势" })).toBeVisible();

  const refresh = page.waitForResponse(
    (response) => {
      const url = new URL(response.url());
      return response.request().method() === "GET"
        && url.pathname === "/api/public/channels"
        && url.searchParams.get("range") === "24";
    },
    { timeout: 12_000 }
  );

  await expect(refresh).resolves.toBeTruthy();
});

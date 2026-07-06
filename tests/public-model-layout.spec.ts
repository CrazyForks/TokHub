import { expect, test } from "@playwright/test";

test("public model detail table keeps native table-cell layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "监控总览" })).toBeVisible();

  await page.locator(".board-dim-tabs .ch-tab").filter({ hasText: "模型" }).click();
  const detailTable = page.locator(".core-model-brand-table").first();
  await expect(detailTable).toBeVisible();

  const metrics = await detailTable.evaluate((table) => {
    const bodyRows = Array.from(table.querySelectorAll("tbody tr")).filter((row) => row.querySelector(".core-brand-name"));
    const firstRow = bodyRows[0];
    const cells = firstRow ? Array.from(firstRow.children) : [];
    const heights = cells.map((cell) => Math.round(cell.getBoundingClientRect().height));

    return {
      bodyRowCount: bodyRows.length,
      displays: cells.map((cell) => getComputedStyle(cell).display),
      heightDelta: heights.length ? Math.max(...heights) - Math.min(...heights) : null,
      paddings: cells.map((cell) => getComputedStyle(cell).paddingTop),
      tableLayout: getComputedStyle(table).tableLayout
    };
  });

  expect(metrics.bodyRowCount).toBeGreaterThan(0);
  expect(metrics.tableLayout).toBe("fixed");
  expect(metrics.displays.every((display) => display === "table-cell")).toBe(true);
  expect(metrics.heightDelta).not.toBeNull();
  expect(metrics.heightDelta).toBeLessThanOrEqual(1);
  expect(metrics.paddings.every((padding) => padding !== "0px")).toBe(true);
});

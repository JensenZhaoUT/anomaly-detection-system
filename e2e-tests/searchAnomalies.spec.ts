import { test, expect } from '@playwright/test';

test('Search Anomalies', async ({ page }) => {
  await page.goto('/');

  // Ensure the page loads correctly
  await expect(page).toHaveTitle(/Anomaly Detection System/);

  // Select the input field by its label
  const inputField = await page.locator('text=Search by Time').locator('..').locator('input');
  await expect(inputField).toBeVisible();

  // Perform a search
  await inputField.fill('12');
  await page.click('button:has-text("Search")');

  // Verify that the search button can be clicked
  const searchButton = await page.locator('button:has-text("Search")');
  await expect(searchButton).toBeEnabled(); // Ensure the button is enabled and clickable
});

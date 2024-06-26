import { test, expect } from '@playwright/test';

test('Upload and Process Video', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('/');

  // Ensure the page loads correctly
  await expect(page).toHaveTitle(/Anomaly Detection System/);

  // More specific selector for the file input button
  const fileInput = await page.locator('input[type="file"]');
  await expect(fileInput).toBeVisible();

  // Upload a video file
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    fileInput.click()
  ]);
  await fileChooser.setFiles('./assets/video.mp4');

  // Click the upload button
  await page.click('text=Upload');

  // Click the process video button
  await page.click('text=Process Video');

  // Verify that the video preview is visible
  const videoPreview = await page.locator('video');
  await expect(videoPreview).toBeVisible();
});

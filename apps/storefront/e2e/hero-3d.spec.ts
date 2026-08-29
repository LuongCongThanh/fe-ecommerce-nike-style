import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

/**
 * A shader that fails to compile still leaves a visible, correctly-sized canvas — the layer just
 * paints nothing. Watching the console is what separates "the canvas mounted" from "the canvas
 * works"; an earlier version of this suite passed against a completely black hero.
 */
function collectWebGLErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    const text = message.text();
    if (/WebGLProgram|Shader Error|VALIDATE_STATUS|INVALID_OPERATION/i.test(text)) errors.push(text);
  });

  return errors;
}

const HOME = '/vi/home';
const CANVAS_LAYER = '[data-testid="hero-slides-3d"]';
const HERO_IMAGE = 'section[aria-roledescription="carousel"] img';

test.describe('Hero WebGL slides', () => {
  test.describe('with reduced motion', () => {
    test('never loads the WebGL layer and leaves the carousel usable', async ({ page }) => {
      // Set explicitly rather than through `test.use({ reducedMotion })`, which the project-level
      // device options in playwright.config.ts override.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(HOME);
      await expect(page.locator(HERO_IMAGE).first()).toBeVisible();

      // The gate resolves inside an idle slot with a 2s ceiling, so give it room to misbehave.
      await page.waitForTimeout(4_000);
      await expect(page.locator(CANVAS_LAYER)).toHaveCount(0);

      await page.getByRole('button', { name: 'Slide tiếp theo' }).click();
      await expect(page.getByText('Giày cho mọi nhịp sống')).toBeVisible();
      await expect(page.locator(HERO_IMAGE).first()).toBeVisible();
    });
  });

  // WebGL2 is only dependable in headless Chromium on CI hardware; the other engines exercise the
  // 2D path above, which is the branch that must never break.
  test('hands over to the canvas only after the hero image has painted', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'headless Firefox/WebKit have no reliable WebGL2 context');

    const webglErrors = collectWebGLErrors(page);
    await page.goto(HOME, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(CANVAS_LAYER)).toHaveCount(0);

    const heroImage = page.locator(HERO_IMAGE).first();
    await expect(heroImage).toBeVisible();
    await expect.poll(async () => heroImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

    await expect(page.locator(`${CANVAS_LAYER} canvas`)).toBeVisible({ timeout: 10_000 });

    // The DOM image stays mounted for links, focus and autoplay — it is only made transparent.
    await expect.poll(async () => heroImage.evaluate((img) => getComputedStyle(img).opacity)).toBe('0');
    await expect(page.getByRole('button', { name: 'Slide tiếp theo' })).toBeVisible();

    // Exercise a real dissolve, then insist the GPU accepted every program it was handed.
    await page.getByRole('button', { name: 'Slide tiếp theo' }).click();
    await expect(page.getByText('Giày cho mọi nhịp sống')).toBeVisible();
    await page.waitForTimeout(1_200);

    expect(webglErrors).toEqual([]);
  });
});

import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3005/about', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/about-viewport.png' });
  await browser.close();
})();

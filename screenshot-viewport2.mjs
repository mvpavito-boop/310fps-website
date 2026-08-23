import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  await page.goto('http://localhost:3005/about', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: '/tmp/about-viewport2.png' });
  await browser.close();
})();

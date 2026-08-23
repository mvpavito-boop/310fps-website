import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  await page.goto('http://localhost:3005/about', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/about-error.png' });
  await browser.close();
})();

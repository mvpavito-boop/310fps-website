import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop full page
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await desktop.goto('http://localhost:3005/about', { waitUntil: 'domcontentloaded' });
  await desktop.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await desktop.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await desktop.waitForTimeout(4000);
  await desktop.screenshot({ path: '/tmp/about-v2-desktop.png', fullPage: true });
  await desktop.close();
  
  // Mobile full page
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mobile.goto('http://localhost:3005/about', { waitUntil: 'domcontentloaded' });
  await mobile.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await mobile.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await mobile.waitForTimeout(4000);
  await mobile.screenshot({ path: '/tmp/about-v2-mobile.png', fullPage: true });
  await mobile.close();
  
  // Desktop sections for detail
  const deskSection = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await deskSection.goto('http://localhost:3005/about', { waitUntil: 'domcontentloaded' });
  await deskSection.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await deskSection.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await deskSection.waitForTimeout(4000);
  await deskSection.evaluate(() => window.scrollTo(0, 900));
  await deskSection.waitForTimeout(500);
  await deskSection.screenshot({ path: '/tmp/about-v2-timeline-desktop.png' });
  await deskSection.close();
  
  // Mobile sections
  const mobSection = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mobSection.goto('http://localhost:3005/about', { waitUntil: 'domcontentloaded' });
  await mobSection.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await mobSection.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await mobSection.waitForTimeout(4000);
  await mobSection.evaluate(() => window.scrollTo(0, 1200));
  await mobSection.waitForTimeout(500);
  await mobSection.screenshot({ path: '/tmp/about-v2-timeline-mobile.png' });
  await mobSection.close();
  
  await browser.close();
})();

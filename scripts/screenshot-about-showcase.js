const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3004/about');
  await page.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await page.reload();
  await page.waitForTimeout(1500);

  // Скроллим для активации Reveal-секций
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let i = 0; i < 12; i++) {
      window.scrollTo(0, step * i);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  // 1. Hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/01-hero.png' });

  // 2. Master
  const master = await page.$('#master');
  if (master) await master.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/02-master.png' });

  // 3. Timeline
  const path = await page.$('#path');
  if (path) await path.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/03-timeline.png' });

  // 4. Process + Stats
  const processSection = await page.$('text=Как собирается');
  if (processSection) {
    const box = await processSection.boundingBox();
    if (box) await page.evaluate((y) => window.scrollTo(0, y - 80), box.y);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/04-process.png' });

  // 5. SLA
  const sla = await page.$('text=Что обещаем');
  if (sla) {
    const box = await sla.boundingBox();
    if (box) await page.evaluate((y) => window.scrollTo(0, y - 80), box.y);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/05-sla.png' });

  // 6. Reviews
  const reviews = await page.$('text=Голоса');
  if (reviews) {
    const box = await reviews.boundingBox();
    if (box) await page.evaluate((y) => window.scrollTo(0, y - 80), box.y);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/06-reviews.png' });

  // 7. CTA + Footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/about-showcase/07-cta.png' });

  // Mobile hero
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:3004/about');
  await mobilePage.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
  await mobilePage.reload();
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: '/tmp/about-showcase/08-mobile-hero.png' });

  const masterMobile = await mobilePage.$('#master');
  if (masterMobile) await masterMobile.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: '/tmp/about-showcase/09-mobile-master.png' });

  await mobileCtx.close();
  await context.close();
  await browser.close();
  console.log('Screenshots saved to /tmp/about-showcase/');
})();

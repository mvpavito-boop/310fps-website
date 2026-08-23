const { chromium } = require('playwright');
const { exec } = require('child_process');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.status === 200 || res.status === 307) return;
    } catch {}
    await sleep(500);
  }
  throw new Error('Server did not start');
}

(async () => {
  const server = exec('npm run dev -- --webpack --port 3005', { cwd: '/Users/310fps/Documents/ Проект Сайта 310FPS', stdio: 'ignore' });
  server.unref();

  try {
    await waitForServer('http://localhost:3005/about');
    await sleep(2000);

    const browser = await chromium.launch();

    // Desktop
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const dPage = await desktop.newPage();
    await dPage.goto('http://localhost:3005/about');
    await dPage.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
    await dPage.reload();
    await sleep(2500);
    await dPage.screenshot({ path: '/tmp/about-desktop-top.png' });
    await dPage.evaluate(() => document.querySelector('#path')?.scrollIntoView({ block: 'start' }));
    await sleep(1200);
    await dPage.screenshot({ path: '/tmp/about-desktop-timeline.png' });
    await desktop.close();

    // Mobile
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mPage = await mobile.newPage();
    await mPage.goto('http://localhost:3005/about');
    await mPage.evaluate(() => sessionStorage.setItem('310fps:booted', '1'));
    await mPage.reload();
    await sleep(2500);
    await mPage.evaluate(() => document.querySelector('#path')?.scrollIntoView({ block: 'start' }));
    await sleep(1200);
    await mPage.screenshot({ path: '/tmp/about-mobile-timeline.png' });
    await mobile.close();

    await browser.close();
    console.log('Screenshots done');
  } finally {
    server.kill();
  }
})();

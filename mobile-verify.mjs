import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.screenshot({ path: '/workspace/agent/history-borders-mobile.png', fullPage: true });
const data = await page.evaluate(() => {
  const globe = document.querySelector('.globe-stage')?.getBoundingClientRect();
  const card = document.querySelector('.snapshot-card')?.getBoundingClientRect();
  return {
    globeTop: globe?.top,
    cardTop: card?.top,
    firstViewportText: document.elementFromPoint(window.innerWidth / 2, Math.min(window.innerHeight - 20, (globe?.top ?? 0) + 20))?.closest('.globe-stage, .snapshot-card')?.className ?? '',
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
});
console.log(JSON.stringify({ data, errors }, null, 2));
await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
if (!(Number(data.globeTop) < Number(data.cardTop))) throw new Error('Mobile/tablet layout should show globe before snapshot card.');
if (data.scrollWidth > data.innerWidth) throw new Error('Mobile horizontal overflow detected.');

import puppeteer from 'puppeteer-core';
const url = 'https://history-borders.lightwait.workers.dev';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('United States'))?.click());
await new Promise(resolve => setTimeout(resolve, 400));
await page.evaluate(() => Array.from(document.querySelectorAll('.chronology-event')).find((button) => button.textContent?.includes('Louisiana Purchase'))?.click());
await new Promise(resolve => setTimeout(resolve, 400));
const desktop = await page.evaluate(() => ({
  title: document.title,
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronologyEvents: document.querySelectorAll('.chronology-event').length,
  currentCount: document.querySelectorAll('.empire-current').length,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-live-workers.png', fullPage: true });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await new Promise(resolve => setTimeout(resolve, 250));
const mobile = await page.evaluate(() => ({
  chronologyEvents: document.querySelectorAll('.chronology-event').length,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  globeTop: document.querySelector('.globe-stage')?.getBoundingClientRect().top,
}));
console.log(JSON.stringify({ url, desktop, mobile, errors }, null, 2));
if (!desktop.h1?.includes('Louisiana Purchase')) throw new Error('Live site chronology click did not move the timeline/map.');
if (!desktop.inspector?.includes('Louisiana Purchase')) throw new Error('Live site chronology click did not populate inspector.');
if (desktop.chronologyEvents < 6 || mobile.chronologyEvents < 6) throw new Error('Live site chronology band is missing.');
if (desktop.currentCount < 1) throw new Error('Live site current map layer missing.');
if (desktop.scrollWidth > desktop.innerWidth || mobile.scrollWidth > mobile.innerWidth) throw new Error('Live site has horizontal overflow.');
if (errors.length) throw new Error(`Live browser errors: ${errors.join('; ')}`);
await browser.close();

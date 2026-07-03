import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('United States'))?.click());
await new Promise(resolve => setTimeout(resolve, 300));
const before = await page.evaluate(() => ({
  events: document.querySelectorAll('.chronology-event').length,
  ticks: document.querySelectorAll('.snapshot-ticks span').length,
  future: document.querySelectorAll('.chronology-event.future').length,
  active: document.querySelectorAll('.chronology-event.active').length,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.evaluate(() => Array.from(document.querySelectorAll('.chronology-event')).find((button) => button.textContent?.includes('Louisiana Purchase'))?.click());
await new Promise(resolve => setTimeout(resolve, 350));
const after = await page.evaluate(() => ({
  inspector: document.querySelector('.inspector')?.textContent,
  h1: document.querySelector('.timeline-head h1')?.textContent,
  activeText: document.querySelector('.chronology-event.active')?.textContent,
  currentCount: document.querySelectorAll('.empire-current').length,
  activeStem: getComputedStyle(document.querySelector('.chronology-event.active'), '::after').content !== 'none',
  activeYearOpacity: getComputedStyle(document.querySelector('.chronology-event.active span')).opacity,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-chronology.png', fullPage: true });
console.log(JSON.stringify({ before, after, errors }, null, 2));
if (before.events < 6 || before.ticks < 4) throw new Error('Chronology band did not render enough event/snapshot ticks.');
if (before.future < 1) throw new Error('Chronology band is not distinguishing future events from current map context.');
if (!after.inspector?.includes('Louisiana Purchase') || !after.activeText?.includes('Louisiana Purchase')) throw new Error('Chronology event click did not drive selected event detail.');
if (!after.h1?.includes('Louisiana Purchase')) throw new Error('Chronology event click did not move map to nearest snapshot.');
if (!after.activeStem || after.activeYearOpacity !== '0') throw new Error('Active chronology playhead stem did not render cleanly.');
if (after.currentCount < 1) throw new Error('Current map layer missing after chronology selection.');
if (before.scrollWidth > before.innerWidth || after.scrollWidth > after.innerWidth) throw new Error('Horizontal overflow detected in chronology band.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

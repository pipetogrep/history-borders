import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=russia-ukraine&year=1991', { waitUntil: 'networkidle0' });
const before = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  activeEvents: document.querySelectorAll('.event-rail button.active').length,
  rangeValue: document.querySelector('input[type="range"]')?.value,
}));
await page.evaluate(() => Array.from(document.querySelectorAll('.top-controls button')).find((button) => button.textContent?.includes('play'))?.click());
await new Promise(resolve => setTimeout(resolve, 2150));
const after = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  activeEvents: document.querySelectorAll('.event-rail button.active').length,
  transition: document.querySelector('.transition-strip')?.textContent,
  rangeValue: document.querySelector('input[type="range"]')?.value,
  url: window.location.href,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-playback.png', fullPage: true });
console.log(JSON.stringify({ before, after, errors }, null, 2));
if (after.rangeValue === before.rangeValue) throw new Error('Play mode did not advance the unified chronology scrubber.');
if (after.activeEvents < 1 || !after.inspector?.includes('Ukrainian independence')) throw new Error('Play mode did not surface the next event in the inspector.');
if (!after.transition?.includes('Event driving the map')) throw new Error('Play mode did not couple event narration to the map transition panel.');
if (after.scrollWidth > after.innerWidth) throw new Error('Horizontal overflow detected during play mode.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=ottoman&year=1923&event=lausanne-1923', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronology: document.querySelector('.timeline-shell')?.textContent,
  sources: document.querySelector('.source-list')?.textContent,
  activeMarkers: document.querySelectorAll('.chronology-event.active').length,
  activeMapMarker: document.querySelector('.event-marker.active')?.getAttribute('data-label'),
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-ottoman-aftermath.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Post-Ottoman republic')) throw new Error('Ottoman aftermath snapshot was not selected.');
if (!data.inspector?.includes('Treaty of Lausanne') || !data.inspector?.includes('recognises the sovereignty and borders')) throw new Error('Lausanne detail missing from inspector.');
if (!data.chronology?.includes('Treaty of Sèvres') || !data.chronology?.includes('Turkish War of Independence')) throw new Error('Ottoman aftermath chronology lacks postwar context.');
if (!data.sources?.includes('Treaty of Lausanne') || !data.sources?.includes('Treaty of Sèvres')) throw new Error('Ottoman aftermath sources missing.');
if (data.activeMarkers !== 1 || !data.activeMapMarker?.includes('Treaty of Lausanne')) throw new Error('Expected exactly one active Lausanne marker on timeline and map.');
if (data.scrollWidth > data.innerWidth) throw new Error('Ottoman aftermath route introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=abbasid&year=1258&event=baghdad-1258', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronology: document.querySelector('.timeline-shell')?.textContent,
  sources: document.querySelector('.source-list')?.textContent,
  activeMarkers: document.querySelectorAll('.chronology-event.active').length,
  activeMapMarker: document.querySelector('.event-marker.active')?.getAttribute('data-label'),
  legend: document.querySelector('.map-legend')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-abbasid-fragmentation.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Baghdad falls')) throw new Error('Abbasid fall snapshot was not selected.');
if (!data.inspector?.includes('Sack of Baghdad') || !data.inspector?.includes('Mongol forces end')) throw new Error('Baghdad fall detail missing from inspector.');
if (!data.chronology?.includes('Buyid emirs enter Baghdad') || !data.chronology?.includes('Seljuks enter Baghdad')) throw new Error('Abbasid fragmentation chronology lacks intermediary power shifts.');
if (!data.sources?.includes('Buyid dynasty') || !data.sources?.includes('Seljuk Empire')) throw new Error('Abbasid fragmentation sources missing.');
if (!data.legend?.includes('administrative sketch')) throw new Error('Abbasid fall layer should read as an administrative sketch.');
if (data.activeMarkers !== 1 || !data.activeMapMarker?.includes('Sack of Baghdad')) throw new Error('Expected exactly one active Baghdad marker on timeline and map.');
if (data.scrollWidth > data.innerWidth) throw new Error('Abbasid fragmentation route introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

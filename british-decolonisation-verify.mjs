import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=british&year=1997&event=hong-kong-1997', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronology: document.querySelector('.timeline-shell')?.textContent,
  sources: document.querySelector('.source-list')?.textContent,
  legend: document.querySelector('.map-legend')?.textContent,
  activeTimelineMarkers: document.querySelectorAll('.chronology-event.active').length,
  activeMapMarker: document.querySelector('.event-marker.active')?.getAttribute('data-label'),
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-british-decolonisation.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Post-imperial remnant')) throw new Error('British post-imperial end-state was not selected.');
if (!data.inspector?.includes('Hong Kong handover') || !data.inspector?.includes('returns to Chinese sovereignty')) throw new Error('Hong Kong handover detail missing from inspector.');
if (!data.chronology?.includes('India and Pakistan independent') || !data.chronology?.includes('Suez Crisis') || !data.chronology?.includes('Wind of Change')) throw new Error('British decolonisation chronology is incomplete.');
if (!data.sources?.includes('Partition of India') || !data.sources?.includes('Handover of Hong Kong')) throw new Error('British decolonisation sources missing.');
if (!data.legend?.includes('legal border')) throw new Error('1997 British end-state should read as a legal border.');
if (data.activeTimelineMarkers !== 1 || !data.activeMapMarker?.includes('Hong Kong handover')) throw new Error('Expected exactly one active Hong Kong marker on timeline and map.');
if (data.scrollWidth > data.innerWidth) throw new Error('British decolonisation route introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

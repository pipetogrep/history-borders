import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=mongol&year=1368&event=yuan-1368', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronology: document.querySelector('.timeline-shell')?.textContent,
  sources: document.querySelector('.source-list')?.textContent,
  legend: document.querySelector('.map-legend')?.textContent,
  activeTimelineMarkers: document.querySelectorAll('.chronology-event.active').length,
  activeMapMarker: document.querySelector('.event-marker.active')?.getAttribute('data-label'),
  playhead: document.querySelector('.timeline-playhead')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-mongol-fragmentation.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Yuan retreat')) throw new Error('Mongol 1368 endpoint was not selected.');
if (!data.inspector?.includes('Yuan retreats from China') || !data.inspector?.includes('Ming forces take')) throw new Error('Mongol 1368 inspector detail missing.');
if (!data.chronology?.includes('Khanates acknowledge division') || !data.chronology?.includes('Red Turban rebellions')) throw new Error('Mongol fragmentation chronology incomplete.');
if (!data.sources?.includes('Division of the Mongol Empire') || !data.sources?.includes('Yuan dynasty')) throw new Error('Mongol fragmentation sources missing.');
if (!data.legend?.includes('administrative sketch')) throw new Error('Mongol endpoint layer should read as administrative sketch.');
if (data.activeTimelineMarkers !== 1 || !data.activeMapMarker?.includes('Yuan retreats from China')) throw new Error('Expected exactly one active Yuan retreat marker.');
if (!data.playhead?.includes('1368 CE')) throw new Error('Timeline playhead did not reach 1368.');
if (data.scrollWidth > data.innerWidth) throw new Error('Mongol fragmentation route introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

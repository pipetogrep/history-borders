import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=roman&year=1453&event=constantinople-1453-roman', { waitUntil: 'networkidle0' });
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
await page.screenshot({ path: '/workspace/agent/history-borders-roman-aftermath.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Constantinople falls')) throw new Error('Roman 1453 endpoint was not selected.');
if (!data.inspector?.includes('Constantinople falls') || !data.inspector?.includes('closes the Roman timeline')) throw new Error('Roman 1453 inspector detail missing.');
if (!data.chronology?.includes('Western emperor deposed') || !data.chronology?.includes('Fourth Crusade sacks Constantinople')) throw new Error('Roman late-antiquity/Byzantine chronology incomplete.');
if (!data.sources?.includes('Byzantine Empire') || !data.sources?.includes('Fourth Crusade') || !data.sources?.includes('Fall of Constantinople')) throw new Error('Roman aftermath sources missing.');
if (!data.legend?.includes('administrative sketch')) throw new Error('Roman endpoint layer should read as an administrative sketch.');
if (data.activeTimelineMarkers !== 1 || !data.activeMapMarker?.includes('Constantinople falls')) throw new Error('Expected exactly one active Constantinople marker.');
if (!data.playhead?.includes('1453 CE')) throw new Error('Timeline playhead did not reach 1453.');
if (data.scrollWidth > data.innerWidth) throw new Error('Roman aftermath route introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

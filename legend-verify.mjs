import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('Russia / Ukraine'))?.click());
await new Promise(resolve => setTimeout(resolve, 350));
const data = await page.evaluate(() => ({
  legend: document.querySelector('.map-legend')?.textContent ?? '',
  markerLabels: Array.from(document.querySelectorAll('.map-marker[data-label]')).slice(0, 8).map((node) => node.getAttribute('data-label')),
  geometrySource: document.querySelector('.snapshot-evidence')?.textContent ?? '',
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-legend.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
if (!data.legend.includes('occupation/control overlay') || !data.legend.includes('battle / war') || !data.legend.includes('place')) throw new Error('Legend does not expose layer and marker semantics.');
if (data.markerLabels.length < 3 || data.markerLabels.some((label) => !label)) throw new Error('Markers are missing data-label affordances.');
if (!data.geometrySource.includes('Geometry method') || !data.geometrySource.includes('Geometry source')) throw new Error('Snapshot evidence is missing geometry provenance.');
if (data.scrollWidth > data.innerWidth) throw new Error('Horizontal overflow detected.');

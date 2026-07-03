import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=bosnia-yugoslavia&year=1994&event=washington-1994', { waitUntil: 'networkidle0' });
const washington = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronology: document.querySelector('.timeline-shell')?.textContent,
  sources: document.querySelector('.source-list')?.textContent,
  activeMarkers: document.querySelectorAll('.chronology-event.active').length,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.goto('http://127.0.0.1:5173/?track=bosnia-yugoslavia&year=1992&event=sarajevo-siege', { waitUntil: 'networkidle0' });
const sarajevo = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  chronology: document.querySelector('.timeline-shell')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-bosnia-depth.png', fullPage: true });
console.log(JSON.stringify({ washington, sarajevo, errors }, null, 2));
if (!washington.inspector?.includes('Washington Agreement') || !washington.inspector?.includes('federation framework')) throw new Error('Washington Agreement context missing from Bosnia inspector.');
if (!washington.chronology?.includes('Washington Agreement') || washington.activeMarkers !== 1) throw new Error('Washington Agreement is not active in the Bosnia chronology.');
if (!washington.sources?.includes('Washington Agreement') || !washington.sources?.includes('Siege of Sarajevo')) throw new Error('Bosnia source list did not include the added context sources.');
if (!sarajevo.inspector?.includes('Siege of Sarajevo begins') || !sarajevo.inspector?.includes('humanitarian and political symbol')) throw new Error('Sarajevo siege context missing from Bosnia inspector.');
if (washington.scrollWidth > washington.innerWidth || sarajevo.scrollWidth > sarajevo.innerWidth) throw new Error('Bosnia depth route introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

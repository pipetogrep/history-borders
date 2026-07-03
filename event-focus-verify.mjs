import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=bosnia-yugoslavia&year=1994&event=washington-1994', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => {
  const active = document.querySelector('.event-marker.active');
  const before = active ? getComputedStyle(active, '::before') : null;
  const activeRect = active?.getBoundingClientRect();
  return {
    label: active?.getAttribute('data-label'),
    reticleContent: before?.content,
    reticleBorder: before?.borderTopWidth,
    boxShadow: active ? getComputedStyle(active).boxShadow : null,
    activeLeft: activeRect?.left,
    activeTop: activeRect?.top,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
});
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.label?.includes('Washington Agreement')) throw new Error('Washington Agreement is not the active map marker.');
if (data.reticleContent === 'none' || data.reticleBorder === '0px') throw new Error('Selected event reticle is not rendered.');
if (!data.boxShadow || data.boxShadow === 'none') throw new Error('Selected event marker lacks anchored focus shadow.');
if (typeof data.activeLeft !== 'number' || typeof data.activeTop !== 'number') throw new Error('Could not measure active map marker.');
if (data.scrollWidth > data.innerWidth) throw new Error('Event focus introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

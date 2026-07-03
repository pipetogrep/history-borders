import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=mongol&year=1368&event=yuan-1368', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => {
  const countries = [...document.querySelectorAll('.country')];
  const fills = countries.map((item) => getComputedStyle(item).fill).filter(Boolean);
  const uniqueFills = [...new Set(fills)];
  const sampleInline = countries.slice(0, 12).map((item) => item.getAttribute('style') ?? '').filter(Boolean);
  return {
    h1: document.querySelector('.timeline-head h1')?.textContent,
    countryCount: countries.length,
    uniqueFillCount: uniqueFills.length,
    sampleFills: uniqueFills.slice(0, 8),
    sampleInline,
    currentLayerCount: document.querySelectorAll('.empire-current').length,
    activeMarker: document.querySelector('.event-marker.active')?.getAttribute('data-label'),
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
});
await page.screenshot({ path: '/workspace/agent/history-borders-land-tones.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Yuan retreat')) throw new Error('Expected Mongol route to load for land-tone verification.');
if (data.countryCount < 80) throw new Error('World land layer did not render enough countries.');
if (data.uniqueFillCount < 5) throw new Error('Natural land-tone palette did not produce varied country fills.');
if (!data.sampleInline.some((style) => style.includes('--land-fill'))) throw new Error('Country paths are missing deterministic land-tone styles.');
if (data.currentLayerCount < 1 || !data.activeMarker?.includes('Yuan retreats from China')) throw new Error('Historical overlay or active event marker was lost.');
if (data.scrollWidth > data.innerWidth) throw new Error('Land-tone globe refinement introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

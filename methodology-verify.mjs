import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => ({
  methodologyCount: document.querySelectorAll('.methodology-panel').length,
  timelineTop: document.querySelector('.timeline-shell')?.getBoundingClientRect().top,
  globeTop: document.querySelector('.globe-panel')?.getBoundingClientRect().top,
  globeBottom: document.querySelector('.globe-panel')?.getBoundingClientRect().bottom,
  timeline: document.querySelector('.timeline-shell')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-broadcast-layout.png', fullPage: true });
if (data.methodologyCount !== 0) errors.push('Methodology/explainer panel should not be visible in broadcast layout.');
if (!data.timeline?.includes('Now on the map') || !data.timeline.includes('Approx. area')) errors.push('Lower-third timeline is missing current change context.');
if (!((data.timelineTop ?? 0) > (data.globeTop ?? 0) && (data.timelineTop ?? 0) < (data.globeBottom ?? 0))) errors.push('Timeline is not positioned within/near the globe hero region.');
if (data.scrollWidth > data.innerWidth) errors.push(`Horizontal overflow: ${data.scrollWidth} > ${data.innerWidth}`);
console.log(JSON.stringify({ data, errors }, null, 2));
await browser.close();
if (errors.length) throw new Error(errors.join('; '));

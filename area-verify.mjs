import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('United States'))?.click());
await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('United States'));
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((button) => button.textContent?.includes('Louisiana Purchase'))?.click());
await new Promise(resolve => setTimeout(resolve, 400));
const data = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  transition: document.querySelector('.transition-strip')?.textContent,
  areaMetric: document.querySelector('.area-metric')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Louisiana Purchase')) errors.push('Timeline did not select Louisiana Purchase snapshot.');
if (!data.areaMetric?.includes('Approx. area') || !data.areaMetric.includes('vs previous')) errors.push('Area metric/delta is missing from transition strip.');
if (!/km²/.test(data.areaMetric ?? '')) errors.push('Area metric is missing km² units.');
if (data.scrollWidth > data.innerWidth) errors.push(`Horizontal overflow: ${data.scrollWidth} > ${data.innerWidth}`);
if (errors.length) throw new Error(errors.join('; '));
await browser.close();

import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 950, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('Russia / Ukraine'))?.click());
await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Russia / Ukraine'));
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((button) => button.textContent?.includes('Assessed control'))?.click());
await new Promise(resolve => setTimeout(resolve, 500));
const control = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  baselineCount: document.querySelectorAll('.recognised-baseline').length,
  baselineLabel: document.querySelector('.recognised-baseline')?.getAttribute('aria-label'),
  legend: document.querySelector('.map-legend')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('United States'))?.click());
await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('United States'));
await new Promise(resolve => setTimeout(resolve, 300));
const recognised = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  baselineCount: document.querySelectorAll('.recognised-baseline').length,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
console.log(JSON.stringify({ control, recognised, errors }, null, 2));
if (!control.h1?.includes('Assessed occupation/control')) errors.push('Russia/Ukraine control snapshot did not select.');
if (control.baselineCount !== 1 || !control.baselineLabel?.includes('Recognised independent Ukraine')) errors.push('Control layer missing recognised Ukraine border baseline.');
if (!control.legend?.includes('recognised border baseline')) errors.push('Control layer legend missing baseline entry.');
if (recognised.baselineCount !== 0) errors.push('Recognised layer should not render a separate baseline overlay.');
if (control.scrollWidth > control.innerWidth || recognised.scrollWidth > recognised.innerWidth) errors.push('Horizontal overflow detected.');
if (errors.length) throw new Error(errors.join('; '));
await browser.close();

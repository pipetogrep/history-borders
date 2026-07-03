import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('.methodology-panel')?.scrollIntoView({ block: 'center' }));
await new Promise(resolve => setTimeout(resolve, 300));
await page.screenshot({ path: '/workspace/agent/history-borders-methodology.png', fullPage: true });
const data = await page.evaluate(() => ({
  method: document.querySelector('.methodology-panel')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
if (!data.method?.includes('Reading the map') || !data.method.includes('Start with the year') || !data.method.includes('Filled area')) errors.push('Reading-guide panel missing expected map-reading language.');
if (data.scrollWidth > data.innerWidth) errors.push(`Horizontal overflow: ${data.scrollWidth} > ${data.innerWidth}`);
console.log(JSON.stringify({ data, errors }, null, 2));
await browser.close();
if (errors.length) throw new Error(errors.join('; '));

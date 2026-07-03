import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('Russia / Ukraine'))?.click());
await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Russia / Ukraine'));
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((button) => button.textContent?.includes('Assessed control'))?.click());
await new Promise(resolve => setTimeout(resolve, 500));
await page.screenshot({ path: '/workspace/agent/history-borders-evidence.png', fullPage: true });
const data = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  card: document.querySelector('.snapshot-card')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
const text = `${data.card ?? ''} ${data.inspector ?? ''}`;
if (!text.includes('Assessed occupation/control') || !text.includes('Assessed control, July 2026')) errors.push('Expected selected historical context was not rendered.');
if (!text.includes('Why now') || !text.includes('What changed') || !text.includes('On screen')) errors.push('Expected viewer-facing story rows were not rendered.');
if (text.includes('Evidence weight') || text.includes('Geometry method') || text.includes('Source quality')) errors.push('Technical metadata leaked into the main viewing UI.');
if (data.scrollWidth > data.innerWidth) errors.push(`Horizontal overflow: ${data.scrollWidth} > ${data.innerWidth}`);
console.log(JSON.stringify({ data, errors }, null, 2));
await browser.close();
if (errors.length) throw new Error(errors.join('; '));

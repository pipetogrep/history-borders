import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('Russia / Ukraine'))?.click());
await new Promise(resolve => setTimeout(resolve, 400));
const before = await page.evaluate(() => ({
  transition: document.querySelector('.transition-strip')?.textContent,
  h1: document.querySelector('.timeline-head h1')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.evaluate(() => document.querySelector('.transition-strip button:last-child')?.click());
await new Promise(resolve => setTimeout(resolve, 400));
const after = await page.evaluate(() => ({
  transition: document.querySelector('.transition-strip')?.textContent,
  h1: document.querySelector('.timeline-head h1')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-transition.png', fullPage: true });
console.log(JSON.stringify({ before, after, errors }, null, 2));
if (!before.transition?.includes('Map change now') || !before.transition?.includes('occupation/control overlay')) throw new Error('Transition strip missing current layer semantics.');
if (after.h1 === before.h1) throw new Error('Next transition button did not advance the active snapshot.');
if (before.scrollWidth > before.innerWidth || after.scrollWidth > after.innerWidth) throw new Error('Horizontal overflow detected in transition strip.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

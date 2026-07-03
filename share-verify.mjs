import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=russia-ukraine&year=2026&event=july-2026', { waitUntil: 'networkidle0' });
await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Russia / Ukraine'));
const loaded = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  share: Array.from(document.querySelectorAll('.top-controls button')).map((node) => node.textContent).join(' '),
  url: window.location.href,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('United States'))?.click());
await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('United States'));
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((button) => button.textContent?.includes('Louisiana Purchase'))?.click());
await new Promise(resolve => setTimeout(resolve, 300));
const updated = await page.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  url: window.location.href,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
console.log(JSON.stringify({ loaded, updated, errors }, null, 2));
if (!loaded.h1?.includes('Assessed occupation/control') || !loaded.inspector?.includes('Assessed control, July 2026')) errors.push('Deep link did not restore Russia/Ukraine event state.');
if (!loaded.url.includes('track=russia-ukraine') || !loaded.url.includes('event=july-2026')) errors.push('Initial share URL was not preserved/normalised.');
if (!loaded.share.includes('share view')) errors.push('Share-view control is missing.');
if (!updated.h1?.includes('Louisiana Purchase') || !updated.inspector?.includes('Louisiana Purchase')) errors.push('Event click did not update selected story.');
if (!updated.url.includes('track=united-states') || !updated.url.includes('year=1803') || !updated.url.includes('event=louisiana')) errors.push('URL did not update to the selected share state.');
if (loaded.scrollWidth > loaded.innerWidth || updated.scrollWidth > updated.innerWidth) errors.push('Horizontal overflow detected in shareable URL state.');
if (errors.length) throw new Error(errors.join('; '));
await browser.close();

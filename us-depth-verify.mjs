import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173?track=united-states&year=1819&event=adams-onis', { waitUntil: 'networkidle0' });
const loaded = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  events: document.querySelectorAll('.chronology-event').length,
  ticks: document.querySelectorAll('.snapshot-ticks span').length,
  rangeMax: document.querySelector('input[type="range"]')?.max,
  transition: document.querySelector('.transition-strip')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((button) => button.textContent?.includes('Gadsden Purchase'))?.click());
await new Promise(resolve => setTimeout(resolve, 350));
const gadsden = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  transition: document.querySelector('.transition-strip')?.textContent,
  url: window.location.href,
}));
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((button) => button.textContent?.includes('Hawaii annexed'))?.click());
await new Promise(resolve => setTimeout(resolve, 350));
const hawaii = await page.evaluate(() => ({
  h1: document.querySelector('.timeline-head h1')?.textContent,
  inspector: document.querySelector('.inspector')?.textContent,
  transition: document.querySelector('.transition-strip')?.textContent,
  url: window.location.href,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
await page.screenshot({ path: '/workspace/agent/history-borders-us-depth.png', fullPage: true });
console.log(JSON.stringify({ loaded, gadsden, hawaii, errors }, null, 2));
if (loaded.ticks < 10 || loaded.events < 13) throw new Error(`United States track is not deep enough: ${loaded.ticks} snapshots, ${loaded.events} events.`);
if (!loaded.h1?.includes('Florida') || !loaded.inspector?.includes('Adams')) throw new Error('Adams–Onís deep link did not restore the new 1819 frame and event.');
if (!gadsden.h1?.includes('Gadsden') || !gadsden.inspector?.includes('small at globe scale') || !gadsden.transition?.includes('southern strip')) throw new Error('Gadsden event did not drive the new 1853 map frame.');
if (!hawaii.h1?.includes('Hawaii annexation') || !hawaii.inspector?.includes('before statehood') || !hawaii.transition?.includes('wider 1898 imperial turn') || !hawaii.url.includes('event=hawaii-annexation')) throw new Error('Hawaii annexation event did not drive the 1898 map frame/share state.');
if (loaded.scrollWidth > loaded.innerWidth || hawaii.scrollWidth > hawaii.innerWidth) throw new Error('Horizontal overflow in deeper United States sequence.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

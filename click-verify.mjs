import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors=[]; page.on('console', msg=>{ if(msg.type()==='error') errors.push(msg.text()) }); page.on('pageerror', e=>errors.push(e.message));
await page.setViewport({ width: 1365, height: 900 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.event-rail button')).find((b) => b.textContent?.includes('Battle of Actium'))?.click());
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: '/workspace/agent/history-borders-event-detail.png', fullPage: true });
const data = await page.evaluate(() => ({
  inspector: document.querySelector('.inspector')?.textContent,
  active: document.querySelector('.event-rail button.active')?.textContent,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));
console.log(JSON.stringify({data, errors}, null, 2));
await browser.close();

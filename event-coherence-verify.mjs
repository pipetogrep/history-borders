import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
const failures = [];
const trackCount = await page.$$eval('.empire-tabs button', buttons => buttons.length);
for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
  await page.evaluate((index) => document.querySelectorAll('.empire-tabs button')[index].click(), trackIndex);
  await new Promise(resolve => setTimeout(resolve, 250));
  const eventCount = await page.$$eval('.event-rail button', buttons => buttons.length);
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex += 1) {
    const expected = await page.evaluate((index) => {
      const button = document.querySelectorAll('.event-rail button')[index];
      button.scrollIntoView({ block: 'nearest', inline: 'center' });
      const title = Array.from(button.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent?.trim()).join(' ').trim();
      button.click();
      return title;
    }, eventIndex);
    await new Promise(resolve => setTimeout(resolve, 350));
    const state = await page.evaluate(() => ({
      h1: document.querySelector('.timeline-head h1')?.textContent ?? '',
      inspector: document.querySelector('.inspector')?.textContent ?? '',
      activeRail: document.querySelector('.event-rail button.active')?.textContent ?? '',
      activeMarkers: document.querySelectorAll('.event-marker.active').length,
      activeCard: document.querySelector('.active-event-card')?.textContent ?? '',
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    if (!state.inspector.includes(expected)) failures.push(`${state.h1}: inspector missing ${expected}`);
    if (!state.activeRail.includes(expected)) failures.push(`${state.h1}: event rail not active for ${expected}`);
    if (state.activeMarkers !== 1) failures.push(`${state.h1}: expected one active map marker for ${expected}, got ${state.activeMarkers}`);
    if (!state.activeCard.includes(expected)) failures.push(`${state.h1}: snapshot card missing active event ${expected}`);
    if (state.scrollWidth > state.innerWidth) failures.push(`${state.h1}: horizontal overflow after ${expected}`);
  }
}
await page.screenshot({ path: '/workspace/agent/history-borders-event-coherence.png', fullPage: true });
console.log(JSON.stringify({ failures, errors }, null, 2));
await browser.close();
if (errors.length || failures.length) throw new Error([...errors, ...failures].join('\n'));

import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173/?track=united-states&year=1898&event=hawaii-annexation', { waitUntil: 'networkidle0' });
const data = await page.evaluate(() => {
  const active = document.querySelector('.chronology-event.active');
  const playhead = document.querySelector('.timeline-playhead');
  const band = document.querySelector('.chronology-band');
  const activeRect = active?.getBoundingClientRect();
  const playheadRect = playhead?.getBoundingClientRect();
  const bandRect = band?.getBoundingClientRect();
  const nearVisible = [...document.querySelectorAll('.chronology-event.near strong')].filter((item) => Number(getComputedStyle(item).opacity) > 0.5).length;
  const distantVisible = [...document.querySelectorAll('.chronology-event.distant strong')].filter((item) => Number(getComputedStyle(item).opacity) > 0.5).length;
  return {
    h1: document.querySelector('.timeline-head h1')?.textContent,
    playheadText: playhead?.textContent,
    playheadExists: Boolean(playhead),
    activeClasses: active?.className,
    activeText: active?.textContent,
    nearVisible,
    distantVisible,
    alignment: activeRect && playheadRect ? Math.abs((activeRect.left + activeRect.width / 2) - (playheadRect.left + playheadRect.width / 2)) : null,
    playheadInsideBand: Boolean(playheadRect && bandRect && playheadRect.left >= bandRect.left && playheadRect.right <= bandRect.right),
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
});
await page.screenshot({ path: '/workspace/agent/history-borders-timeline-focus.png', fullPage: true });
console.log(JSON.stringify({ data, errors }, null, 2));
if (!data.h1?.includes('Hawaii annexation')) throw new Error('Expected dense United States timeline route to load.');
if (!data.playheadExists || !data.playheadText?.includes('1898 CE')) throw new Error('Timeline playhead missing selected year.');
if (!data.activeClasses?.includes('focus') || !data.activeText?.includes('Hawaii annexed')) throw new Error('Active event is not marked as focused.');
if (data.alignment === null || data.alignment > 2) throw new Error('Timeline playhead is not aligned with the active event marker.');
if (!data.playheadInsideBand) throw new Error('Timeline playhead escapes the chronology band.');
if (data.nearVisible < 1) throw new Error('Adjacent context beats are not visible.');
if (data.distantVisible > 0) throw new Error('Distant dense-event labels should remain quiet until hover/focus.');
if (data.scrollWidth > data.innerWidth) throw new Error('Timeline focus refinement introduced horizontal overflow.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

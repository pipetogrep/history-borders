import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
await page.setViewport({ width: 1365, height: 1200, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
await page.evaluate(() => Array.from(document.querySelectorAll('.empire-tabs button')).find((button) => button.textContent?.includes('Bosnia'))?.click());
await new Promise(resolve => setTimeout(resolve, 300));
const desktop = await page.evaluate(() => {
  const editorial = document.querySelector('.editorial-page');
  const masthead = document.querySelector('.newspaper-masthead');
  const lead = document.querySelector('.lead-story');
  const inspector = document.querySelector('.side-story');
  const method = document.querySelector('.newspaper-method');
  const leadStyle = lead ? getComputedStyle(lead) : null;
  const inspectorStyle = inspector ? getComputedStyle(inspector) : null;
  return {
    masthead: masthead?.textContent,
    lead: lead?.textContent,
    inspector: inspector?.textContent,
    method: method?.textContent,
    leadRadius: leadStyle?.borderRadius,
    leadShadow: leadStyle?.boxShadow,
    inspectorRadius: inspectorStyle?.borderRadius,
    inspectorShadow: inspectorStyle?.boxShadow,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    top: editorial?.getBoundingClientRect().top,
  };
});
await page.screenshot({ path: '/workspace/agent/history-borders-editorial.png', fullPage: true });
await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
await new Promise(resolve => setTimeout(resolve, 250));
const mobile = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  masthead: document.querySelector('.newspaper-masthead')?.textContent,
  leadTop: document.querySelector('.lead-story')?.getBoundingClientRect().top,
  inspectorTop: document.querySelector('.side-story')?.getBoundingClientRect().top,
}));
console.log(JSON.stringify({ desktop, mobile, errors }, null, 2));
if (!desktop.masthead?.includes('The border record') || !desktop.masthead?.includes('Bosnia / Yugoslavia')) throw new Error('Editorial masthead missing selected track context.');
if (!desktop.lead?.includes('Interpretation') || !desktop.method?.includes('Sketch map first')) throw new Error('Editorial explainer/methodology content missing.');
if (desktop.leadRadius !== '0px' || desktop.inspectorRadius !== '0px') throw new Error('Below-map explainer still has rounded card treatment.');
if (desktop.leadShadow !== 'none' || desktop.inspectorShadow !== 'none') throw new Error('Below-map explainer still has card shadows.');
if (desktop.scrollWidth > desktop.innerWidth || mobile.scrollWidth > mobile.innerWidth) throw new Error('Editorial layout has horizontal overflow.');
if ((mobile.inspectorTop ?? 0) <= (mobile.leadTop ?? 0)) throw new Error('Mobile editorial ordering is not lead story before selected detail.');
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
await browser.close();

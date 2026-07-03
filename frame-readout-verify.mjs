import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })

await page.setViewport({ width: 1365, height: 920, deviceScaleFactor: 1 })
await page.goto('http://127.0.0.1:5173/?track=united-states&year=1819&event=adams-onis', { waitUntil: 'networkidle0' })
const desktop = await page.evaluate(() => {
  const readout = document.querySelector('.frame-readout')
  const readoutRect = readout?.getBoundingClientRect()
  const legendRect = document.querySelector('.map-legend')?.getBoundingClientRect()
  const timelineRect = document.querySelector('.timeline-shell')?.getBoundingClientRect()
  const meter = document.querySelector('.frame-meter span')
  const previousOutline = document.querySelector('.previous-frame-outline')
  const eventThread = document.querySelector('.event-thread')
  const previousLegend = [...document.querySelectorAll('.map-legend div')].some((item) => item.textContent?.includes('previous frame'))
  const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
  return {
    text: readout?.textContent ?? '',
    readout: readoutRect ? { left: readoutRect.left, right: readoutRect.right, top: readoutRect.top, bottom: readoutRect.bottom } : null,
    overlapsLegend: overlaps(readoutRect, legendRect),
    overlapsTimeline: overlaps(readoutRect, timelineRect),
    meterWidth: meter ? getComputedStyle(meter).width : '',
    previousOutline: Boolean(previousOutline),
    eventThread: Boolean(eventThread),
    previousLegend,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }
})

await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 })
await page.goto('http://127.0.0.1:5173/?track=russia-ukraine&year=2026&event=july-2026', { waitUntil: 'networkidle0' })
const mobile = await page.evaluate(() => ({
  text: document.querySelector('.frame-readout')?.textContent ?? '',
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}))

console.log(JSON.stringify({ desktop, mobile, errors }, null, 2))
if (!desktop.text.includes('Adams–Onís Treaty')) throw new Error('Desktop frame readout did not show selected event title')
if (!desktop.text.includes('1819 CE')) throw new Error('Desktop frame readout did not show selected year')
if (!desktop.previousOutline || !desktop.previousLegend) throw new Error('Previous-frame comparison outline or legend is missing')
if (!desktop.eventThread) throw new Error('Projected event sequence thread is missing')
if (desktop.overlapsLegend || desktop.overlapsTimeline) throw new Error('Frame readout overlaps critical globe furniture')
if (desktop.scrollWidth > desktop.innerWidth) throw new Error('Desktop frame readout introduced horizontal overflow')
if (!mobile.text.includes('Assessed control, July 2026')) throw new Error('Mobile frame readout did not update to selected event')
if (mobile.scrollWidth > mobile.innerWidth) throw new Error('Mobile frame readout introduced horizontal overflow')
if (errors.length > 0) throw new Error(`Browser errors: ${errors.join('\n')}`)
await browser.close()

import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const W = Number(process.argv[3] ?? 1280)
const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(90000)
await page.setViewport({ width: W, height: 900 })
await page.evaluateOnNewDocument(() => localStorage.setItem('devtrack_lang', 'uz'))
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE.ERROR', m.text().slice(0, 200)) })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
for (let step = 0; step < 5; step++) {
  await page.evaluate(() => document.getElementById('tour').scrollIntoView())
  await sleep(600)
  await page.click(`#tour-tab-${step}`)
  // clicking counts as hover: the tour is paused, so the scene plays exactly once
  const panel = await page.$('#tour')
  for (const [label, ms] of [['a', 1500], ['b', 2200], ['c', 3200]]) {
    await sleep(ms)
    await panel.screenshot({ path: `${OUT}/tour_${W}_${step + 1}${label}.png` })
  }
}
await browser.close()
console.log('ok')

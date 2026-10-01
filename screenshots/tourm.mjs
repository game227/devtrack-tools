import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(90000)
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.evaluateOnNewDocument(() => localStorage.setItem('devtrack_lang', 'uz'))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
console.log('scrollW', await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]))
for (const step of [1, 2, 4]) {
  await page.evaluate(() => document.getElementById('tour').scrollIntoView())
  await sleep(500)
  await page.tap(`#tour-tab-${step}`)
  await sleep(step === 1 ? 6300 : 5200)
  await (await page.$('#tour')).screenshot({ path: `${OUT}/tourm_${step + 1}.png` })
}
console.log('scrollW after', await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]))
await browser.close()

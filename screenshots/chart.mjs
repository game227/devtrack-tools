import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(90000)
await page.setViewport({ width: 1100, height: 900 })
await page.evaluateOnNewDocument(() => { localStorage.setItem('devtrack_lang', 'uz'); localStorage.setItem('devtrack_workspace', '6') })
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
await page.type('input[autocomplete="username"]', 'jane.dev')
await page.type('input[autocomplete="current-password"]', 'demo1234')
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('button[type="submit"]')])
await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))
const info = await page.evaluate(() => {
  const chart = document.querySelector('.group.relative')?.parentElement
  if (!chart) return 'no chart'
  chart.scrollIntoView({ block: 'center' })
  const r = chart.getBoundingClientRect()
  const bars = [...chart.children].map((c) => { const b = c.firstElementChild.getBoundingClientRect(); const cs = getComputedStyle(c.firstElementChild); return { h: Math.round(b.height), w: Math.round(b.width), bg: cs.backgroundColor, style: c.firstElementChild.getAttribute('style') } })
  return { chart: { w: Math.round(r.width), h: Math.round(r.height) }, bars: bars.slice(0, 5), n: bars.length }
})
console.log(JSON.stringify(info))
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: `${OUT}/chart.png` })
await browser.close()

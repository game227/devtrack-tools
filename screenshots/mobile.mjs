import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const routes = process.argv.slice(3)
const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(90000)
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
await page.evaluateOnNewDocument((theme) => { localStorage.setItem('devtrack_lang', 'uz'); localStorage.setItem('devtrack_workspace', '6'); if (theme) localStorage.setItem('devtrack_theme', theme) }, process.env.THEME ?? '')
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
await page.type('input[autocomplete="username"]', 'jane.dev')
await page.type('input[autocomplete="current-password"]', 'demo1234')
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('button[type="submit"]')])
for (const route of routes) {
  await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 500))
  const over = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const offenders = []
    for (const el of document.querySelectorAll('main *')) {
      const r = el.getBoundingClientRect()
      if (r.right > vw + 1 && r.width > 0) offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0,3).join('.')} right=${Math.round(r.right)}`)
    }
    return { scrollW: document.documentElement.scrollWidth, vw, offenders: offenders.slice(0, 6) }
  })
  console.log(route, JSON.stringify(over))
  await page.screenshot({ path: `${OUT}/m_${route.replace(/[^a-z0-9]+/gi, '_')}.png`, fullPage: true })
}
await browser.close()

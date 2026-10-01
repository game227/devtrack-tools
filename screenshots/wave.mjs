import puppeteer from 'puppeteer-core'
const [OUT, target] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1100, height: 700 })
await page.evaluateOnNewDocument((t) => { localStorage.setItem('devtrack_lang', 'uz'); localStorage.setItem('devtrack_workspace', '6'); localStorage.setItem('devtrack_theme', t === 'light' ? 'dark' : 'light') }, target)
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
await page.type('input[autocomplete="username"]', 'jane.dev')
await page.type('input[autocomplete="current-password"]', 'demo1234')
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('button[type="submit"]')])
await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' })
console.log('startViewTransition supported:', await page.evaluate(() => typeof document.startViewTransition))
const label = target === 'light' ? 'Light' : 'Dark'
await page.evaluate((name) => document.querySelector(`button[aria-label="${name}"]`)?.click(), target === 'light' ? "Yorug'" : "Qorong'i")
// Freeze the wave at chosen moments instead of racing the clock.
await page.waitForFunction(() => document.getAnimations().some((a) => a.effect?.pseudoElement === '::view-transition-new(root)'), { timeout: 5000 })
for (const frac of [0.15, 0.35, 0.55, 0.75, 0.92]) {
  await page.evaluate((f) => {
    const a = document.getAnimations().find((x) => x.effect?.pseudoElement === '::view-transition-new(root)')
    a.pause(); a.currentTime = f * a.effect.getTiming().duration
  }, frac)
  await new Promise((r) => setTimeout(r, 150))
  await page.screenshot({ path: `${OUT}/wave_${target}_${Math.round(frac * 100)}.png` })
  console.log('frame', frac)
}
await browser.close()

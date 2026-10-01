// usage: WS=<workspaceId> BASE=http://localhost:5173 node shot.mjs <outDir> <lang> <width> <height> route[::name] ...
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const [outDir, lang, width, height, ...targets] = process.argv.slice(2)
fs.mkdirSync(outDir, { recursive: true })
const BASE = process.env.BASE ?? 'http://localhost:5173'

const browser = await puppeteer.launch({
  executablePath: '/snap/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()
page.setDefaultNavigationTimeout(90000)
await page.setViewport({ width: Number(width), height: Number(height), deviceScaleFactor: Number(process.env.DPR ?? 1) })
await page.evaluateOnNewDocument((l, ws, theme) => {
  try {
    localStorage.setItem('devtrack_lang', l)
    if (ws) localStorage.setItem('devtrack_workspace', ws)
    if (theme) localStorage.setItem('devtrack_theme', theme)
  } catch {}
}, lang, process.env.WS ?? '', process.env.THEME ?? '')
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE.ERROR', m.text().slice(0, 200)) })

async function login() {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.type('input[autocomplete="username"]', 'jane.dev')
  await page.type('input[autocomplete="current-password"]', 'demo1234')
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('button[type="submit"]')])
}

const PUBLIC = /^(\/|\/login|\/register|\/forgot-password)(::|$)/
if (targets.some((t) => !PUBLIC.test(t))) await login()

for (const target of targets) {
  const [route, name] = target.split('::')
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0' })
  if (process.env.FULL === '1') {
    // scroll through the page so lazy-loaded images are fetched before the capture
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo(0, 0) })
    await new Promise((r) => setTimeout(r, 800))
  }
  await new Promise((r) => setTimeout(r, 500))
  const file = `${outDir}/${name ?? route.replace(/[^a-z0-9]+/gi, '_')}.png`
  await page.screenshot({ path: file, fullPage: process.env.FULL === '1' })
  console.log('saved', file)
}
await browser.close()

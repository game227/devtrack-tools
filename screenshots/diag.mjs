import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox','--disable-gpu'] })
const p = await b.newPage(); p.setDefaultNavigationTimeout(90000)
const counts = {}
p.on('request', (r) => { const u = r.url().replace(/\?.*/, ''); counts[u] = (counts[u] ?? 0) + 1 })
p.on('requestfailed', (r) => console.log('FAILED', r.url().slice(0, 120), r.failure()?.errorText))
await p.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
await p.type('input[autocomplete="username"]', 'jane.dev'); await p.type('input[autocomplete="current-password"]', 'demo1234')
await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0' }), p.click('button[type="submit"]')])
for (const k of Object.keys(counts)) delete counts[k]
await p.goto('http://localhost:5173/settings', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 3000))
console.log(Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6))
await b.close()

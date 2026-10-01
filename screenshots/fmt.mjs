import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox','--disable-gpu'] })
const p = await b.newPage()
const out = await p.evaluate(() => {
  const d = new Date('2026-09-21T12:14:00Z')
  const o = {}
  for (const l of ['uz-UZ','uz','uz-Latn','en-US']) {
    o[l] = [
      d.toLocaleDateString(l, { dateStyle: 'medium' }),
      d.toLocaleDateString(l, { day: 'numeric', month: 'short', year: 'numeric' }),
      d.toLocaleDateString(l, { day: 'numeric', month: 'long', year: 'numeric' }),
      d.toLocaleString(l, { dateStyle: 'medium', timeStyle: 'short' }),
      d.toLocaleTimeString(l, { timeStyle: 'short' }),
    ]
  }
  return o
})
console.log(JSON.stringify(out, null, 1))
await b.close()

const pptxgen = require('pptxgenjs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const sharp = require('sharp')
const fi = require('react-icons/fi')

const SHOTS = process.env.SHOTS || `${process.env.HOME}/devtrack-frontend/public/screens`
const COUNTS = { backend: process.env.T_BACKEND || '—', bot: process.env.T_BOT || '9', frontend: process.env.T_FRONT || '57' }

// Black & Violet — the platform's own palette
const C = {
  bg: '000000', card: '0D0D10', line: '292D30', fg: 'FFFFFF', muted: 'A1A4A5',
  violet: '9281F7', violetSoft: 'BAA7FF', green: '3AD389', amber: 'FFCA16', blue: '70B8FF',
}
const FONT = 'Arial'

async function icon(Comp, color = '#FFFFFF', size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color, size: String(size) }))
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + png.toString('base64')
}

function base(pres, title, notes) {
  const slide = pres.addSlide()
  slide.background = { color: C.bg }
  if (title) {
    slide.addText(title, { x: 0.6, y: 0.4, w: 8.8, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: C.fg, margin: 0, isTextBox: true })
  }
  if (notes) slide.addNotes(notes)
  return slide
}

function bullets(slide, items, opts) {
  slide.addText(
    items.map((text, i) => ({ text, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: 10 } })),
    { fontFace: FONT, fontSize: 14, color: C.muted, valign: 'top', margin: 0, isTextBox: true, ...opts },
  )
}

function shot(slide, lang, name, x, y, w) {
  const h = (w * 900) / 1440
  slide.addShape('rect', { x: x - 0.02, y: y - 0.02, w: w + 0.04, h: h + 0.04, fill: { color: C.bg }, line: { color: C.line, width: 1 } })
  slide.addImage({ path: `${SHOTS}/${lang}/${name}.png`, x, y, w, h })
  return h
}

function pill(slide, text, x, y, w, color = C.violet) {
  slide.addShape('roundRect', { x, y, w, h: 0.3, rectRadius: 0.08, fill: { color: C.bg }, line: { color, width: 1 } })
  slide.addText(text, { x, y, w, h: 0.3, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 10, color, margin: 0, isTextBox: true })
}

async function main() {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9' // 10 x 5.625
  pres.title = 'DevTrack — platforma taqdimoti'
  pres.author = 'DevTrack'

  const ic = {
    board: await icon(fi.FiColumns, '#BAA7FF'), heart: await icon(fi.FiHeart, '#BAA7FF'),
    github: await icon(fi.FiGithub, '#BAA7FF'), clock: await icon(fi.FiClock, '#BAA7FF'),
    chart: await icon(fi.FiBarChart2, '#BAA7FF'), users: await icon(fi.FiUsers, '#BAA7FF'),
    shield: await icon(fi.FiShield, '#BAA7FF'), send: await icon(fi.FiSend, '#BAA7FF'),
    link: await icon(fi.FiLink, '#BAA7FF'), merge: await icon(fi.FiGitMerge, '#BAA7FF'),
    key: await icon(fi.FiKey, '#BAA7FF'), globe: await icon(fi.FiGlobe, '#BAA7FF'),
    check: await icon(fi.FiCheck, '#3AD389'), alert: await icon(fi.FiAlertCircle, '#FFCA16'),
    x: await icon(fi.FiX, '#FF9592'), zap: await icon(fi.FiZap, '#BAA7FF'),
  }

  // 1 — title
  {
    const s = base(pres, null, "DevTrack — dasturchilar uchun loyiha boshqaruv platformasi. Qisqacha: nima, kimga va qanday ishlaydi.")
    s.addText('DevTrack', { x: 0.6, y: 1.5, w: 4.6, h: 0.9, fontFace: FONT, fontSize: 48, bold: true, color: C.fg, margin: 0, isTextBox: true })
    s.addText("Dasturchilar uchun loyiha boshqaruv platformasi", { x: 0.6, y: 2.45, w: 4.3, h: 0.8, fontFace: FONT, fontSize: 18, color: C.violetSoft, margin: 0, valign: 'top', isTextBox: true })
    s.addText("Ishni boshqaring. Ishlab chiqishni tushuning.", { x: 0.6, y: 3.4, w: 4.3, h: 0.6, fontFace: FONT, fontSize: 13, color: C.muted, margin: 0, valign: 'top', isTextBox: true })
    pill(s, "O'zbekcha va English", 0.6, 4.35, 1.75)
    pill(s, 'GitHub bilan bog\'langan', 2.5, 4.35, 1.9)
    shot(s, 'uz', 'dashboard', 5.25, 1.35, 4.35)
  }

  // 2 — why
  {
    const s = base(pres, 'Nega DevTrack?', "Muammo: vazifalar va kod alohida yashaydi. Yechim: ikkalasini bitta hikoyaga birlashtirish, o'zbek tilida.")
    const cols = [
      { x: 0.6, head: 'Muammo', icon: ic.x, items: ["Vazifalar bir joyda, kod boshqa joyda", "Loyiha holati haqida aniq ma'lumot yo'q", "Ko'p vositalar faqat ingliz tilida va murakkab"] },
      { x: 5.2, head: 'Yechim', icon: ic.check, items: ["Vazifa, commit va pull request — bitta hikoyada", "Shaffof salomatlik bali va xavflar ro'yxati", "Toza, tez interfeys — o'zbek va ingliz tilida"] },
    ]
    for (const col of cols) {
      s.addShape('roundRect', { x: col.x, y: 1.35, w: 4.2, h: 3.4, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
      s.addImage({ data: col.icon, x: col.x + 0.3, y: 1.65, w: 0.35, h: 0.35 })
      s.addText(col.head, { x: col.x + 0.8, y: 1.62, w: 3, h: 0.4, fontFace: FONT, fontSize: 20, bold: true, color: C.fg, margin: 0, valign: 'middle', isTextBox: true })
      bullets(s, col.items, { x: col.x + 0.3, y: 2.3, w: 3.6, h: 2.2, fontSize: 15 })
    }
  }

  // 3 — features grid
  {
    const s = base(pres, 'Asosiy imkoniyatlar', "Oltita asosiy imkoniyat. Har biri keyingi slaydlarda ekran bilan ko'rsatiladi.")
    const items = [
      [ic.board, 'Kanban doska', "5 ustun, sudrab o'tkazish, ijrochi va ustuvorlik"],
      [ic.heart, 'Loyiha salomatligi', 'Ball 0–100 va xavflar tushuntirilgan'],
      [ic.github, 'GitHub integratsiyasi', "OAuth, webhook, #id orqali bog'lash"],
      [ic.clock, 'Xronologiya', "Kunlar bo'yicha guruhlangan faollik"],
      [ic.chart, 'Tahlil', "Holat, ustuvorlik, tur va yuklama"],
      [ic.users, 'Jamoalar va rejalash', 'Ish maydonlari, jamoalar, sikllar, bosqichlar'],
    ]
    items.forEach(([img, head, text], i) => {
      const x = 0.6 + (i % 3) * 3.0, y = 1.4 + Math.floor(i / 3) * 1.75
      s.addShape('roundRect', { x, y, w: 2.8, h: 1.55, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
      s.addImage({ data: img, x: x + 0.22, y: y + 0.2, w: 0.34, h: 0.34 })
      s.addText(head, { x: x + 0.22, y: y + 0.65, w: 2.4, h: 0.3, fontFace: FONT, fontSize: 14, bold: true, color: C.fg, margin: 0, isTextBox: true })
      s.addText(text, { x: x + 0.22, y: y + 0.95, w: 2.4, h: 0.5, fontFace: FONT, fontSize: 11, color: C.muted, margin: 0, valign: 'top', isTextBox: true })
    })
  }

  // 4–8 — screenshot slides
  const shotSlides = [
    { title: 'Boshqaruv paneli', img: 'dashboard', notes: "Panel: umumiy ko'rsatkichlar, mening vazifalarim, yaqin muddatlar, loyihalar bajarilishi va so'nggi faollik.",
      points: ["Loyihalar va vazifalar bo'yicha umumiy ko'rsatkichlar", "Mening ochiq vazifalarim va yaqin muddatlar", "Loyihalar bajarilishi va so'nggi faollik"] },
    { title: 'Kanban doska', img: 'board', notes: "Doska: Zaxira dan Bajarildi gacha besh ustun. Kartani sudrab o'tkazish; sensorli ekranda holat menyusi.",
      points: ["Zaxiradan «Bajarildi»gacha 5 ustun", "Kartada: #raqam, ijrochi, ustuvorlik, tur", "Sensorli ekranda holat menyusi bilan o'tkazish"] },
    { title: 'Vazifa va GitHub', img: 'issue', notes: "Vazifa sahifasi: xususiyatlar paneli, bog'langan pull request va commitlar, izohlar.",
      points: ["Xususiyatlar: holat, ustuvorlik, ijrochi, muddat, yorliqlar", "Bog'langan pull request va commit'lar", "Izohlar va @eslatmalar"] },
    { title: 'Salomatlik va tahlil', img: 'analytics', notes: "Salomatlik bali to'rt omildan hisoblanadi va xavflar matn bilan yoziladi.",
      points: ["Ball to'rt omildan: bajarilish, faollik, muddatlar, xatolar ulushi", "Xavflar aniq yoziladi: muddati o'tgan, uzoq turgan, shoshilinch xatolar", "Holat, ustuvorlik va ijrochilar bo'yicha diagrammalar"] },
    { title: 'Faollik xronologiyasi', img: 'timeline', notes: "Xronologiya kunlar bo'yicha guruhlanadi; birlashtirilgan PR bir marta qayd etiladi.",
      points: ["Har bir o'tkazish, izoh va birlashtirish", "Kunlar bo'yicha guruhlangan, «Yana yuklash» tugmasi bilan", "PR birlashtirilsa — voqea bir marta qayd etiladi"] },
  ]
  for (const item of shotSlides) {
    const s = base(pres, item.title, item.notes)
    bullets(s, item.points, { x: 0.6, y: 1.5, w: 3.0, h: 3.4, fontSize: 14 })
    shot(s, 'uz', item.img, 3.95, 1.4, 5.65)
  }

  // 9 — GitHub flow
  {
    const s = base(pres, 'GitHub bilan ishlash jarayoni', "Besh qadam: ulash, repozitoriy tanlash, commit/PR da #id yozish, bog'lanish, PR birlashtirilsa vazifa yopiladi.")
    const steps = [
      [ic.github, "GitHub'ni ulash", 'OAuth orqali, bir marta'],
      [ic.link, 'Repozitoriyni tanlash', 'Webhook avtomatik yaratiladi'],
      [ic.zap, "#42 deb yozish", "Commit yoki pull request'da"],
      [ic.merge, "Bog'lanish", "Vazifada PR va commit ko'rinadi"],
      [ic.check, 'Bajarildi', "PR birlashtirilsa vazifa yopiladi"],
    ]
    steps.forEach(([img, head, text], i) => {
      const x = 0.6 + i * 1.8
      s.addShape('roundRect', { x, y: 1.7, w: 1.6, h: 2.2, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
      s.addText(String(i + 1), { x: x + 0.15, y: 1.8, w: 0.5, h: 0.3, fontFace: 'Courier New', fontSize: 12, color: C.violet, margin: 0, isTextBox: true })
      s.addImage({ data: img, x: x + 0.15, y: 2.2, w: 0.36, h: 0.36 })
      s.addText(head, { x: x + 0.15, y: 2.7, w: 1.35, h: 0.45, fontFace: FONT, fontSize: 12, bold: true, color: C.fg, margin: 0, valign: 'top', isTextBox: true })
      s.addText(text, { x: x + 0.15, y: 3.15, w: 1.35, h: 0.65, fontFace: FONT, fontSize: 10, color: C.muted, margin: 0, valign: 'top', isTextBox: true })
    })
    s.addText("Webhook HMAC-SHA256 imzosi bilan tekshiriladi; GitHub tokenlari shifrlangan holda saqlanadi.", { x: 0.6, y: 4.35, w: 8.8, h: 0.4, fontFace: FONT, fontSize: 12, color: C.muted, margin: 0, isTextBox: true })
  }

  // 10 — Telegram + security
  {
    const s = base(pres, 'Telegram bot va xavfsizlik', "Bot alohida servis. Parolni tiklash havolasi avval Telegramga, bo'lmasa emailga yuboriladi. Xavfsizlik: shifrlash, HMAC, JWT.")
    const cols = [
      { x: 0.6, head: 'Telegram bot', icon: ic.send, items: ["Alohida FastAPI servisi, o'z repozitoriysi", "Parolni tiklash havolasi Telegramga, bo'lmasa emailga", "Servislar orasida API kalit va imzolangan token"] },
      { x: 5.2, head: 'Xavfsizlik', icon: ic.shield, items: ["GitHub tokenlari Fernet bilan shifrlangan (kalit almashtirish qo'llab-quvvatlanadi)", "Webhook'lar HMAC bilan tekshiriladi", "JWT va yangilanuvchi (rotation) tokenlar", "Anonim so'rovlarga cheklov"] },
    ]
    for (const col of cols) {
      s.addShape('roundRect', { x: col.x, y: 1.35, w: 4.2, h: 3.4, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
      s.addImage({ data: col.icon, x: col.x + 0.3, y: 1.65, w: 0.35, h: 0.35 })
      s.addText(col.head, { x: col.x + 0.8, y: 1.62, w: 3, h: 0.4, fontFace: FONT, fontSize: 20, bold: true, color: C.fg, margin: 0, valign: 'middle', isTextBox: true })
      bullets(s, col.items, { x: col.x + 0.3, y: 2.3, w: 3.6, h: 2.3, fontSize: 13 })
    }
  }

  // 11 — architecture
  {
    const s = base(pres, 'Arxitektura: 3 ta mustaqil servis', "Frontend, backend va Telegram bot alohida repozitoriy va alohida servis. Tashqi: GitHub, Telegram, Resend.")
    const box = (x, y, w, head, sub, accent = C.violet) => {
      s.addShape('roundRect', { x, y, w, h: 1.25, rectRadius: 0.1, fill: { color: C.card }, line: { color: accent, width: 1.25 } })
      s.addText(head, { x: x + 0.15, y: y + 0.15, w: w - 0.3, h: 0.35, fontFace: FONT, fontSize: 15, bold: true, color: C.fg, margin: 0, isTextBox: true })
      s.addText(sub, { x: x + 0.15, y: y + 0.55, w: w - 0.3, h: 0.6, fontFace: FONT, fontSize: 11, color: C.muted, margin: 0, valign: 'top', isTextBox: true })
    }
    const ext = (x, y, w, text) => {
      s.addShape('roundRect', { x, y, w, h: 0.5, rectRadius: 0.08, fill: { color: C.bg }, line: { color: C.line, width: 1, dashType: 'dash' } })
      s.addText(text, { x, y, w, h: 0.5, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 11, color: C.muted, margin: 0, isTextBox: true })
    }
    box(0.6, 1.5, 2.5, 'Frontend', 'React 19, Vite, TypeScript, Tailwind. Uzbek/English')
    box(3.75, 1.5, 2.5, 'Backend', 'Django 6 + DRF, PostgreSQL, JWT, WhiteNoise')
    box(6.9, 1.5, 2.5, 'Telegram bot', 'FastAPI, SQLite. Alohida servis')
    s.addShape('line', { x: 3.1, y: 2.12, w: 0.65, h: 0, line: { color: C.violetSoft, width: 1.5, endArrowType: 'triangle', beginArrowType: 'triangle' } })
    s.addShape('line', { x: 6.25, y: 2.12, w: 0.65, h: 0, line: { color: C.violetSoft, width: 1.5, endArrowType: 'triangle', beginArrowType: 'triangle' } })
    ext(3.75, 3.5, 2.5, "GitHub: OAuth va webhook")
    ext(0.6, 3.5, 2.5, "Email: Resend (zaxira kanal)")
    ext(6.9, 3.5, 2.5, "Telegram Bot API")
    s.addShape('line', { x: 5.0, y: 2.75, w: 0, h: 0.75, line: { color: C.line, width: 1.25, endArrowType: 'triangle', beginArrowType: 'triangle' } })
    s.addShape('line', { x: 1.85, y: 2.75, w: 2.35, h: 0.75, flipH: true, line: { color: C.line, width: 1.25, endArrowType: 'triangle' } })
    s.addShape('line', { x: 8.15, y: 2.75, w: 0, h: 0.75, line: { color: C.line, width: 1.25, endArrowType: 'triangle', beginArrowType: 'triangle' } })
    s.addText("Har bir servis mustaqil joylanadi va o'z testlariga ega.", { x: 0.6, y: 4.5, w: 8.8, h: 0.4, fontFace: FONT, fontSize: 12, color: C.muted, margin: 0, isTextBox: true })
  }

  // 12 — bilingual
  {
    const s = base(pres, "Ikki tilda: o'zbek va ingliz", "Til almashtirgich har sahifada. Sanalar, xatolar va bildirishnomalar ham tarjima qilingan.")
    shot(s, 'uz', 'board', 0.6, 1.35, 4.25)
    shot(s, 'en', 'board', 5.15, 1.35, 4.25)
    s.addText("O'zbekcha (standart)", { x: 0.6, y: 4.1, w: 4.25, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: C.violetSoft, margin: 0, isTextBox: true })
    s.addText('English', { x: 5.15, y: 4.1, w: 4.25, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: C.violetSoft, margin: 0, isTextBox: true })
    s.addText("UZ/EN tugmasi har sahifada. Sanalar, xato xabarlari va bildirishnomalar ham tanlangan tilda.", { x: 0.6, y: 4.6, w: 8.8, h: 0.5, fontFace: FONT, fontSize: 13, color: C.muted, margin: 0, valign: 'top', isTextBox: true })
  }

  // 13 — status
  {
    const s = base(pres, "Holat va keyingi qadamlar", "Uchta repozitoriy va avtomatik testlar. Deploy va domen keyingi bosqichda.")
    const stats = [[COUNTS.backend, 'backend testlari'], [COUNTS.bot, 'bot testlari'], [COUNTS.frontend, 'frontend testlari']]
    stats.forEach(([n, label], i) => {
      const x = 0.6 + i * 1.55
      s.addShape('roundRect', { x, y: 1.4, w: 1.4, h: 1.3, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
      s.addText(String(n), { x, y: 1.5, w: 1.4, h: 0.65, align: 'center', fontFace: FONT, fontSize: 32, bold: true, color: C.fg, margin: 0, isTextBox: true })
      s.addText(label, { x, y: 2.2, w: 1.4, h: 0.4, align: 'center', fontFace: FONT, fontSize: 10, color: C.muted, margin: 0, isTextBox: true })
    })
    s.addText('Tayyor', { x: 0.6, y: 3.0, w: 4.4, h: 0.35, fontFace: FONT, fontSize: 16, bold: true, color: C.green, margin: 0, isTextBox: true })
    bullets(s, ["Vazifalar, doska, sikllar, bosqichlar, qaydlar", "GitHub integratsiyasi, salomatlik, tahlil", "Telegram bot va parolni tiklash", "Landing sahifa va ikki tilli interfeys"], { x: 0.6, y: 3.4, w: 4.4, h: 1.7, fontSize: 12 })
    s.addText('Keyingi qadamlar', { x: 5.4, y: 1.4, w: 4, h: 0.35, fontFace: FONT, fontSize: 16, bold: true, color: C.amber, margin: 0, isTextBox: true })
    bullets(s, ["Serverga joylash (Render)", "Domen va email jo'natuvchini sozlash", "GitHub webhook va Telegramni ochiq manzilda sinash", "Maxfiy kalitlarni almashtirish (loyiha oxirida)"], { x: 5.4, y: 1.85, w: 4.0, h: 2.4, fontSize: 13 })
  }

  // 14 — thanks
  {
    const s = base(pres, null, "Rahmat! Savollar uchun tayyorman.")
    s.addText('Rahmat!', { x: 0.6, y: 1.5, w: 8.8, h: 1.0, fontFace: FONT, fontSize: 54, bold: true, color: C.fg, margin: 0, isTextBox: true })
    s.addText("DevTrack — ishni boshqaring, ishlab chiqishni tushuning.", { x: 0.6, y: 2.6, w: 8.8, h: 0.5, fontFace: FONT, fontSize: 18, color: C.violetSoft, margin: 0, isTextBox: true })
    const repos = ['github.com/game227/devtrack-frontend', 'github.com/game227/devtrack-backend', 'github.com/game227/devtrack-telegram-bot']
    repos.forEach((r, i) => s.addText(r, { x: 0.6, y: 3.5 + i * 0.4, w: 6, h: 0.35, fontFace: 'Courier New', fontSize: 13, color: C.muted, margin: 0, isTextBox: true }))
  }

  await pres.writeFile({ fileName: 'DevTrack_Taqdimot.pptx' })
  console.log('written')
}
main()

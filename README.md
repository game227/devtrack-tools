# devtrack-tools

DevTrack loyihasi (backend, frontend, telegram-bot) uchun yordamchi vositalar. Repolar `~/devtrack-*` ostida turishi kutiladi.

- `run-all.sh` — backend, frontend va botni birdaniga ishga tushiradi (`--seed` demo ma'lumot yuklaydi: jane.dev / demo1234). To'xtatish: Ctrl+C.
- `screenshots/` — puppeteer-core + Chromium orqali ilova skrinshotlari. Misol: `WS=<workspace id> node shot.mjs <outDir> <lang> 1440 900 route::name`. Origin `http://localhost:5173` bo'lishi kerak (CORS).
- `presentation/` — pptxgenjs bilan 14 slaydli o'zbekcha taqdimot (`node build.js`). Natija (`.pptx`, `.pdf`, rasmlar) repoga kiritilmaydi.

Har bir papkada `npm install` kerak.

#!/usr/bin/env bash
# DevTrack: hamma xizmatni birdaniga ishga tushiradi (backend, frontend, Telegram bot).
#
#   ./run-all.sh            — hammasini ishga tushirish
#   ./run-all.sh --seed     — avval demo ma'lumotlarni ham yuklaydi (jane.dev / demo1234)
#
# To'xtatish: Ctrl+C (uchala jarayon ham to'xtaydi).
set -u

BACKEND="$HOME/devtrack-backend"
FRONTEND="$HOME/devtrack-frontend"
BOT="$HOME/devtrack-telegram-bot"
PIDS=()

cleanup() {
  echo; echo "To'xtatilmoqda…"
  for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null; done
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

fail() { echo "XATO: $1" >&2; exit 1; }

# 1. Talablar
command -v node >/dev/null || fail "Node.js o'rnatilmagan"
[ -x "$BACKEND/venv/bin/python" ] || fail "Backend venv yo'q: cd $BACKEND && python -m venv venv && venv/bin/pip install -r requirements.txt"
[ -d "$FRONTEND/node_modules" ] || { echo "Frontend paketlari o'rnatilmoqda…"; (cd "$FRONTEND" && npm install) || fail "npm install ishlamadi"; }
if command -v pg_isready >/dev/null; then
  pg_isready -q || fail "PostgreSQL ishlamayapti (sudo systemctl start postgresql)"
fi

# 2. Eski jarayonlar band qilgan portlarni bo'shatish
for port in 8000 5173 9000; do fuser -k "$port/tcp" >/dev/null 2>&1; done
sleep 1

# 3. Backend: migratsiya (+ ixtiyoriy demo ma'lumot)
echo "Backend: migratsiyalar…"
(cd "$BACKEND" && venv/bin/python manage.py migrate --noinput >/dev/null) || fail "migrate ishlamadi (.env dagi DATABASE_URL ni tekshiring)"
if [ "${1:-}" = "--seed" ]; then
  echo "Demo ma'lumotlar yuklanmoqda…"
  (cd "$BACKEND" && venv/bin/python manage.py seed_demo --reset >/dev/null) || fail "seed_demo ishlamadi"
fi

# 4. Xizmatlarni ishga tushirish
(cd "$BACKEND" && exec venv/bin/python manage.py runserver 127.0.0.1:8000 --noreload) &
PIDS+=($!)
(cd "$FRONTEND" && exec npm run dev -- --port 5173 --strictPort) &
PIDS+=($!)

# Bot: token bo'lsa long-polling rejimida (lokal uchun tunnel kerak emas)
if grep -q '^TELEGRAM_BOT_TOKEN=.\+' "$BOT/.env" 2>/dev/null && [ -x "$BOT/venv/bin/python" ]; then
  (cd "$BOT" && exec venv/bin/python poll.py) &
  PIDS+=($!)
  BOT_STATUS="ishlayapti (polling)"
else
  BOT_STATUS="o'chiq (.env da TELEGRAM_BOT_TOKEN yo'q)"
fi

# 5. Tayyor bo'lguncha kutish
for url in http://127.0.0.1:8000/api/v1/health/ http://localhost:5173/; do
  for _ in $(seq 1 40); do curl -s -o /dev/null "$url" && break; sleep 1; done
done

cat <<MSG

  ✅ DevTrack ishga tushdi

  Ilova (frontend):  http://localhost:5173
  Backend API:       http://127.0.0.1:8000/api/v1/
  Admin panel:       http://127.0.0.1:8000/admin/
  Telegram bot:      $BOT_STATUS

  Demo kirish:       jane.dev / demo1234     (agar --seed bilan yuklagan bo'lsangiz)
  To'xtatish:        Ctrl+C

MSG
wait

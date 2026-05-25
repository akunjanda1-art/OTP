# OTPGo — Multi-Channel OTP Gateway SaaS

**OTPGo** adalah platform SaaS untuk mengirim OTP (One-Time Password) via SMS, WhatsApp, Email, dan Voice. Dibangun dengan Next.js 16, Prisma, PostgreSQL, dan TypeScript.

---

## 🚀 Features

- **Multi-channel OTP**: SMS, WhatsApp, Email, Voice
- **REST API v1**: Send, Verify, Resend, Status, Balance
- **Client Dashboard**: API keys, OTP logs, wallet, orders, sandbox tester
- **Admin Panel**: Manage clients, products, orders, providers, audit logs
- **Wallet System**: Per-channel credit (SMS, WhatsApp, General)
- **Rate Limiting**: Per API key, per phone, per IP
- **Provider Abstraction**: Swap SMS/WA providers tanpa ubah core logic
- **Dummy Provider**: Built-in simulator untuk MVP/testing
- **Security**: bcrypt password, SHA-256 API keys, timing-safe OTP verify
- **Audit Trail**: Track semua admin actions

---

## 📋 Prerequisites

- **Node.js** 20+ & npm
- **PostgreSQL** 14+
- **Git**

---

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone <repo-url> otp-saas
cd otp-saas
npm install
```

### 2. Database Setup

Buat database PostgreSQL:

```bash
createdb otpgo_dev
```

Copy `.env.example` → `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/otpgo_dev"
SESSION_SECRET="generate-random-32-char-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Prisma Migration & Seed

```bash
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema ke DB (atau db:migrate untuk migration files)
npm run db:seed        # Seed admin + demo client + sample products
```

Seed akan membuat:
- **Admin**: `admin@otpgo.local` / `admin12345`
- **Demo Client**: `demo@otpgo.local` / `demo12345` (saldo 100 per channel)
- **5 sample products** (SMS Starter, SMS Pro, WA Starter, Bundle, Dedicated Number)
- **Dummy provider** (default fallback)

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📚 Usage

### Landing Page
- **Home**: Hero, Features, Live OTP Tester (demo), Pricing, Contact
- **Docs**: [/docs](http://localhost:3000/docs) — API documentation + cURL examples

### Client Dashboard (`/dashboard`)
1. **Register** → auto-create wallet (saldo 0)
2. **Orders** → beli paket kredit (pending → admin approve → saldo bertambah)
3. **API Keys** → generate token (plaintext hanya tampil sekali)
4. **Sandbox** → test `/api/v1/otp/send` & `/verify` dengan API key
5. **OTP Logs** → 100 request terakhir
6. **Wallet** → lihat saldo per channel + history transaksi
7. **Numbers** → virtual numbers yang disewa (jika ada)

### Admin Panel (`/admin`)
- **Dashboard**: Stats (klien, order pending, OTP hari ini, provider aktif)
- **Clients**: Daftar klien + toggle status (active/suspended)
- **Products**: CRUD paket kredit (SMS/WA/Bundle/Dedicated Number)
- **Orders**: Approve/reject order manual transfer → auto credit wallet
- **Providers**: Register provider (dummy/twilio/dll) per type (sms/whatsapp/multi)
- **Numbers**: Pool nomor virtual + assign ke klien
- **OTP Logs**: 200 request terakhir (semua klien)
- **Audit**: 200 admin actions terakhir

### API Integration

**Base URL**: `http://localhost:3000/api/v1`

**Headers**:
```
Authorization: Bearer otp_xxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

**Send OTP**:
```bash
curl -X POST 'http://localhost:3000/api/v1/otp/send' \
  -H 'Authorization: Bearer otp_xxx' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"6281234567890","channel":"sms","purpose":"login"}'
```

**Verify OTP**:
```bash
curl -X POST 'http://localhost:3000/api/v1/otp/verify' \
  -H 'Authorization: Bearer otp_xxx' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"6281234567890","otp":"123456","purpose":"login"}'
```

Lihat [/docs](http://localhost:3000/docs) untuk endpoint lengkap (resend, status, balance).

---

## 🧪 Testing

### Live OTP Tester (Landing Page)
- Gunakan demo endpoint `/api/demo/send` & `/api/demo/verify`
- Auto top-up 1 credit per request (IP rate limit 5/10min)
- OTP code di-log ke terminal server (cek console)

### Sandbox (Dashboard)
- Pakai API key sendiri
- Test real endpoint `/api/v1/otp/*`
- Saldo akan terpotong (1 credit per OTP)

---

## 📦 Project Structure

```
otp-saas/
├── app/
│   ├── (auth)/              # Login, Register
│   ├── dashboard/           # Client dashboard
│   ├── admin/               # Admin panel
│   ├── api/v1/              # REST API routes
│   ├── api/demo/            # Public demo endpoints
│   ├── docs/                # API documentation page
│   ├── actions/             # Server actions (auth)
│   └── layout.tsx           # Root layout (dark theme)
├── components/              # Navbar, Hero, Features, Footer, DashboardShell, dll
├── lib/
│   ├── db.ts                # Prisma client singleton
│   ├── session.ts           # JWT session (jose)
│   ├── dal.ts               # Data Access Layer (verifySession, requireAdmin, requireClient)
│   ├── otp.ts               # Generate/hash/verify OTP (SHA-256 + salt)
│   ├── otp-service.ts       # Core OTP logic (send/verify/resend/status)
│   ├── wallet.ts            # Wallet service (moveBalance, ensureWallet, hasSufficientBalance)
│   ├── api-key.ts           # Generate/hash/resolve API keys
│   ├── api-auth.ts          # API authentication middleware
│   ├── rate-limit.ts        # In-memory sliding window rate limiter
│   ├── phone.ts             # E.164 normalization
│   ├── audit.ts             # Audit log helper
│   ├── response.ts          # ok() / fail() JSON helpers
│   ├── errors.ts            # Error codes (PRD §9)
│   └── providers/           # Provider abstraction (dummy, interface, types)
├── prisma/
│   ├── schema.prisma        # 14 models + enums (PRD §10)
│   └── seed.ts              # Seed admin + demo + products
├── proxy.ts                 # Next.js 16 middleware (auth guard, role gate)
├── .env.example             # Environment variables template
├── package.json             # Scripts: dev, build, db:*, lint
└── README.md                # This file
```

---

## 🔐 Security

- **Passwords**: bcrypt (10 rounds)
- **API Keys**: SHA-256 hash, prefix `otp_` (12 char) untuk identifikasi
- **OTP Hash**: SHA-256 + pepper (SESSION_SECRET) + salt (clientId:phone:purpose:requestId)
- **OTP Verify**: Timing-safe comparison
- **Session**: JWT (jose) via HTTP-only cookie, 7 hari expiry
- **Rate Limits**: Per API key (60/min), per phone (3/10min), per IP (demo 5/10min)
- **Middleware**: Role-based access control (admin vs client)

---

## 🌍 Environment Variables

Lihat `.env.example` untuk daftar lengkap. Key variables:

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `SESSION_SECRET` | — | JWT signing key (32+ char random) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public base URL |
| `OTP_EXPIRY_MINUTES` | `5` | OTP validity duration |
| `OTP_MAX_ATTEMPTS` | `3` | Max verify attempts |
| `OTP_RESEND_COOLDOWN_SECONDS` | `60` | Cooldown between resends |
| `DEFAULT_SMS_PRICE` | `1` | Credit per SMS OTP |
| `DEFAULT_WHATSAPP_PRICE` | `1` | Credit per WhatsApp OTP |
| `SMS_PROVIDER` | `dummy` | SMS provider name (dummy/twilio/dll) |
| `WHATSAPP_PROVIDER` | `dummy` | WhatsApp provider name |

---

## 🚢 Deployment

### Build

```bash
npm run build
npm start
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET` (32+ char)
- [ ] Use managed PostgreSQL (Azure Database, AWS RDS, Supabase, dll)
- [ ] Run `npm run db:migrate` (bukan `db:push`)
- [ ] Configure real SMS/WA providers (Twilio, Fonnte, Wablas, dll)
- [ ] Set up reverse proxy (Nginx/Caddy) + SSL
- [ ] Enable CORS jika API diakses dari domain lain
- [ ] Monitor logs & set up alerts (Sentry, Datadog, dll)
- [ ] Backup database regularly

---

## 📖 Documentation

- **PRD**: `/Users/macm4/Downloads/PRD_OTP_Gateway_Virtual_Number_Store.md` (source of truth)
- **API Docs**: [/docs](http://localhost:3000/docs)
- **Prisma Schema**: `prisma/schema.prisma` (14 models, PRD §10)
- **AGENTS.md**: `AGENTS.md` (Next.js 16 breaking changes notes)

---

## 🛠️ Development Scripts

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint

npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to DB (no migration files)
npm run db:migrate       # Create & run migration
npm run db:seed          # Run seed script
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:reset         # Reset DB + re-run migrations + seed
```

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

MIT License — lihat `LICENSE` file.

---

## 🙏 Credits

- **Next.js 16** — React framework
- **Prisma** — ORM
- **PostgreSQL** — Database
- **Tailwind CSS v4** — Styling
- **jose** — JWT
- **bcryptjs** — Password hashing
- **zod** — Schema validation
- **ulid** — Unique IDs

---

## 📧 Support

- **Email**: support@otpgo.local (ganti dengan email real)
- **Docs**: [/docs](http://localhost:3000/docs)
- **Issues**: GitHub Issues

---

**Built with ❤️ for Indonesian businesses**

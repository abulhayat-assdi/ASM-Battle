# ⚔️ Team Battle — Daily Report System

Google Forms-এর বিকল্প একটি কাস্টম সিস্টেম। দুটি ওপেন ফর্ম (Individual + Team) দিয়ে
দৈনিক রিপোর্ট সংগ্রহ করে, একটি admin panel-এ leaderboard/পরিসংখ্যান/চার্ট দেখায়,
এবং পুরো **Final Report** একটি **Word (.docx)** ফাইলে এক্সপোর্ট করে।

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **PostgreSQL** via **Prisma ORM**
- **Recharts** (চার্ট) · **docx** (Word export) · **jose** + **bcryptjs** (admin auth)

## Features

- 🧍 **Individual form** — Google Form-এর সব ১৭টি প্রশ্ন (৫ সেকশন)
- 👥 **Team form** — সব ১৮টি প্রশ্ন
- 🔓 ফর্ম **ওপেন লিংক** — submit করতে লগইন লাগে না
- 🔒 **Admin panel** — username/password + role (`SUPER_ADMIN` / `MANAGER` / `VIEWER`)
- 📊 Dashboard — team ও individual leaderboard, stat cards, bar/pie চার্ট, date range filter
- 🗂️ Submissions browser — সব রিপোর্ট দেখা ও (MANAGER+) মুছে ফেলা
- 📄 **Final Report → .docx** ডাউনলোড (leaderboard, পরিসংখ্যান, summary, objection/learning বিশ্লেষণ)

## লোকাল সেটআপ

```bash
# 1. ডিপেন্ডেন্সি
npm install

# 2. env ফাইল তৈরি করুন
cp .env.example .env      # তারপর DATABASE_URL ও AUTH_SECRET বসান

# 3. ডেটাবেস টেবিল তৈরি
npm run db:push

# 4. প্রথম admin তৈরি (.env-এর SEED_ADMIN_* থেকে)
npm run db:seed

# 5. ডেভ সার্ভার
npm run dev          # http://localhost:3000
```

- পাবলিক ফর্ম: `/report/individual`, `/report/team`
- Admin: `/admin` (লগইন: `.env`-এর `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`)

> ⚠️ প্রথম লগইনের পর seed পাসওয়ার্ড পরিবর্তন করুন।

## Environment variables

| নাম | বর্ণনা |
|-----|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | JWT সাইন করার গোপন কী (লম্বা random string) |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | প্রথম super-admin |

`AUTH_SECRET` তৈরি করতে:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## VPS-এ ডিপ্লয়

```bash
# সার্ভারে PostgreSQL চালু থাকা অবস্থায়:
npm ci
# .env-এ production DATABASE_URL + শক্তিশালী AUTH_SECRET দিন
npm run db:push          # প্রথমবার স্কিমা প্রয়োগ
npm run db:seed          # প্রথম admin
npm run build
npm run start            # পোর্ট 3000 (PORT=80 npm run start ইত্যাদি)
```

প্রোডাকশনে **pm2** বা **systemd** দিয়ে `npm run start` চালু রাখুন এবং সামনে
**Nginx** reverse proxy + HTTPS (Let's Encrypt) বসান। `secure` কুকি কাজ করার
জন্য HTTPS থাকা জরুরি।

উদাহরণ pm2:
```bash
npm i -g pm2
pm2 start "npm run start" --name team-battle
pm2 save && pm2 startup
```

## রোল (Roles)

| Role | অনুমতি |
|------|--------|
| `SUPER_ADMIN` | সব কিছু (দেখা, মুছে ফেলা, export) |
| `MANAGER` | দেখা, রিপোর্ট মুছে ফেলা, export |
| `VIEWER` | শুধু দেখা ও export (মুছতে পারে না) |

নতুন admin যোগ করতে এখন `prisma studio` (`npm run db:studio`) দিয়ে `AdminUser`
টেবিলে row যোগ করুন (password অবশ্যই bcrypt hash — `seed.mjs` রেফারেন্স দেখুন)।

## কাজের ফ্লো

```
team member  →  /report/individual  ─┐
team member  →  /report/team        ─┤→  PostgreSQL  →  /admin (dashboard, charts)
                                                          →  /admin/report  →  .docx
```

## প্রজেক্ট স্ট্রাকচার

```
prisma/schema.prisma         # DB মডেল (AdminUser, Team, IndividualReport, TeamReport)
prisma/seed.mjs              # প্রথম admin
src/lib/constants.ts         # দুই ফর্মের সব option (single source of truth)
src/lib/stats.ts             # leaderboard ও পরিসংখ্যান হিসাব
src/lib/docx-report.ts       # Word রিপোর্ট জেনারেটর
src/lib/auth.ts              # JWT সেশন + role helper
src/middleware.ts            # /admin রক্ষা
src/app/report/*             # পাবলিক ফর্ম
src/app/admin/*              # admin panel
src/app/api/*                # API routes
```

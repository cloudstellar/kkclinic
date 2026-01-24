# KKClinic - ระบบบริหารจัดการคลินิก

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Private-red)

> Web Application สำหรับบริหารจัดการคลินิกตา ครอบคลุมการลงทะเบียนผู้ป่วย การสั่งยา การจ่ายยาและคิดเงิน และการจัดการคลังยา

## 🏥 Features

### Core
- **ระบบยืนยันตัวตน** - Login/Logout พร้อม Role-based Access (Admin, Doctor, Staff)
- **จัดการผู้ป่วย** - ลงทะเบียน, ค้นหา, แก้ไขข้อมูลผู้ป่วย, ประวัติแพ้ยา
- **สั่งยา/หัตถการ** - แพทย์สร้างใบสั่งยาพร้อม Autocomplete
- **จ่ายยา & คิดเงิน** - พนักงานจ่ายยาตามใบสั่ง, ออกใบเสร็จ
- **จัดการสต๊อก** - เพิ่ม/ลดสต๊อก, ดูประวัติ

### Sprint 3 Features (Latest)
- **Smart Dosage System** - Tokenizer + Dictionary + Translation Engine
- **Doctor Fee (DF)** - ค่าธรรมเนียมแพทย์ พร้อม Note Presets
- **Medicine Summary Sheet** - ใบสรุปรายการยา (Internal Use)
- **Bilingual Labels** - ฉลากยา 2 ภาษา (Thai/English)
- **TN Format** - รหัสผู้ป่วยแบบใหม่ (TN250429)

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1.3 | React Framework (App Router) |
| [React](https://react.dev/) | 19.2.3 | UI Library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type Safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | - | UI Components |
| [Supabase](https://supabase.com/) | 2.90 | Backend (PostgreSQL + Auth) |
| [Zod](https://zod.dev/) | 4.3 | Schema Validation |
| [Vercel](https://vercel.com/) | - | Deployment |

## 📋 Prerequisites

- Node.js 20+ 
- npm or pnpm
- Supabase Account

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/cloudstellar/kkclinic.git
cd kkclinic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xlgztefpllpurbowibvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> 💡 สามารถหา Supabase keys ได้ที่ [Supabase Dashboard](https://supabase.com/dashboard/project/xlgztefpllpurbowibvz/settings/api)

### 4. Run Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kkclinic.com | Admin123! |
| Doctor | doctor@kkclinic.com | Doctor123! |
| Staff | staff@kkclinic.com | Staff123! |

## 📁 Project Structure

```
kkclinic/
├── docs/                    # Documentation
│   ├── 01-constitution/     # Core rules (RULES, TECH_STACK, LESSONS_LEARNED)
│   ├── 02-architecture/     # ADR, WORKFLOW, DATABASE
│   ├── 04-features/         # Sprint-specific docs
│   └── 05-reference/        # ROADMAP, GLOSSARY
├── supabase/                # Database migrations
├── src/
│   ├── app/                 # Next.js pages (App Router)
│   │   ├── (auth)/          # Public routes (login)
│   │   └── (dashboard)/     # Protected routes
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Form components
│   │   ├── prescription/    # Prescription-specific (Dosage Sheet, Summary)
│   │   └── payment/         # Payment modal, etc.
│   ├── lib/                 # Utilities
│   │   ├── supabase/        # Supabase clients
│   │   └── dosage/          # Smart Dosage Engine (Tokenizer, Dictionary)
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript definitions
└── public/                  # Static assets
```

## 🔐 Role Permissions

| Feature | Admin | Doctor | Staff |
|---------|:-----:|:------:|:-----:|
| จัดการผู้ใช้ | ✅ | ❌ | ❌ |
| ลงทะเบียนผู้ป่วย | ✅ | ❌ | ✅ |
| ค้นหาผู้ป่วย | ✅ | ✅ | ✅ |
| สั่งยา | ✅ | ✅ | ❌ |
| จ่ายยา & คิดเงิน | ✅ | ❌ | ✅ |
| จัดการสต๊อก | ✅ | ❌ | 🟡* |
| ดูประวัติสต๊อก | ✅ | ❌ | ✅ |

*🟡 Staff สามารถเพิ่มสต๊อกได้ แต่ไม่สามารถลบ/แก้ไขข้อมูลยา

## 🗄 Database Schema

**Tables:**
- `users` - ข้อมูลผู้ใช้ระบบ
- `patients` - ข้อมูลผู้ป่วย (TN, name, drug_allergies, etc.)
- `medicines` - รายการยา/เวชภัณฑ์
- `prescriptions` - ใบสั่งยา (df, df_note, total_price)
- `prescription_items` - รายการยา (dosage_original, dosage_instruction, etc.)
- `transactions` - ธุรกรรมการคิดเงิน
- `stock_logs` - ประวัติการเคลื่อนไหวสต๊อก

## 📝 Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint (MUST pass before commit)
npm run test          # Run Vitest tests

# Database
npm run db:types      # Generate TypeScript types from Supabase
```

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📅 Roadmap

### ✅ Sprint 1-2: Foundation & Billing
- Auth, Patients, Inventory, Prescriptions
- Billing, Payment Modal, Void Transactions

### ✅ Sprint 3A-C: UX & Smart Features
- TN Format, Drug Allergies Warning
- Smart Dosage System (Tokenizer + Dictionary + Engine)
- Doctor Fee (DF) with Note Presets
- Medicine Summary Sheet (Internal)
- Bilingual Labels

### 🔲 Sprint 4: Workflow Revolution (Next)
- Real-time filter & Sortable tables
- Reserved Stock Model
- Patient Statement (ใบสรุปค่าใช้จ่าย)
- End of Day (EOD) workflow

### 🔲 Future
- Barcode Scanner
- PDF Export
- LOT/Expiry tracking
- Optical orders (แว่น/คอนแทค)
- Insurance billing

---

**Current Version:** `v0.6.0-sprint3-complete`

Built with ❤️ using [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)

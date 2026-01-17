# KKClinic - ระบบบริหารจัดการคลินิก

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Private-red)

> Web Application สำหรับบริหารจัดการคลินิก ครอบคลุมการลงทะเบียนผู้ป่วย การสั่งยา การจ่ายยาและคิดเงิน และการจัดการคลังยา

## 🏥 Features

- **ระบบยืนยันตัวตน** - Login/Logout พร้อม Role-based Access (Admin, Doctor, Staff)
- **จัดการผู้ป่วย** - ลงทะเบียน, ค้นหา, แก้ไขข้อมูลผู้ป่วย
- **สั่งยา/หัตถการ** - แพทย์สร้างใบสั่งยาพร้อม Autocomplete
- **จ่ายยา & คิดเงิน** - พนักงานจ่ายยาตามใบสั่ง, ออกใบเสร็จ
- **จัดการสต๊อก** - เพิ่ม/ลดสต๊อก, สแกน Barcode, ดูประวัติ

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React Framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI Components |
| [Supabase](https://supabase.com/) | Backend (PostgreSQL + Auth) |
| [Vercel](https://vercel.com/) | Deployment |

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase Account

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/kkclinic.git
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
│   ├── PRD.md               # Product Requirements
│   ├── DATABASE_SCHEMA.md   # Database Schema
│   └── IMPLEMENTATION_PLAN.md
├── supabase/                # Database migrations
│   └── migrations/
├── src/
│   ├── app/                 # Next.js pages (App Router)
│   │   ├── (auth)/          # Public routes (login)
│   │   └── (dashboard)/     # Protected routes
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   └── forms/           # Form components
│   ├── lib/                 # Utilities
│   │   └── supabase/        # Supabase clients
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

ดูรายละเอียดได้ที่ [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

**Tables:**
- `users` - ข้อมูลผู้ใช้ระบบ
- `patients` - ข้อมูลผู้ป่วย  
- `medicines` - รายการยา/เวชภัณฑ์
- `prescriptions` - ใบสั่งยา
- `prescription_items` - รายการในใบสั่งยา
- `transactions` - ธุรกรรมการคิดเงิน
- `transaction_items` - รายการในใบเสร็จ
- `stock_logs` - ประวัติการเคลื่อนไหวสต๊อก

## 📝 Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # TypeScript check

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

## 📚 Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [API Reference](docs/API_REFERENCE.md) *(coming soon)*
- [User Guide](docs/USER_GUIDE.md) *(coming soon)*

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📅 Roadmap (MVP)

### Phase 1: Foundation
- [x] Project setup (Next.js + shadcn/ui)
- [x] Database schema design
- [ ] Auth system (Login/Logout)
- [ ] Patient registration & search

### Phase 2: Core Workflow
- [ ] Medicine CRUD
- [ ] Prescription entry (Doctor)
- [ ] Dispensing & Billing (Staff)
- [ ] Auto stock deduction
- [ ] Receipt generation

### Phase 3: Inventory & Polish
- [ ] Barcode scanner (camera)
- [ ] Stock adjustment
- [ ] RLS policies
- [ ] Responsive design
- [ ] Staging deployment

### Future (Phase 4+)
- [ ] PDF Receipt export
- [ ] LOT/Expiry tracking
- [ ] Mobile PWA support
- [ ] Advanced reports
- [ ] EMR integration

---

Built with ❤️ using [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)

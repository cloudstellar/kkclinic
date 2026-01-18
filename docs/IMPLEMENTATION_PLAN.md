# Implementation Plan
# KKClinic MVP - ระบบบริหารจัดการคลินิก

**Version:** 1.2  
**Last Updated:** 19 มกราคม 2569  
**Supabase Project:** kkclinic (`xlgztefpllpurbowibvz`)  
**API URL:** `https://xlgztefpllpurbowibvz.supabase.co`  

---

## Tech Stack

| Category | Technology | Notes |
|----------|------------|-------|
| **Framework** | Next.js 15 (App Router) | React Server Components |
| **Language** | TypeScript | Strict mode |
| **Styling** | Tailwind CSS 4 | Utility-first |
| **UI Components** | shadcn/ui | Radix-based |
| **Font** | Noto Sans Thai | Google Fonts |
| **Backend** | Supabase | PostgreSQL + Auth + REST API |
| **Deployment** | Vercel | Auto-deploy from GitHub |
| **Barcode** | QuaggaJS หรือ @ericblade/quagga2 | Phase 3 |

---

## Project Structure

kkclinic/
├── .env.local                 # Environment variables (gitignored)
├── .env.example               # Template for dev env vars
├── .env.production.example    # ✨ Template for production env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── docs/                      # 📚 Documentation
│   ├── PRD.md                 # Product Requirements
│   ├── DATABASE_SCHEMA.md     # DB Schema + SQL
│   ├── API_REFERENCE.md       # API Documentation
│   └── USER_GUIDE.md          # User manual
│
├── supabase/                  # 🗄️ Database migrations
│   └── migrations/
│       ├── 001_create_functions.sql
│       ├── 002_create_users_table.sql
│       ├── 003_create_patients_table.sql
│       ├── 004_create_medicines_table.sql
│       ├── 005_create_prescriptions_tables.sql
│       ├── 006_create_transactions_tables.sql
│       ├── 007_create_stock_logs_table.sql
│       ├── 008_create_triggers.sql
│       └── 009_seed_data.sql
│
├── tests/                     # 🧪 Testing (Phase 4+) ✨
│   ├── patients.test.ts
│   ├── prescriptions.test.ts
│   ├── billing.test.ts
│   └── barcode.test.ts
│
├── public/                    # Static assets
│   └── images/
│
├── src/
│   ├── app/                   # 📱 Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Redirect to /login or /dashboard
│   │   │
│   │   ├── (auth)/            # 🔐 Auth routes (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── (dashboard)/       # 🏥 Protected routes
│   │       ├── layout.tsx     # Sidebar + Header + Auth guard
│   │       ├── dashboard/
│   │       │   └── page.tsx   # Role-based dashboard
│   │       │
│   │       ├── patients/      # 👤 Patient Management
│   │       │   ├── page.tsx           # List + Search
│   │       │   ├── new/
│   │       │   │   └── page.tsx       # Create patient
│   │       │   └── [id]/
│   │       │       ├── page.tsx       # View patient
│   │       │       └── edit/
│   │       │           └── page.tsx   # Edit patient
│   │       │
│   │       ├── prescriptions/ # 💊 Prescriptions (Doctor)
│   │       │   ├── page.tsx           # List prescriptions
│   │       │   ├── new/
│   │       │   │   └── page.tsx       # Create prescription
│   │       │   └── [id]/
│   │       │       └── page.tsx       # View prescription
│   │       │
│   │       ├── dispensing/    # 💳 Dispensing & Billing (Staff)
│   │       │   ├── page.tsx           # Pending prescriptions
│   │       │   └── [id]/
│   │       │       └── page.tsx       # Dispense + Bill
│   │       │
│   │       ├── billing/       # 🧾 Billing History
│   │       │   ├── page.tsx           # Transaction list
│   │       │   └── [id]/
│   │       │       └── page.tsx       # Receipt view
│   │       │
│   │       ├── inventory/     # 📦 Inventory (Admin/Staff)
│   │       │   ├── page.tsx           # Medicine list
│   │       │   ├── new/
│   │       │   │   └── page.tsx       # Add medicine
│   │       │   ├── [id]/
│   │       │   │   ├── page.tsx       # View medicine
│   │       │   │   └── edit/
│   │       │   │       └── page.tsx   # Edit medicine
│   │       │   ├── restock/
│   │       │   │   └── page.tsx       # Add stock (with scanner)
│   │       │   └── logs/
│   │       │       └── page.tsx       # Stock history
│   │       │
│   │       └── settings/      # ⚙️ Settings (Admin)
│   │           ├── page.tsx
│   │           └── users/
│   │               └── page.tsx       # User management
│   │
│   ├── components/            # 🧱 Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── nav-menu.tsx
│   │   │   └── user-dropdown.tsx
│   │   │
│   │   ├── forms/             # Form components
│   │   │   ├── patient-form.tsx
│   │   │   ├── prescription-form.tsx
│   │   │   ├── medicine-form.tsx
│   │   │   └── stock-form.tsx
│   │   │
│   │   ├── tables/            # Table components
│   │   │   ├── patients-table.tsx
│   │   │   ├── medicines-table.tsx
│   │   │   ├── prescriptions-table.tsx
│   │   │   └── transactions-table.tsx
│   │   │
│   │   ├── receipt/           # Receipt component
│   │   │   └── receipt-template.tsx
│   │   │
│   │   └── scanner/           # Barcode scanner (Phase 3)
│   │       └── barcode-scanner.tsx
│   │
│   ├── lib/                   # 📚 Utilities & Config
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser client
│   │   │   ├── server.ts      # Server client
│   │   │   └── middleware.ts  # Auth middleware
│   │   │
│   │   ├── barcode/           # ✨ Barcode utilities (Phase 3)
│   │   │   ├── index.ts       # initBarcodeScanner, stopScanner
│   │   │   ├── config.ts      # Supported formats, camera config
│   │   │   └── types.ts       # BarcodeResult, ScannerOptions
│   │   │
│   │   ├── utils.ts           # General utilities
│   │   ├── constants.ts       # App constants
│   │   └── validations.ts     # Zod schemas
│   │
│   ├── hooks/                 # 🪝 Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-patients.ts
│   │   ├── use-medicines.ts
│   │   └── use-prescriptions.ts
│   │
│   ├── types/                 # 📝 TypeScript types
│   │   ├── database.ts        # Generated from Supabase
│   │   ├── auth.ts
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css        # Global styles + Tailwind
│
└── README.md                  # Project documentation
```

---

## Phase-by-Phase Implementation

### 🟪 Phase 0: Planning & Documentation

**Duration:** Before development  
**Goal:** ให้ทุกคนเข้าใจภาพเดียวกันก่อนเขียนโค้ด

| Task | Status | Deliverable |
|------|--------|-------------|
| สร้าง PRD | ✅ | [docs/PRD.md](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/docs/PRD.md) |
| ออกแบบ Database Schema | ✅ | [docs/DATABASE_SCHEMA.md](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/docs/DATABASE_SCHEMA.md) |
| สร้าง Implementation Plan | ✅ | This document |
| สร้าง ERD / Flow Diagram | 🟡 | In DATABASE_SCHEMA.md |
| สร้าง README | 🔲 | /README.md |

**Deliverables:**
- ✅ PRD.md (Product Requirements Document)
- ✅ DATABASE_SCHEMA.md (Schema + SQL + ERD)
- ✅ IMPLEMENTATION_PLAN.md (This file)
- 🔲 README.md (Setup instructions)

---

### 🟩 Phase 1: Foundation (Week 1–2)

**Goal:** ระบบพื้นฐานพร้อม login, navigation, patient CRUD

| Task | Route/File | Notes |
|------|------------|-------|
| Init Next.js + shadcn/ui | `/` | `npx create-next-app@latest` |
| Setup Tailwind + Thai font | `globals.css` | Noto Sans Thai |
| Connect Supabase SDK | `lib/supabase/` | env config |
| Create DB Schema | Supabase | Run migrations |
| Auth (Login/Logout) | `/login` | Supabase Auth |
| Create sample users | Supabase | admin/doctor/staff |
| Role-based layout | `(dashboard)/layout.tsx` | Sidebar menu by role |
| Patient CRUD | `/patients/*` | List, Create, Edit, View |
| Patient Search | `/patients` | HN, ชื่อ, เบอร์โทร |

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kkclinic.com | Admin123! |
| Doctor | doctor@kkclinic.com | Doctor123! |
| Staff | staff@kkclinic.com | Staff123! |

**Deliverables:**
- ✅ Auth system working
- ✅ Role-based navigation
- ✅ Patient CRUD functional
- ✅ Sample users created

---

### 🟨 Phase 2: Core Workflow (Week 3–4)

**Goal:** ระบบสั่งยา → จ่ายยา → คิดเงิน ครบวงจร

| Task | Route | Role |
|------|-------|------|
| Medicine CRUD | `/inventory/*` | Admin |
| Prescription Entry | `/prescriptions/new` | Doctor |
| Medicine Autocomplete | Component | - |
| Pending Prescriptions | `/dispensing` | Staff |
| Dispense & Bill | `/dispensing/[id]` | Staff |
| Auto deduct stock | DB Trigger | - |
| Transaction creation | `/billing` | Staff |
| Receipt generation | `/billing/[id]` | Staff |

**Key Routes:**
```
/prescriptions           → Doctor: รายการใบสั่งยาของตนเอง
/prescriptions/new       → Doctor: สร้างใบสั่งยาใหม่
/prescriptions/[id]      → Doctor: ดูรายละเอียดใบสั่ง

/dispensing              → Staff: รายการใบสั่งที่รอจ่ายยา
/dispensing/[id]         → Staff: หน้าจ่ายยา + คิดเงิน

/billing                 → Staff: ประวัติการคิดเงิน
/billing/[id]            → Staff: ดูใบเสร็จ + Print
```

**Deliverables:**
- ✅ Workflow Demo: สั่งยา → จ่ายยา → คิดเงิน
- ✅ Receipt printable
- ✅ Stock auto-deduction working

---

### 🟧 Phase 2.3: UX & Billing Enhancements ✅

**Goal:** ปรับปรุง UX สำหรับการชำระเงินและจัดการสต็อก

| Task | Status | Component/Route |
|------|--------|----------------|
| Payment Modal | ✅ | `components/payment/payment-modal.tsx` |
| ส่วนลด Toggle (THB/%) | ✅ | PaymentModal |
| Stock Validation (Fail Fast) | ✅ | `billing/actions.ts` |
| QuantityInput Stepper | ✅ | `components/ui/quantity-input.tsx` |
| formatCurrency utility | ✅ | `lib/utils.ts` |
| Dispensing Page | ✅ | `/dispensing` - แสดง pending prescriptions |
| Billing Page | ✅ | `/billing` - transaction history + reprint |
| Receipt Update | ✅ | Logo + clinic info |
| Soft stock warning | ✅ | ตอนสั่งยา (prescription form) |

**New Components:**
```
src/components/payment/payment-modal.tsx   # Payment Modal with discount
src/components/ui/quantity-input.tsx       # Stepper [-][+] component
src/app/(dashboard)/prescriptions/[id]/payment-button.tsx
```

**Key Features:**
- Payment Modal with discount toggle (THB/%), payment method selection
- QuantityInput with keyboard support (Arrow ↑↓), auto-reset to 1
- Stock validation at payment (hard block) and prescription (soft warn)
- Transaction history with reprint button

**Deliverables:**
- ✅ Payment Modal MVP
- ✅ QuantityInput Stepper UI
- ✅ Receipt with clinic branding
- ✅ Tag: `v0.3.0-payment-modal`

---

### 🟦 Phase 3: Inventory & Polish (Week 5–6)

**Goal:** ระบบคลังยาสมบูรณ์ + สแกน + RLS + Deploy

| Task | Route/File | Notes |
|------|------------|-------|
| Stock Management | `/inventory` | View all medicines |
| Add Stock (Manual) | `/inventory/restock` | Form entry |
| Barcode Scanner | Component | QuaggaJS |
| Stock Logs | `/inventory/logs` | History view |
| RLS Policies | Supabase | Role-based access |
| UI Polish | All pages | Loading, Error states |
| Responsive Design | All pages | Mobile-friendly |
| Testing | Manual | Edge cases |
| Staging Deploy | Vercel | Demo environment |

**Barcode Implementation:**
```tsx
// Using @ericblade/quagga2
import Quagga from '@ericblade/quagga2';

// Supported formats: EAN-13, Code128, Code39
```

**RLS Policies Summary:**
| Table | Admin | Doctor | Staff |
|-------|-------|--------|-------|
| users | CRUD | Read | Read own |
| patients | CRUD | Read | CRUD |
| medicines | CRUD | Read | Read |
| prescriptions | CRUD | CRUD own | Read |
| transactions | CRUD | Read own | CRUD |
| stock_logs | CRUD | - | Create, Read |

**Deliverables:**
- ✅ Barcode scanning working
- ✅ Stock logs viewable
- ✅ RLS policies active
- ✅ Staging site deployed
- ✅ Demo credentials ready

---

## Environment Variables

### `.env.local` (Development)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xlgztefpllpurbowibvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App
NEXT_PUBLIC_APP_NAME=KKClinic
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `.env.example`
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# App Configuration
NEXT_PUBLIC_APP_NAME=KKClinic
NEXT_PUBLIC_APP_URL=
```

### `.env.production.example` ✨
```env
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# App Production
NEXT_PUBLIC_APP_NAME=KKClinic
NEXT_PUBLIC_APP_URL=https://kkclinic.vercel.app

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Commands Reference

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Supabase CLI Workflow ✨
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to remote project
supabase link --project-ref xlgztefpllpurbowibvz

# Generate TypeScript types from remote DB
npx supabase gen types typescript --project-id xlgztefpllpurbowibvz > src/types/database.ts

# ----- Local Development (Optional) -----

# Start local Supabase (Docker required)
supabase start

# Apply migrations to local
supabase db push

# Create new migration
supabase migration new migration_name

# Diff local vs remote schema
supabase db diff

# Push local migrations to remote
supabase db push --linked

# Stop local Supabase
supabase stop
```

### Testing (Phase 4+)
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Navigation by Role

### Admin
- Dashboard
- ผู้ป่วย (Patients)
- ใบสั่งยา (Prescriptions) - View only
- จ่ายยา (Dispensing)
- คิดเงิน (Billing)
- คลังยา (Inventory) - Full access
- ตั้งค่า (Settings) - User management

### Doctor
- Dashboard
- ผู้ป่วย (Patients) - View only
- ใบสั่งยา (Prescriptions) - Create/View own
- คลังยา (Inventory) - View only

### Staff
- Dashboard
- ผู้ป่วย (Patients) - Full CRUD
- จ่ายยา (Dispensing)
- คิดเงิน (Billing)
- คลังยา (Inventory) - View + Restock

---

## API Endpoints (Supabase Auto-generated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/patients` | List patients |
| POST | `/rest/v1/patients` | Create patient |
| GET | `/rest/v1/patients?id=eq.{id}` | Get patient by ID |
| PATCH | `/rest/v1/patients?id=eq.{id}` | Update patient |
| DELETE | `/rest/v1/patients?id=eq.{id}` | Delete patient |
| GET | `/rest/v1/medicines` | List medicines |
| GET | `/rest/v1/medicines?code=eq.{code}` | Get by barcode |
| GET | `/rest/v1/prescriptions` | List prescriptions |
| POST | `/rest/v1/prescriptions` | Create prescription |
| GET | `/rest/v1/transactions` | List transactions |
| POST | `/rest/v1/transactions` | Create transaction |
| GET | `/rest/v1/stock_logs` | List stock logs |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Barcode scanner incompatibility | Manual code entry fallback |
| Slow database queries | Proper indexing, pagination |
| Auth token expiry | Auto-refresh with Supabase SDK |
| Stock race condition | Use DB transaction/stored procedure |
| RLS misconfiguration | Test all roles before production |

---

## Next Steps

1. ⏳ **Review this plan** - ยืนยันว่าโครงสร้างและ scope ถูกต้อง
2. 📦 **Get Supabase Keys** - ดึง anon key จาก Supabase Dashboard
3. 🚀 **Start Phase 1** - Init Next.js และสร้าง DB schema

---

## Changelog

| Date | Version | Tag | Changes |
|------|---------|-----|---------|
| 2026-01-19 | 1.2 | v0.5.1-workflow-docs | Workflow documentation, AI Rules, ADR, ROADMAP |
| 2026-01-19 | 1.2 | v0.5.0-sprint2b-dosagesheet | DosageSheet UX, Recent Instructions, Copy from Previous |
| 2026-01-18 | 1.1 | v0.4.0-sprint2a | Void transactions, Label printing, Billing Summary |
| 2026-01-18 | 1.1 | v0.3.0-payment-modal | Payment Modal, QuantityInput Stepper, Stock warnings, Receipt branding |
| 2026-01-17 | 1.0 | v0.2.2-ux-stock | Initial plan created |

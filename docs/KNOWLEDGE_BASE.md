# KKClinic Knowledge Base
# Internal Development Documentation

**Last Updated:** 18 มกราคม 2569

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Authentication Flow](#authentication-flow)
4. [Role-based Access Control](#role-based-access-control)
5. [Database Conventions](#database-conventions)
6. [Frontend Patterns](#frontend-patterns)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is KKClinic?

ระบบบริหารจัดการคลินิกแบบ Web Application ครอบคลุม:
- การลงทะเบียนและค้นหาผู้ป่วย
- การสั่งยา/หัตถการโดยแพทย์  
- การจ่ายยาและคิดเงิน
- การจัดการคลังยา

### Why This Stack?

| Choice | Reason |
|--------|--------|
| **Next.js 15** | App Router, Server Components, built-in optimizations |
| **Supabase** | PostgreSQL + Auth + Realtime + REST API ในที่เดียว ลดความซับซ้อน |
| **shadcn/ui** | ไม่ lock-in, copy-paste components, สวย |
| **Vercel** | Zero-config deployment สำหรับ Next.js |
| **TypeScript** | Type safety, better DX, fewer runtime errors |

### Key Design Decisions

1. **Thai-only UI** - MVP เป็นภาษาไทยทั้งหมด ลดความซับซ้อนของ i18n
2. **shadcn/ui over MUI** - เบากว่า, ปรับแต่งง่ายกว่า, modern
3. **Supabase RLS** - Security ที่ database level ไม่ใช่แค่ API
4. **Server Components** - Performance ดีกว่า, SEO friendly

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js (React + App Router)            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │   │
│  │  │  Login  │  │Patients │  │  Rx     │  │Billing │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
└────────────────────────────│────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │  REST API   │  │  Realtime   │         │
│  │  (GoTrue)   │  │  (PostgREST)│  │ (optional)  │         │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘         │
│         │                │                                  │
│         ▼                ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL                         │   │
│  │  ┌───────┐ ┌────────┐ ┌─────────┐ ┌────────────┐    │   │
│  │  │ users │ │patients│ │medicines│ │prescriptions│    │   │
│  │  └───────┘ └────────┘ └─────────┘ └────────────┘    │   │
│  │                      + RLS Policies                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User Login
   Browser → Supabase Auth → JWT Token → Store in Cookie

2. API Request
   Browser → Next.js → Supabase Client (with JWT) → PostgreSQL
                                                   ↓
                                            RLS Check (role)
                                                   ↓
                                            Return Data

3. Create Prescription
   Doctor UI → POST /prescriptions → Insert prescription
                                   → Insert prescription_items
                                   → Return created data

4. Dispense & Bill
   Staff UI → Update prescription.status → 'dispensed'
            → Create transaction
            → Create transaction_items  
            → Deduct medicines.stock_qty
            → Create stock_logs
```

---

## Authentication Flow

### Login Process

```
1. User enters email/password on /login
2. supabase.auth.signInWithPassword() called
3. Supabase validates credentials
4. Returns JWT + Refresh Token
5. Tokens stored in HTTP-only cookies (by Supabase SSR)
6. User redirected to /dashboard
7. Subsequent requests include JWT automatically
```

### Middleware Protection

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if needed
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protected routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}
```

### Getting Current User

```typescript
// Server Component
import { createServerClient } from '@/lib/supabase/server'

async function getUserProfile() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}
```

---

## Role-based Access Control

### Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | ผู้ดูแลระบบ | ทุกอย่าง + จัดการ users |
| `doctor` | แพทย์ | ดูผู้ป่วย + สั่งยา |
| `staff` | พนักงาน | CRUD ผู้ป่วย + จ่ายยา + คิดเงิน |

### Frontend Role Check

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<'admin' | 'doctor' | 'staff' | null>(null)
  
  // ... fetch user profile
  
  const isAdmin = role === 'admin'
  const isDoctor = role === 'doctor'
  const isStaff = role === 'staff'
  
  const canCreatePrescription = isAdmin || isDoctor
  const canDispense = isAdmin || isStaff
  const canManageInventory = isAdmin
  
  return { user, role, isAdmin, isDoctor, isStaff, canCreatePrescription, ... }
}
```

### Conditional Navigation

```typescript
// components/layout/sidebar.tsx
const menuItems = [
  { label: 'แดชบอร์ด', href: '/dashboard', roles: ['admin', 'doctor', 'staff'] },
  { label: 'ผู้ป่วย', href: '/patients', roles: ['admin', 'doctor', 'staff'] },
  { label: 'ใบสั่งยา', href: '/prescriptions', roles: ['admin', 'doctor'] },
  { label: 'จ่ายยา', href: '/dispensing', roles: ['admin', 'staff'] },
  { label: 'คิดเงิน', href: '/billing', roles: ['admin', 'staff'] },
  { label: 'คลังยา', href: '/inventory', roles: ['admin', 'staff'] },
  { label: 'ตั้งค่า', href: '/settings', roles: ['admin'] },
]

// Filter by user role
const visibleItems = menuItems.filter(item => item.roles.includes(userRole))
```

### Backend RLS (Database Level)

```sql
-- Example: Only doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions"
    ON prescriptions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'doctor')
        )
    );
```

### RLS Permission Matrix ✨

| Table | Admin | Doctor | Staff |
|-------|:-----:|:------:|:-----:|
| **users** | ✅ CRUD | ✅ Read | ✅ Read own |
| **patients** | ✅ CRUD | ✅ Read | ✅ CRUD |
| **medicines** | ✅ CRUD | ✅ Read | ✅ Read |
| **prescriptions** | ✅ All | ✅ Own only | ✅ Read |
| **prescription_items** | ✅ All | ✅ Own only | ✅ Read |
| **transactions** | ✅ All | ❌ None | ✅ Create, Read |
| **transaction_items** | ✅ All | ❌ None | ✅ Create, Read |
| **stock_logs** | ✅ CRUD | ❌ None | ✅ Create, Read |

> **Legend:** CRUD = Create/Read/Update/Delete, Own = records created by that user

---

## Database Conventions

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `patients`, `stock_logs` |
| Columns | snake_case | `created_at`, `full_name` |
| Primary Keys | `id` (UUID) | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Foreign Keys | `{table}_id` | `patient_id`, `doctor_id` |
| Timestamps | `created_at`, `updated_at` | `TIMESTAMPTZ DEFAULT now()` |
| Booleans | `is_` prefix | `is_active`, `is_deleted` |

### Common Patterns

#### Timestamps

ทุกตารางควรมี:
```sql
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

พร้อม trigger:
```sql
CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Soft Delete

ถ้าต้องการ (ไม่บังคับสำหรับ MVP):
```sql
is_deleted BOOLEAN DEFAULT false,
deleted_at TIMESTAMPTZ
```

#### Status Columns

ใช้ CHECK constraint:
```sql
status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'dispensed', 'cancelled'))
```

---

## Frontend Patterns

### Page Structure

```typescript
// src/app/(dashboard)/patients/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { PatientsTable } from '@/components/tables/patients-table'

export default async function PatientsPage() {
  const supabase = createServerClient()
  
  // Fetch data on server
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">รายชื่อผู้ป่วย</h1>
      <PatientsTable data={patients ?? []} />
    </div>
  )
}
```

### Form Pattern

```typescript
// components/forms/patient-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema } from '@/lib/validations'

export function PatientForm({ defaultValues, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" label="ชื่อ-นามสกุล" />
        <FormField name="phone" label="เบอร์โทรศัพท์" />
        {/* ... */}
        <Button type="submit">บันทึก</Button>
      </form>
    </Form>
  )
}
```

### Data Fetching

```typescript
// Server Component (preferred)
async function getData() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('patients').select('*')
  if (error) throw error
  return data
}

// Client Component (when needed)
function usePatients() {
  const supabase = createBrowserClient()
  const [patients, setPatients] = useState([])
  
  useEffect(() => {
    supabase.from('patients').select('*').then(({ data }) => {
      setPatients(data ?? [])
    })
  }, [])
  
  return patients
}
```

---

## Common Workflows

### 1. Patient Registration

```
1. Staff ไปที่ /patients/new
2. กรอกข้อมูลผู้ป่วย
3. ระบบ generate HN อัตโนมัติ (หรือกรอกเอง)
4. กด "บันทึก"
5. INSERT INTO patients
6. Redirect ไป /patients/{id}
```

### 2. Doctor Creates Prescription

```
1. Doctor ค้นหาผู้ป่วยที่ /patients
2. เลือกผู้ป่วย → ไปที่ /prescriptions/new?patient={id}
3. ค้นหายาด้วย Autocomplete
4. เพิ่มยาลงรายการ (quantity, note)
5. กด "บันทึกใบสั่ง"
6. INSERT INTO prescriptions (status='pending')
7. INSERT INTO prescription_items
8. Redirect ไป /prescriptions/{id}
```

### 3. Staff Dispenses & Bills (Payment Modal)

```
1. Staff ไปที่ /prescriptions
2. เห็นรายการใบสั่งที่ status='pending'
3. เลือกใบสั่ง → ไปที่ /prescriptions/{id}
4. ตรวจสอบรายการยา
5. กดปุ่ม "💳 ชำระเงิน"
6. Payment Modal เปิด:
   - แสดง Preview รายการ
   - เลือก ส่วนลด (THB หรือ %)
   - เลือก วิธีชำระ (เงินสด/โอน/บัตร)
   - ใส่หมายเหตุ (optional)
7. กด "ยืนยันชำระเงิน"
8. Stock Validation:
   - ถ้าสต็อกไม่พอ → แสดง Error, ไม่ดำเนินการ
9. BEGIN TRANSACTION:
   - INSERT INTO transactions (receipt_no, totals)
   - UPDATE medicines SET stock_qty = stock_qty - qty
   - INSERT INTO stock_logs (type='dispense')
   - UPDATE prescriptions SET status='dispensed'
10. COMMIT
11. Redirect ไป /billing/receipt/{id}
12. แสดงใบเสร็จ (พร้อมปุ่มพิมพ์)
```

**Key Components:**
- `PaymentModal` - src/components/payment/payment-modal.tsx
- `PaymentButton` - src/app/(dashboard)/prescriptions/[id]/payment-button.tsx  
- `processPayment()` - src/app/(dashboard)/billing/actions.ts
- `formatCurrency()` - src/lib/utils.ts

### 4. Stock Restock

```
1. Admin/Staff ไปที่ /inventory/restock
2. สแกน Barcode หรือค้นหายา
3. ระบุจำนวนที่เพิ่ม + หมายเหตุ
4. กด "บันทึก"
5. BEGIN TRANSACTION:
   - UPDATE medicines SET stock_qty = stock_qty + qty
   - INSERT INTO stock_logs (type='restock')
6. COMMIT
```

---

## Troubleshooting

### Common Issues

#### "Invalid API Key"
```
❌ Error: Invalid API key

✅ Solution:
1. ตรวจสอบ .env.local ว่ามี NEXT_PUBLIC_SUPABASE_ANON_KEY
2. ตรวจสอบว่าไม่มี whitespace ใน key
3. รีสตาร์ท dev server หลังแก้ไข .env
```

#### "Row Level Security violation"
```
❌ Error: new row violates row-level security policy

✅ Solution:
1. ตรวจสอบว่า user มี role ที่ถูกต้อง
2. ตรวจสอบ RLS policy ว่าอนุญาต action นี้ไหม
3. ใช้ Supabase Dashboard > Authentication > Policies ตรวจสอบ
```

#### "Auth session missing"
```
❌ Error: Auth session missing!

✅ Solution:
1. ตรวจสอบว่า middleware.ts ถูกต้อง
2. ตรวจสอบ cookies ว่ามี sb-xxx-auth-token
3. ลอง logout แล้ว login ใหม่
```

#### "TypeScript type mismatch"
```
❌ Error: Type 'X' is not assignable to type 'Y'

✅ Solution:
1. รัน npm run db:types เพื่อ regenerate types
2. ตรวจสอบว่า database schema ตรงกับ types
```

### Debugging Tips

1. **Supabase Logs**
   - Dashboard > Logs > API logs
   - ดู request/response ที่ server ได้รับ

2. **Browser DevTools**
   - Network tab: ดู API calls
   - Application > Cookies: ดู auth tokens

3. **Next.js Dev Mode**
   - Terminal: ดู server-side errors
   - Browser console: ดู client-side errors

---

## Quick Reference

### Supabase SDK Cheatsheet

```typescript
// Select
const { data } = await supabase.from('patients').select('*')
const { data } = await supabase.from('patients').select('id, name, phone')
const { data } = await supabase.from('patients').select('*, prescriptions(*)')

// Filter
.eq('id', id)
.neq('status', 'cancelled')
.in('role', ['admin', 'doctor'])
.ilike('name', `%${search}%`)
.gte('created_at', startDate)
.order('created_at', { ascending: false })
.limit(10)
.range(0, 9)

// Insert
const { data, error } = await supabase
  .from('patients')
  .insert({ name, phone })
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('patients')
  .update({ name })
  .eq('id', id)
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('patients')
  .delete()
  .eq('id', id)
```

### shadcn/ui Components Used

```bash
# Core
npx shadcn@latest add button input label card table

# Forms
npx shadcn@latest add form select textarea checkbox

# Feedback
npx shadcn@latest add toast dialog alert

# Navigation
npx shadcn@latest add dropdown-menu navigation-menu

# Data Display
npx shadcn@latest add avatar badge separator
```

---

## Contacts & Resources

- **Supabase Project:** [Dashboard](https://supabase.com/dashboard/project/xlgztefpllpurbowibvz)
- **API URL:** `https://xlgztefpllpurbowibvz.supabase.co`
- **Vercel Project:** *(to be added after deploy)*

### External Docs
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

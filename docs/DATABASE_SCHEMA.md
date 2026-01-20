# Database Schema Documentation
# KKClinic - Supabase PostgreSQL

**Version:** 1.2  
**Last Updated:** 20 มกราคม 2569 (Sprint 3A)  

---

## Overview

ระบบใช้ PostgreSQL บน Supabase โดยมีตารางหลัก 8 ตาราง:

1. `users` - ข้อมูลผู้ใช้ระบบ (เชื่อมกับ Supabase Auth)
2. `patients` - ข้อมูลผู้ป่วย
3. `medicines` - รายการยา/เวชภัณฑ์
4. `prescriptions` - ใบสั่งยา (header)
5. `prescription_items` - รายการยาในใบสั่ง (detail)
6. `transactions` - ธุรกรรมการคิดเงิน/ใบเสร็จ (header)
7. `transaction_items` - รายการในใบเสร็จ (detail)
8. `stock_logs` - ประวัติการเคลื่อนไหวสต๊อก

---

## Entity Relationship Diagram

```
┌──────────────────┐
│   auth.users     │ (Supabase Auth - ไม่ต้องสร้างเอง)
└────────┬─────────┘
         │ 1:1
         ▼
┌──────────────────┐
│      users       │ (Profile + Role)
└────────┬─────────┘
         │
    ┌────┴────┬─────────────────┐
    │         │                 │
    ▼         ▼                 ▼
┌────────┐ ┌────────────┐ ┌─────────────┐
│doctor  │ │   staff    │ │stock_logs   │
│(role)  │ │  (role)    │ │(changed_by) │
└────┬───┘ └─────┬──────┘ └─────────────┘
     │           │                ▲
     ▼           │                │
┌────────────────┴──────┐    ┌────┴────────┐
│    prescriptions      │    │  medicines  │
│  (doctor_id, patient) │    │ (stock_qty) │
└───────────┬───────────┘    └──────┬──────┘
            │                       │
            ▼                       │
┌───────────────────────┐          │
│  prescription_items   │◄─────────┤
│  (medicine_id)        │          │
└───────────┬───────────┘          │
            │                      │
            ▼                      │
┌───────────────────────┐          │
│     transactions      │          │
│ (staff_id, patient)   │          │
└───────────┬───────────┘          │
            │                      │
            ▼                      │
┌───────────────────────┐          │
│  transaction_items    │◄─────────┘
│   (medicine_id)       │
└───────────────────────┘

┌───────────────────────┐
│       patients        │
│  (hn, name, phone)    │
└───────────────────────┘
```

---

## Table Definitions

### 1. users (ข้อมูลผู้ใช้ระบบ)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'staff')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    is_demo BOOLEAN DEFAULT false,  -- ✨ แยกข้อมูล demo/staging
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-----------|
| id | UUID | PK, FK → auth.users | เชื่อมกับ Supabase Auth |
| email | TEXT | UNIQUE, NOT NULL | อีเมลผู้ใช้ |
| full_name | TEXT | NOT NULL | ชื่อ-นามสกุล |
| role | TEXT | NOT NULL | admin / doctor / staff |
| phone | TEXT | - | เบอร์โทรศัพท์ |
| is_active | BOOLEAN | DEFAULT true | สถานะการใช้งาน |
| last_login_at | TIMESTAMPTZ | - | วันเวลา login ล่าสุด ✨ |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | DEFAULT now() | วันที่แก้ไขล่าสุด |

---

### 2. patients (ข้อมูลผู้ป่วย)

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,                    -- ✨ Sprint 3A: ชื่อภาษาอังกฤษ
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    phone TEXT NOT NULL,
    address TEXT,
    address_en TEXT,                 -- ✨ Sprint 3A: ที่อยู่ภาษาอังกฤษ
    postal_code TEXT,                -- ✨ Sprint 3A: รหัสไปรษณีย์
    nationality TEXT DEFAULT 'thai', -- ✨ Sprint 3A: thai/other
    emergency_contact_name TEXT,     -- ✨ Sprint 3A
    emergency_contact_relationship TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    id_card TEXT,                    -- เลขบัตรประชาชน 13 หลัก
    drug_allergies TEXT,             -- ประวัติแพ้ยา (สำคัญมาก)
    underlying_conditions TEXT,      -- โรคประจำตัว/โรคเรื้อรัง
    is_demo BOOLEAN DEFAULT false,   -- แยกข้อมูล demo/staging
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users(id)
);

-- Index
CREATE INDEX idx_patients_hn ON patients(hn);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_id_card ON patients(id_card);
CREATE INDEX idx_patients_nationality ON patients(nationality);  -- ✨ Sprint 3A

-- Full-text search index
CREATE INDEX idx_patients_name_search ON patients USING gin(to_tsvector('simple', name));
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | รหัสผู้ป่วย (internal) |
| hn | TEXT | UNIQUE, NOT NULL | TN + 6 หลัก (Sprint 3A) |
| name | TEXT | NOT NULL | ชื่อ-นามสกุล (ไทย) |
| **name_en** | TEXT | - | ชื่อภาษาอังกฤษ ✨ 3A |
| birth_date | DATE | - | วันเกิด |
| gender | TEXT | CHECK | male/female/other |
| phone | TEXT | NOT NULL | เบอร์โทรศัพท์ |
| address | TEXT | - | ที่อยู่ (ไทย) |
| **address_en** | TEXT | - | ที่อยู่ EN ✨ 3A |
| **postal_code** | TEXT | - | รหัสไปรษณีย์ ✨ 3A |
| **nationality** | TEXT | DEFAULT 'thai' | thai/other ✨ 3A |
| **emergency_contact_name** | TEXT | - | ชื่อผู้ติดต่อฉุกเฉิน ✨ 3A |
| **emergency_contact_relationship** | TEXT | - | ความสัมพันธ์ ✨ 3A |
| **emergency_contact_phone** | TEXT | - | เบอร์ติดต่อ ✨ 3A |
| notes | TEXT | - | หมายเหตุ |
| id_card | TEXT | - | เลขบัตรประชาชน 13 หลัก |
| drug_allergies | TEXT | - | ประวัติแพ้ยา (แสดงเตือนสีแดง) |
| underlying_conditions | TEXT | - | โรคประจำตัว/โรคเรื้อรัง |
| is_demo | BOOLEAN | DEFAULT false | แยกข้อมูล demo |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่ลงทะเบียน |
| updated_at | TIMESTAMPTZ | DEFAULT now() | วันที่แก้ไขล่าสุด |
| created_by | UUID | FK → users | ผู้ลงทะเบียน |

---

### 3. medicines (ข้อมูลยา/เวชภัณฑ์)

```sql
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'ชิ้น',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_demo BOOLEAN DEFAULT false,  -- ✨ แยกข้อมูล demo/staging
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_medicines_code ON medicines(code);
CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_medicines_active ON medicines(is_active) WHERE is_active = true;
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | รหัสยา (internal) |
| code | TEXT | UNIQUE, NOT NULL | รหัสยา/Barcode |
| name | TEXT | NOT NULL | ชื่อยา |
| unit | TEXT | NOT NULL | หน่วย (กล่อง, แผง, ขวด) |
| price | DECIMAL(10,2) | NOT NULL | ราคาต่อหน่วย |
| stock_qty | INTEGER | NOT NULL | จำนวนคงเหลือ |
| min_stock | INTEGER | DEFAULT 10 | จำนวนขั้นต่ำ (แจ้งเตือน) |
| description | TEXT | - | รายละเอียดยา |
| is_active | BOOLEAN | DEFAULT true | สถานะ (ใช้งาน/ยกเลิก) |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | DEFAULT now() | วันที่แก้ไขล่าสุด |

---

### 4. prescriptions (ใบสั่งยา - Header)

```sql
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_no TEXT UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'dispensed', 'cancelled')),
    note TEXT,
    total_price DECIMAL(10,2) DEFAULT 0,  -- ✨ denormalized total
    cancelled_reason TEXT,  -- ✨ เหตุผลการยกเลิก
    completed_at TIMESTAMPTZ,  -- ✨ เวลาจ่ายยาเสร็จ
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_created ON prescriptions(created_at DESC);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-----------|
| id | UUID | PK | รหัสใบสั่งยา |
| prescription_no | TEXT | UNIQUE, NOT NULL | เลขที่ใบสั่งยา (RX-YYYYMMDD-XXXX) |
| patient_id | UUID | FK → patients | ผู้ป่วย |
| doctor_id | UUID | FK → users | แพทย์ผู้สั่ง |
| status | TEXT | CHECK | pending/dispensed/cancelled |
| note | TEXT | - | หมายเหตุใบสั่งยา |
| total_price | DECIMAL(10,2) | DEFAULT 0 | ยอดรวม (denormalized) ✨ |
| cancelled_reason | TEXT | - | เหตุผลการยกเลิก ✨ |
| completed_at | TIMESTAMPTZ | - | เวลาที่จ่ายยาเสร็จ ✨ |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่สั่ง |
| updated_at | TIMESTAMPTZ | DEFAULT now() | วันที่แก้ไขล่าสุด |

---

### 5. prescription_items (รายการยา/หัตถการในใบสั่ง - Detail)

```sql
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL DEFAULT 'medicine' CHECK (item_type IN ('medicine', 'procedure')),  -- ✨
    medicine_id UUID REFERENCES medicines(id),  -- nullable ถ้าเป็น procedure
    procedure_name TEXT,  -- ✨ ชื่อหัตถการ (ถ้า item_type = 'procedure')
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_override DECIMAL(10,2),  -- ✨ ราคาปรับเฉพาะเคส
    dosage_instruction TEXT,  -- ✨ วิธีใช้ยา สำหรับพิมพ์ฉลาก (Sprint 2A)
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: ต้องมี medicine_id หรือ procedure_name
    CONSTRAINT check_item_type CHECK (
        (item_type = 'medicine' AND medicine_id IS NOT NULL) OR
        (item_type = 'procedure' AND procedure_name IS NOT NULL)
    )
);

-- Index
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine ON prescription_items(medicine_id);
CREATE INDEX idx_prescription_items_type ON prescription_items(item_type);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-----------|
| id | UUID | PK | รหัสรายการ |
| prescription_id | UUID | FK → prescriptions | ใบสั่งยา |
| item_type | TEXT | CHECK | medicine / procedure ✨ |
| medicine_id | UUID | FK → medicines | ยาที่สั่ง (nullable) |
| procedure_name | TEXT | - | ชื่อหัตถการ ✨ |
| quantity | INTEGER | NOT NULL, > 0 | จำนวน |
| unit_price | DECIMAL(10,2) | NOT NULL | ราคาต่อหน่วย |
| price_override | DECIMAL(10,2) | - | ราคาปรับเฉพาะเคส ✨ |
| **dosage_instruction** | TEXT | - | วิธีใช้ยา (สำหรับฉลาก) ✨ Sprint 2A |
| note | TEXT | - | หมายเหตุ |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่สร้าง |

> **หมายเหตุ:** ใช้ `COALESCE(price_override, unit_price)` เพื่อคำนวณราคาจริง

---

### 6. transactions (ธุรกรรมการคิดเงิน - Header)

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no TEXT UNIQUE NOT NULL,
    prescription_id UUID REFERENCES prescriptions(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    staff_id UUID NOT NULL REFERENCES users(id),
    
    -- ✨ Status + Void (Sprint 2A)
    -- Transaction สร้างตอน confirm payment เท่านั้น (ไม่มี pending)
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'voided')),
    voided_at TIMESTAMPTZ,           -- ✨ เวลาที่ยกเลิก
    voided_by UUID REFERENCES users(id),  -- ✨ ใครยกเลิก
    void_reason TEXT,                -- ✨ เหตุผลการยกเลิก
    
    -- ✨ Billing breakdown (VAT-ready)
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,      -- รวมก่อนลด/VAT
    discount DECIMAL(10,2) DEFAULT 0,               -- ส่วนลดท้ายบิล (บาท)
    vat_amount DECIMAL(10,2) DEFAULT 0,             -- VAT (เก็บเผื่ออนาคต)
    vat_included BOOLEAN DEFAULT true,              -- ราคายารวม VAT แล้วหรือไม่
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,  -- ยอดสุทธิ
    
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
    paid_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_transactions_patient ON transactions(patient_id);
CREATE INDEX idx_transactions_staff ON transactions(staff_id);
CREATE INDEX idx_transactions_prescription ON transactions(prescription_id);
CREATE INDEX idx_transactions_paid_at ON transactions(paid_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_status_paid_at ON transactions(status, paid_at DESC);

-- ✨ กันจ่ายซ้ำ (Partial Unique Index)
CREATE UNIQUE INDEX uniq_paid_tx_per_prescription
ON transactions(prescription_id) WHERE status = 'paid';
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | รหัสธุรกรรม |
| receipt_no | TEXT | UNIQUE, NOT NULL | เลขที่ใบเสร็จ (RC-YYYYMMDD-XXXX) |
| prescription_id | UUID | FK → prescriptions | ใบสั่งยาที่อ้างอิง (nullable) |
| patient_id | UUID | FK → patients | ผู้ป่วย |
| staff_id | UUID | FK → users | พนักงานผู้ทำรายการ |
| **status** | TEXT | CHECK | paid/voided (no pending) ✨ Sprint 2A |
| **voided_at** | TIMESTAMPTZ | - | เวลาที่ยกเลิก ✨ Sprint 2A |
| **voided_by** | UUID | FK → users | ใครยกเลิก ✨ Sprint 2A |
| **void_reason** | TEXT | - | เหตุผลการยกเลิก ✨ Sprint 2A |
| **subtotal** | DECIMAL(10,2) | NOT NULL | รวมก่อนหักส่วนลด ✨ |
| **discount** | DECIMAL(10,2) | DEFAULT 0 | ส่วนลดท้ายบิล (บาท) ✨ |
| **vat_amount** | DECIMAL(10,2) | DEFAULT 0 | VAT 7% (เตรียมไว้อนาคต) ✨ |
| **vat_included** | BOOLEAN | DEFAULT true | ราคายารวม VAT แล้ว ✨ |
| total_amount | DECIMAL(10,2) | NOT NULL | ยอดสุทธิ |
| payment_method | TEXT | CHECK | cash/card/transfer |
| paid_at | TIMESTAMPTZ | DEFAULT now() | วันเวลาที่ชำระ |
| notes | TEXT | - | หมายเหตุ |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่สร้าง |

> **หมายเหตุ MVP:** `vat_amount = 0` และซ่อน VAT ใน UI จนกว่าจะจด VAT

---

### 7. transaction_items (รายการในใบเสร็จ - Detail)

```sql
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL DEFAULT 'medicine' CHECK (item_type IN ('medicine', 'procedure')),  -- ✨
    medicine_id UUID REFERENCES medicines(id),  -- nullable ถ้าเป็น procedure
    procedure_name TEXT,  -- ✨
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_medicine ON transaction_items(medicine_id);
CREATE INDEX idx_transaction_items_type ON transaction_items(item_type);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-----------|
| id | UUID | PK | รหัสรายการ |
| transaction_id | UUID | FK → transactions | ธุรกรรม |
| item_type | TEXT | CHECK | medicine / procedure ✨ |
| medicine_id | UUID | FK → medicines | ยาที่จ่าย (nullable) |
| procedure_name | TEXT | - | ชื่อหัตถการ ✨ |
| quantity | INTEGER | NOT NULL, > 0 | จำนวน |
| unit_price | DECIMAL(10,2) | NOT NULL | ราคาต่อหน่วย |
| amount | DECIMAL(10,2) | NOT NULL | จำนวนเงิน (qty × price) |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันที่สร้าง |

---

### 8. stock_logs (ประวัติการเคลื่อนไหวสต๊อก)

```sql
CREATE TABLE stock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    changed_by UUID NOT NULL REFERENCES users(id),
    change_type TEXT NOT NULL CHECK (change_type IN ('restock', 'dispense', 'adjust', 'initial')),
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_stock_logs_medicine ON stock_logs(medicine_id);
CREATE INDEX idx_stock_logs_changed_by ON stock_logs(changed_by);
CREATE INDEX idx_stock_logs_type ON stock_logs(change_type);
CREATE INDEX idx_stock_logs_created ON stock_logs(created_at DESC);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | รหัส log |
| medicine_id | UUID | FK → medicines | ยาที่เปลี่ยนแปลง |
| changed_by | UUID | FK → users | ผู้ทำการเปลี่ยนแปลง |
| change_type | TEXT | CHECK | restock/dispense/adjust/initial |
| quantity_change | INTEGER | NOT NULL | จำนวนที่เปลี่ยน (+/-) |
| quantity_before | INTEGER | NOT NULL | จำนวนก่อนเปลี่ยน |
| quantity_after | INTEGER | NOT NULL | จำนวนหลังเปลี่ยน |
| reference_type | TEXT | - | ประเภทอ้างอิง (transaction/prescription/manual) |
| reference_id | UUID | - | รหัสอ้างอิง |
| notes | TEXT | - | หมายเหตุ |
| created_at | TIMESTAMPTZ | DEFAULT now() | วันเวลา |

---

## Helper Functions

### 1. Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Generate Prescription Number

```sql
CREATE OR REPLACE FUNCTION generate_prescription_no()
RETURNS TEXT AS $$
DECLARE
    today_count INTEGER;
    new_no TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO today_count
    FROM prescriptions
    WHERE DATE(created_at) = CURRENT_DATE;
    
    new_no := 'RX-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
    RETURN new_no;
END;
$$ LANGUAGE plpgsql;
```

### 3. Generate Receipt Number

```sql
CREATE OR REPLACE FUNCTION generate_receipt_no()
RETURNS TEXT AS $$
DECLARE
    today_count INTEGER;
    new_no TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO today_count
    FROM transactions
    WHERE DATE(created_at) = CURRENT_DATE;
    
    new_no := 'RC-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
    RETURN new_no;
END;
$$ LANGUAGE plpgsql;
```

### 4. Generate HN (Hospital Number)

```sql
CREATE OR REPLACE FUNCTION generate_hn()
RETURNS TEXT AS $$
DECLARE
    last_hn TEXT;
    next_num INTEGER;
    new_hn TEXT;
BEGIN
    SELECT hn INTO last_hn
    FROM patients
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF last_hn IS NULL THEN
        next_num := 1;
    ELSE
        next_num := CAST(SUBSTRING(last_hn FROM 3) AS INTEGER) + 1;
    END IF;
    
    new_hn := 'HN' || LPAD(next_num::TEXT, 6, '0');
    RETURN new_hn;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

### 1. Auto-update Triggers

```sql
-- Users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Patients
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Medicines
CREATE TRIGGER update_medicines_updated_at
    BEFORE UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prescriptions
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
```

### Policy Examples (Phase 3)

```sql
-- Users: All authenticated users can read
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Patients: Staff and Admin can CRUD, Doctor can read
CREATE POLICY "Staff/Admin can manage patients"
    ON patients FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Doctor can view patients"
    ON patients FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'doctor'
        )
    );

-- Prescriptions: Doctor can create, Staff/Admin can update status
CREATE POLICY "Doctor can create prescriptions"
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

---

## Seed Data

### Sample Users

```sql
-- ต้องสร้างผ่าน Supabase Auth ก่อน แล้ว insert ลง users table

-- Example (หลังจากสร้าง auth users แล้ว):
INSERT INTO users (id, email, full_name, role) VALUES
    ('uuid-admin-here', 'admin@kkclinic.com', 'ผู้ดูแลระบบ', 'admin'),
    ('uuid-doctor-here', 'doctor@kkclinic.com', 'นพ.ทดสอบ ระบบ', 'doctor'),
    ('uuid-staff-here', 'staff@kkclinic.com', 'พนักงาน ทดสอบ', 'staff');
```

### Sample Medicines

```sql
INSERT INTO medicines (code, name, unit, price, stock_qty, min_stock) VALUES
    ('MED001', 'พาราเซตามอล 500mg', 'แผง', 15.00, 100, 20),
    ('MED002', 'ยาแก้ไอน้ำดำ', 'ขวด', 45.00, 50, 10),
    ('MED003', 'ยาแก้แพ้ Loratadine', 'แผง', 35.00, 80, 15),
    ('MED004', 'ยาลดกรด Antacid', 'ขวด', 55.00, 40, 10),
    ('MED005', 'ครีมทาแผล', 'หลอด', 25.00, 60, 10);
```

---

## Migration Order

1. Create helper functions (`update_updated_at_column`, generators)
2. Create `users` table
3. Create `patients` table
4. Create `medicines` table
5. Create `prescriptions` table
6. Create `prescription_items` table
7. Create `transactions` table
8. Create `transaction_items` table
9. Create `stock_logs` table
10. Create triggers
11. Enable RLS (Phase 3)
12. Insert seed data

---

## Future Enhancements (Phase 4+)

### stock_batches (รองรับ LOT/วันหมดอายุ)

> **หมายเหตุ:** ยังไม่สร้างใน MVP - ใช้ `notes` ใน stock_logs แทนไปก่อน

```sql
-- สำหรับอนาคตเมื่อคลินิกต้องการ track ยาเฉพาะล็อต

CREATE TABLE stock_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    lot_no TEXT,
    expiry_date DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_stock_batches_medicine ON stock_batches(medicine_id);
CREATE INDEX idx_stock_batches_expiry ON stock_batches(expiry_date);

-- เพิ่ม FK ใน stock_logs (เมื่อพร้อม)
ALTER TABLE stock_logs ADD COLUMN batch_id UUID REFERENCES stock_batches(id);
```

**Use Cases:**
- จ่ายยาแบบ FIFO (หมดอายุก่อนออกก่อน)
- แจ้งเตือนยาใกล้หมดอายุ
- Recall ยาตามหมายเลขล็อต

---

### is_demo Column Usage

```sql
-- ลบข้อมูล demo ทั้งหมด

DELETE FROM prescription_items WHERE prescription_id IN (
    SELECT id FROM prescriptions WHERE patient_id IN (
        SELECT id FROM patients WHERE is_demo = true
    )
);
DELETE FROM prescriptions WHERE patient_id IN (
    SELECT id FROM patients WHERE is_demo = true
);
DELETE FROM patients WHERE is_demo = true;
DELETE FROM medicines WHERE is_demo = true;
DELETE FROM users WHERE is_demo = true;

-- หรือใช้ RLS ซ่อน demo data จาก production view
CREATE POLICY "Hide demo data in production"
    ON patients FOR SELECT
    USING (is_demo = false OR current_setting('app.show_demo', true) = 'true');
```

---

## Version History

| Version | Date | Changes |
|---------|------|------|
| 1.0 | 2026-01-17 | Initial schema |
| 1.1 | 2026-01-17 | Added `item_type`, `procedure_name`, `price_override`, `total_price`, `cancelled_reason`, `completed_at`, `last_login_at`, `is_demo` |
| **1.2** | **2026-01-18** | **Sprint 2A:** Added `dosage_instruction`, `status`, `voided_at`, `voided_by`, `void_reason`, stock audit index |

---

## Pending Migrations (Sprint 2A)

> ⚠️ **Run these migrations before deploying Sprint 2A features**

```sql
-- ============================================
-- Sprint 2A Migration Script (Robust Version)
-- ============================================

-- 0) Normalize existing data first
-- กัน dirty data จากการทดลอง (NULL, '', 'pending' หรืออื่น ๆ)
UPDATE transactions
SET status = 'paid'
WHERE status IS NULL OR status NOT IN ('paid', 'voided');

-- 1) Add dosage instruction for labels
ALTER TABLE prescription_items
ADD COLUMN IF NOT EXISTS dosage_instruction TEXT;

-- 2) Add void columns + idempotency key
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS void_reason TEXT,
ADD COLUMN IF NOT EXISTS request_id UUID;

-- request_id unique index (ใช้ partial กัน NULL สำหรับ tx เก่า)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_transactions_request_id
ON transactions(request_id)
WHERE request_id IS NOT NULL;

-- 3) Ensure status default (ถ้าคอลัมน์ status มีอยู่แล้ว)
ALTER TABLE transactions
ALTER COLUMN status SET DEFAULT 'paid';

-- 4) Status constraint (paid/voided only)
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions
ADD CONSTRAINT transactions_status_check
CHECK (status IN ('paid', 'voided'));

-- 5) Void consistency check (ครบทั้ง 3 fields)
-- ถ้า voided ต้องมี voided_at, void_reason, และ voided_by
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_void_consistency_check;
ALTER TABLE transactions
ADD CONSTRAINT transactions_void_consistency_check
CHECK (
  status <> 'voided'
  OR (voided_at IS NOT NULL AND void_reason IS NOT NULL AND voided_by IS NOT NULL)
);

-- 6) Prevent double payment (partial unique index)
-- void แล้วจ่ายใหม่ได้ แต่ paid ซ้ำไม่ได้
-- กัน NULL prescription_id ด้วยเพื่อความชัดเจนและลด index size
CREATE UNIQUE INDEX IF NOT EXISTS uniq_paid_tx_per_prescription
ON transactions(prescription_id)
WHERE status = 'paid' AND prescription_id IS NOT NULL;

-- 7) Index for stock audit trail
CREATE INDEX IF NOT EXISTS idx_stock_logs_medicine_date
ON stock_logs(medicine_id, created_at DESC);

-- 8) Indexes for Daily Sales (ใช้ชื่อใหม่กัน collision กับ index เดิม)
-- ใช้ suffix _paid เพื่อบอกว่าเป็น partial index
CREATE INDEX IF NOT EXISTS idx_transactions_paid_at_paid
ON transactions(paid_at DESC)
WHERE status = 'paid';

CREATE INDEX IF NOT EXISTS idx_transactions_paid_method_paid_at
ON transactions(payment_method, paid_at DESC)
WHERE status = 'paid';
```

---

## Future Migrations (Sprint 3)

```sql
-- Low stock threshold (2 levels)
ALTER TABLE medicines 
ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 10,
ADD COLUMN IF NOT EXISTS critical_threshold INT DEFAULT 3;
```


-- Migration: Add closed_at and closed_by columns to transactions
-- Sprint 5: Close Transaction (ปิดงาน) feature
-- Date: 2026-01-25

-- Add columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES users(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_transactions_closed_at ON transactions(closed_at);
CREATE INDEX IF NOT EXISTS idx_transactions_paid_closed ON transactions(paid_at, closed_at);

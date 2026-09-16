-- ==============================================================================
-- FIX CHECK CONSTRAINT STATUS TRANSAKSI DI SUPABASE
-- Jalankan query berikut di SQL Editor Supabase untuk mengatasi error:
-- "violates check constraint 'transactions_status_check'"
-- ==============================================================================

-- 1. Hapus batasan check constraint lama
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- 2. Tambahkan kembali check constraint dengan menyertakan status 'waiting_verification'
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
CHECK (status IN (
  'pending',
  'waiting_verification',
  'paid',
  'success',
  'settlement',
  'failed',
  'expired',
  'cancel'
));

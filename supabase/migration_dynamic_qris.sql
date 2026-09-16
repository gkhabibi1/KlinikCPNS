-- ==============================================================================
-- MIGRASI SISTEM PEMBAYARAN QRIS DINAMIS & VERIFIKASI BUKTI TRANSFER
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- ==============================================================================

-- 1. Tambah kolom pendukung di tabel transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS base_amount NUMERIC DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS unique_code INTEGER DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS qris_payload TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 1b. Perbarui Check Constraint Status Transaksi agar mengizinkan 'waiting_verification'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'waiting_verification', 'paid', 'success', 'settlement', 'failed', 'expired', 'cancel'));

-- 2. Index untuk mempercepat pengecekan kode unik pending
CREATE INDEX IF NOT EXISTS idx_transactions_unique_code_status 
ON transactions(unique_code, status, expired_at);

-- 3. Storage Bucket untuk Bukti Pembayaran (payment-proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy agar user terautentikasi dan anonim dapat upload/baca bukti transfer
DROP POLICY IF EXISTS "Public Read Payment Proofs" ON storage.objects;
CREATE POLICY "Public Read Payment Proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Allow Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Allow Upload Payment Proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Allow Update Payment Proofs" ON storage.objects;
CREATE POLICY "Allow Update Payment Proofs" ON storage.objects
FOR UPDATE USING (bucket_id = 'payment-proofs');

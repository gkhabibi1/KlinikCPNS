-- Migrasi AI Quality & Difficulty Calibrator pada tabel Bank Soal (question_bank)
-- Jalankan SQL ini di Supabase SQL Editor

ALTER TABLE question_bank
  ADD COLUMN IF NOT EXISTS is_ai_calibrated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_calibrated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_calibration_notes TEXT,
  ADD COLUMN IF NOT EXISTS original_question_backup JSONB;

CREATE INDEX IF NOT EXISTS idx_question_bank_is_ai_calibrated
  ON question_bank (is_ai_calibrated);

CREATE INDEX IF NOT EXISTS idx_question_bank_calibration_queue
  ON question_bank (is_ai_calibrated, created_at ASC)
  WHERE is_ai_calibrated = false;

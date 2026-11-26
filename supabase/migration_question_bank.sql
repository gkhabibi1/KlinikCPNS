-- Migrasi Fitur Bank Soal (Admin Only)
-- Jalankan SQL ini di Supabase SQL Editor untuk penyimpanan permanen Bank Soal

CREATE TABLE IF NOT EXISTS question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_question_id UUID,
  source_package_id UUID REFERENCES tryout_packages(id) ON DELETE SET NULL,
  source_package_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('TWK', 'TIU', 'TKP')),
  sub_category TEXT NOT NULL DEFAULT 'Umum',
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  option_a TEXT NOT NULL DEFAULT '',
  option_a_image_url TEXT,
  option_b TEXT NOT NULL DEFAULT '',
  option_b_image_url TEXT,
  option_c TEXT NOT NULL DEFAULT '',
  option_c_image_url TEXT,
  option_d TEXT NOT NULL DEFAULT '',
  option_d_image_url TEXT,
  option_e TEXT NOT NULL DEFAULT '',
  option_e_image_url TEXT,
  correct_answer TEXT NOT NULL DEFAULT 'A',
  explanation TEXT,
  tkp_scores JSONB,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_question_bank_source_question_id
  ON question_bank(source_question_id)
  WHERE source_question_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_sub_category ON question_bank(sub_category);
CREATE INDEX IF NOT EXISTS idx_question_bank_source_pkg ON question_bank(source_package_id);

-- Aktifkan RLS agar hanya Admin yang dapat mengakses Bank Soal
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Only Question Bank" ON question_bank;
CREATE POLICY "Admin Only Question Bank" ON question_bank
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR COALESCE(auth.jwt() ->> 'email', '') = 'gkhabibi1@gmail.com'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR COALESCE(auth.jwt() ->> 'email', '') = 'gkhabibi1@gmail.com'
  );

-- Backfill otomatis seluruh soal tryout yang sudah ada ke question_bank
INSERT INTO question_bank (
  source_question_id,
  source_package_id,
  source_package_name,
  category,
  sub_category,
  question_text,
  question_image_url,
  option_a,
  option_a_image_url,
  option_b,
  option_b_image_url,
  option_c,
  option_c_image_url,
  option_d,
  option_d_image_url,
  option_e,
  option_e_image_url,
  correct_answer,
  explanation,
  tkp_scores
)
SELECT
  q.id,
  q.package_id,
  tp.name,
  CASE
    WHEN UPPER(COALESCE(q.question_category, q.category, 'TWK')) LIKE '%TIU%' THEN 'TIU'
    WHEN UPPER(COALESCE(q.question_category, q.category, 'TWK')) LIKE '%TKP%' THEN 'TKP'
    ELSE 'TWK'
  END,
  CASE
    WHEN UPPER(COALESCE(q.question_category, q.category, 'TWK')) LIKE '%TIU%' THEN 'TIU Umum'
    WHEN UPPER(COALESCE(q.question_category, q.category, 'TWK')) LIKE '%TKP%' THEN 'TKP Umum'
    ELSE 'TWK Umum'
  END,
  q.question_text,
  q.question_image_url,
  COALESCE(q.option_a, ''),
  q.option_a_image_url,
  COALESCE(q.option_b, ''),
  q.option_b_image_url,
  COALESCE(q.option_c, ''),
  q.option_c_image_url,
  COALESCE(q.option_d, ''),
  q.option_d_image_url,
  COALESCE(q.option_e, ''),
  q.option_e_image_url,
  COALESCE(q.correct_answer, 'A'),
  q.explanation,
  q.tkp_scores
FROM questions q
LEFT JOIN tryout_packages tp ON tp.id = q.package_id
ON CONFLICT (source_question_id) WHERE source_question_id IS NOT NULL DO NOTHING;

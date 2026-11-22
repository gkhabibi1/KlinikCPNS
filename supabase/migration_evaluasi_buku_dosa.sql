-- ==============================================================================
-- Migration: Tabel user_mistakes untuk Fitur Buku Evaluasi / Bank Soal Salah
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_mistakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID,
  package_id UUID,
  package_name TEXT,
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  explanation TEXT,
  category TEXT NOT NULL CHECK (category IN ('TWK', 'TIU', 'TKP')),
  is_mastered BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing untuk kecepatan pencarian data soal salah per user
CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_category ON user_mistakes(category);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_is_mastered ON user_mistakes(is_mastered);

-- Aktifkan RLS dan Policy Akses
ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public All Access User Mistakes" ON user_mistakes;
CREATE POLICY "Public All Access User Mistakes" ON user_mistakes FOR ALL USING (true);

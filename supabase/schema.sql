-- 1. Buat tabel paket tryout
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat tabel user profiles (terhubung otomatis dengan sistem login auth)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat tabel soal (questions)
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('TWK', 'TIU', 'TKP')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- Contoh: 'A', 'B', 'C', 'D', 'E'
  tkp_scores JSONB, -- Khusus TKP, simpan skor tiap opsi misal: {"A":5, "B":4, "C":3, "D":2, "E":1}
  discussion_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buat tabel transaksi (untuk Midtrans)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  midtrans_order_id TEXT UNIQUE,
  snap_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Buat tabel hasil ujian (exam_results)
CREATE TABLE exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  score_twk INTEGER DEFAULT 0,
  score_tiu INTEGER DEFAULT 0,
  score_tkp INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  is_passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Buat tabel paket langganan (subscription_packages)
CREATE TABLE subscription_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Kebijakan Akses (Public Read)
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memungkinkan pembacaan paket langganan aktif untuk semua user"
  ON subscription_packages FOR SELECT
  USING (true);

-- 7. Tabel 30 Day Challenge Packages (challenge_packages)
CREATE TABLE challenge_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER UNIQUE NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  package_id UUID REFERENCES tryout_packages(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policy
ALTER TABLE challenge_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Challenge Packages" ON challenge_packages FOR SELECT USING (true);
CREATE POLICY "Admin All Access Challenge Packages" ON challenge_packages FOR ALL USING (true);

-- 8. Tabel Challenge Progress User (challenge_progress)
CREATE TABLE challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_day INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'failed', 'completed')),
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policy
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Progress Access" ON challenge_progress FOR ALL USING (auth.uid() = user_id);

-- 9. Tabel Score Harian Challenge (challenge_daily_scores)
CREATE TABLE challenge_daily_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  progress_id UUID REFERENCES challenge_progress(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  exam_result_id UUID REFERENCES exam_results(id) ON DELETE SET NULL,
  skor_twk INTEGER DEFAULT 0,
  skor_tiu INTEGER DEFAULT 0,
  skor_tkp INTEGER DEFAULT 0,
  skor_total INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policy
ALTER TABLE challenge_daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Daily Scores Access" ON challenge_daily_scores FOR ALL USING (
  EXISTS (
    SELECT 1 FROM challenge_progress 
    WHERE challenge_progress.id = challenge_daily_scores.progress_id 
    AND challenge_progress.user_id = auth.uid()
  )
);

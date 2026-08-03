-- ==============================================================================
-- MASTER SCHEMA DISAMPAIKAN UNTUK APLIKASI TRY OUT CPNS (SUPABASE)
-- Silakan jalankan seluruh kueri ini di menu SQL Editor pada Dashboard Supabase.
-- ==============================================================================

-- 1. Tabel Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  place_of_birth TEXT,
  date_of_birth TEXT,
  gender TEXT,
  role TEXT DEFAULT 'member',
  subscription_package_id UUID,
  subscription_valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_package_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS place_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "User All Access Profiles" ON profiles;
CREATE POLICY "User All Access Profiles" ON profiles FOR ALL USING (auth.uid() = id);

-- 2. Tabel Tryout Packages (tryout_packages)
CREATE TABLE IF NOT EXISTS tryout_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  exam_type TEXT DEFAULT 'CPNS' NOT NULL,
  show_explanation BOOLEAN DEFAULT true NOT NULL,
  duration_minutes INTEGER DEFAULT 100,
  passing_score_twk INTEGER DEFAULT 65,
  passing_score_tiu INTEGER DEFAULT 80,
  passing_score_tkp INTEGER DEFAULT 166,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tryout_packages ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'CPNS' NOT NULL;
ALTER TABLE tryout_packages ADD COLUMN IF NOT EXISTS show_explanation BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE tryout_packages ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE tryout_packages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE tryout_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Tryout Packages" ON tryout_packages;
CREATE POLICY "Public Read Tryout Packages" ON tryout_packages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Tryout Packages" ON tryout_packages;
CREATE POLICY "Admin All Access Tryout Packages" ON tryout_packages FOR ALL USING (true);

-- 3. Tabel Questions (questions)
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES tryout_packages(id) ON DELETE CASCADE,
  question_number INTEGER DEFAULT 1,
  question_category TEXT DEFAULT 'TWK',
  category TEXT DEFAULT 'TWK',
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  option_a TEXT NOT NULL,
  option_a_image_url TEXT,
  option_b TEXT NOT NULL,
  option_b_image_url TEXT,
  option_c TEXT NOT NULL,
  option_c_image_url TEXT,
  option_d TEXT NOT NULL,
  option_d_image_url TEXT,
  option_e TEXT NOT NULL,
  option_e_image_url TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  tkp_scores JSONB,
  discussion_text TEXT,
  discussion_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_number INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_category TEXT DEFAULT 'TWK';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'TWK';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_a_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_b_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_c_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_d_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS discussion_image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS tkp_scores JSONB;

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Questions" ON questions;
CREATE POLICY "Public Read Questions" ON questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Questions" ON questions;
CREATE POLICY "Admin All Access Questions" ON questions FOR ALL USING (true);

-- 4. Tabel Subscription Packages (subscription_packages)
CREATE TABLE IF NOT EXISTS subscription_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  duration_months INTEGER DEFAULT 1,
  benefits JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Subscription Packages" ON subscription_packages;
CREATE POLICY "Public Read Subscription Packages" ON subscription_packages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Subscription Packages" ON subscription_packages;
CREATE POLICY "Admin All Access Subscription Packages" ON subscription_packages FOR ALL USING (true);

-- 5. Tabel Subscription Benefits (subscription_benefits)
CREATE TABLE IF NOT EXISTS subscription_benefits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES subscription_packages(id) ON DELETE CASCADE,
  benefit_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subscription_benefits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Subscription Benefits" ON subscription_benefits;
CREATE POLICY "Public Read Subscription Benefits" ON subscription_benefits FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Subscription Benefits" ON subscription_benefits;
CREATE POLICY "Admin All Access Subscription Benefits" ON subscription_benefits FOR ALL USING (true);

-- 6. Tabel Transactions (transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  midtrans_order_id TEXT UNIQUE,
  snap_token TEXT,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public All Access Transactions" ON transactions;
CREATE POLICY "Public All Access Transactions" ON transactions FOR ALL USING (true);

-- 7. Tabel Exam Results (exam_results)
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES tryout_packages(id) ON DELETE CASCADE,
  skor_twk INTEGER DEFAULT 0,
  skor_tiu INTEGER DEFAULT 0,
  skor_tkp INTEGER DEFAULT 0,
  skor_total INTEGER DEFAULT 0,
  score_twk INTEGER DEFAULT 0,
  score_tiu INTEGER DEFAULT 0,
  score_tkp INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS skor_twk INTEGER DEFAULT 0;
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS skor_tiu INTEGER DEFAULT 0;
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS skor_tkp INTEGER DEFAULT 0;
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS skor_total INTEGER DEFAULT 0;
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public All Access Exam Results" ON exam_results;
CREATE POLICY "Public All Access Exam Results" ON exam_results FOR ALL USING (true);

-- 8. Tabel Challenge Packages (challenge_packages)
CREATE TABLE IF NOT EXISTS challenge_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER UNIQUE NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  package_id UUID REFERENCES tryout_packages(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE challenge_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Challenge Packages" ON challenge_packages;
CREATE POLICY "Public Read Challenge Packages" ON challenge_packages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Challenge Packages" ON challenge_packages;
CREATE POLICY "Admin All Access Challenge Packages" ON challenge_packages FOR ALL USING (true);

-- Seed 30 hari paket challenge secara otomatis jika belum ada
INSERT INTO challenge_packages (day_number, is_active)
SELECT generate_series(1, 30), true
ON CONFLICT (day_number) DO NOTHING;

-- 9. Tabel Challenge Progress (challenge_progress)
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_day INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'failed', 'completed')),
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User Progress Access" ON challenge_progress;
CREATE POLICY "User Progress Access" ON challenge_progress FOR ALL USING (true);

-- 10. Tabel Challenge Daily Scores (challenge_daily_scores)
CREATE TABLE IF NOT EXISTS challenge_daily_scores (
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

ALTER TABLE challenge_daily_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User Daily Scores Access" ON challenge_daily_scores;
CREATE POLICY "User Daily Scores Access" ON challenge_daily_scores FOR ALL USING (true);

-- 11. Tabel Banners Promosi (promotional_banners)
CREATE TABLE IF NOT EXISTS promotional_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  target_link TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS target_link TEXT;
ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Banners" ON promotional_banners;
CREATE POLICY "Public Read Banners" ON promotional_banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Banners" ON promotional_banners;
CREATE POLICY "Admin All Access Banners" ON promotional_banners FOR ALL USING (true);

-- 12. Tabel Latest Updates (latest_updates)
CREATE TABLE IF NOT EXISTS latest_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'info',
  is_important BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE latest_updates ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE latest_updates ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE latest_updates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'info';
ALTER TABLE latest_updates ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE latest_updates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE latest_updates ADD COLUMN IF NOT EXISTS published_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE latest_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Updates" ON latest_updates;
CREATE POLICY "Public Read Updates" ON latest_updates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Updates" ON latest_updates;
CREATE POLICY "Admin All Access Updates" ON latest_updates FOR ALL USING (true);

-- 13. Tabel Material Categories & Materials
CREATE TABLE IF NOT EXISTS material_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE material_categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE material_categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE material_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE material_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE material_categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Material Categories" ON material_categories;
CREATE POLICY "Public Read Material Categories" ON material_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Material Categories" ON material_categories;
CREATE POLICY "Admin All Access Material Categories" ON material_categories FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES material_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  youtube_url TEXT,
  thumbnail_url TEXT,
  reading_time INTEGER DEFAULT 5,
  is_premium BOOLEAN DEFAULT false NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE materials ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Materials" ON materials;
CREATE POLICY "Public Read Materials" ON materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Materials" ON materials;
CREATE POLICY "Admin All Access Materials" ON materials FOR ALL USING (true);

-- 14. Tabel Notifications (notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User All Access Notifications" ON notifications;
CREATE POLICY "User All Access Notifications" ON notifications FOR ALL USING (true);

-- 15. Tabel System Settings (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public All Access System Settings" ON system_settings;
CREATE POLICY "Public All Access System Settings" ON system_settings FOR ALL USING (true);

-- 16. Tabel Voucher Batches (voucher_batches)
CREATE TABLE IF NOT EXISTS voucher_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purpose TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE voucher_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Voucher Batches" ON voucher_batches;
CREATE POLICY "Public Read Voucher Batches" ON voucher_batches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Voucher Batches" ON voucher_batches;
CREATE POLICY "Admin All Access Voucher Batches" ON voucher_batches FOR ALL USING (true);

-- 17. Tabel Voucher Codes (voucher_codes)
CREATE TABLE IF NOT EXISTS voucher_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES voucher_batches(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'percent' NOT NULL,
  value NUMERIC DEFAULT 0 NOT NULL,
  max_uses INTEGER DEFAULT 1 NOT NULL,
  current_uses INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE voucher_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Voucher Codes" ON voucher_codes;
CREATE POLICY "Public Read Voucher Codes" ON voucher_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Access Voucher Codes" ON voucher_codes;
CREATE POLICY "Admin All Access Voucher Codes" ON voucher_codes FOR ALL USING (true);

-- 18. Tabel Vouchers (vouchers)
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public All Access Vouchers" ON vouchers;
CREATE POLICY "Public All Access Vouchers" ON vouchers FOR ALL USING (true);

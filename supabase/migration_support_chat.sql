-- ==============================================================================
-- Migration: Tabel support_messages untuk Sistem Live Chat Member & Panel Admin
-- ==============================================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  user_name TEXT,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),
  sender_name TEXT,
  message TEXT NOT NULL,
  is_read_by_admin BOOLEAN DEFAULT false NOT NULL,
  is_read_by_user BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom sender_name ada jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Indexing untuk kecepatan pencarian data chat
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_is_read_admin ON support_messages(is_read_by_admin);

-- Aktifkan RLS dan Policy Akses
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public All Access Support Messages" ON support_messages;
CREATE POLICY "Public All Access Support Messages" ON support_messages FOR ALL USING (true);

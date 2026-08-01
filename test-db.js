/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data, error } = await supabase.from('exam_results').insert({
      package_id: 'a00b4411-0f33-4492-a7b2-b4fb8c09906a' // tryout_packages ID
    }).select();
    console.log('Insert Result:', data);
    console.error('Insert Error:', error);
  } catch (e) {
    console.error(e);
  }
}

test();

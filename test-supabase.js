const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('analyses').select('*').limit(1);
  console.log('analyses table check:', data, error);

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  console.log('buckets check:', buckets, bucketError);
}

test();

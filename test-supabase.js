import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgucshalppopducyidud.supabase.co'
const supabaseKey = 'sb_publishable_cNCMu7jVSRlW55NAW6SURQ_gWBM0uWD'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  try {
    console.log("Testing insert...");
    const { data, error } = await supabase
      .from('players')
      .insert([{ username: 'testuser' }])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase Error on Insert:", error);
    } else {
      console.log("Success Insert! Data:", data);
    }
  } catch (err) {
    console.error("Catch Error:", err.message);
  }
}

testInsert();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgucshalppopducyidud.supabase.co'
const supabaseKey = 'sb_publishable_cNCMu7jVSRlW55NAW6SURQ_gWBM0uWD'

export const supabase = createClient(supabaseUrl, supabaseKey)

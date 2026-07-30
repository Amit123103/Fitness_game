import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cwoyapsdkrqjnywmgjau.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_xX_jd8Y-49_03FdtaC9O7Q_QhWGk-J4';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase Client initialized successfully.');
//# sourceMappingURL=db.js.map
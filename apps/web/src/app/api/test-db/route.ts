import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from('drivers').select('*').limit(1);
  return NextResponse.json({ data, error });
}

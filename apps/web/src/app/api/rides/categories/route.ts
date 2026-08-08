import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: categories, error } = await supabase
      .from('ride_categories')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

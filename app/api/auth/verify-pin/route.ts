import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    // Validate PIN format
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Get current user
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user: currentUser }, error: currentUserError } = await anonSupabase.auth.getUser(token);
    
    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found or token invalid' },
        { status: 401 }
      );
    }

    // Get user's stored PIN hash
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pin_hash')
      .eq('id', currentUser.id)
      .single();

    if (userError || !userData) {
      console.error('[v0] User fetch error:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Compare provided PIN with stored hash
    const isValidPin = await bcrypt.compare(pin, userData.pin_hash);

    if (!isValidPin) {
      console.warn(`[v0] Invalid PIN attempt for user ${currentUser.id}`);
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Update last PIN verification time
    await supabase
      .from('users')
      .update({
        last_pin_verified_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id)
      .catch(err => console.error('[v0] Failed to update verification time:', err));

    return NextResponse.json(
      { success: true, message: 'PIN verified successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Verify PIN error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

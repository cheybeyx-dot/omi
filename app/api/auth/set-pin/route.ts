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

    // Verify token and get user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(token.split('.')[1] ? token : '');

    // Alternative: Use anon key to get current user
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

    // Hash PIN with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    // Update user PIN in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        pin_hash: hashedPin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id);

    if (updateError) {
      console.error('[v0] PIN update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to set PIN' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'PIN set successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Set PIN error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

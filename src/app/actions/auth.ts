'use server'

import { createClient } from '@/lib/supabase/server'

// Helper function to ensure a user record exists in our users table
async function ensureUserExists(userId: string, email: string, authProvider: string = 'email'): Promise<void> {
  const supabase = await createClient();
  
  // Check if user already exists in our custom users table
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking if user exists:', checkError);
    return;
  }
  
  // If user doesn't exist, create a new record
  if (!existingUser) {
    console.log(`Creating new user record for ${userId} (${email})`);
    const now = new Date().toISOString();
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        auth_provider: authProvider,
        last_login: now,
        created_at: now,
        music_enabled: false,
        sound_enabled: false
      });
    
    if (insertError) {
      console.error('Error creating user record:', insertError);
    }
  } else {
    // Update last_login if user exists
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user last_login:', updateError);
    }
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  // type-cast to avoid errors
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }
  
  // Ensure user exists in our users table
  if (authData?.user) {
    const authProvider = authData.user.app_metadata?.provider || 'email';
    await ensureUserExists(authData.user.id, authData.user.email || data.email, authProvider);
  }

  return { success: true }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  // type-cast to avoid errors
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }
  
  // Create a user record in our users table
  // Note: For sign up, we create the user record even though the email
  // verification might be pending, as we'll need it when they confirm
  if (authData?.user) {
    // For sign up with email/password, the provider is 'email'
    await ensureUserExists(authData.user.id, authData.user.email || data.email, 'email');
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // If session exists, ensure user exists in our users table
  if (session?.user) {
    const authProvider = session.user.app_metadata?.provider || 'email';
    await ensureUserExists(session.user.id, session.user.email || '', authProvider);
  }
  
  return session
}

// Exported helper for other modules to use
export async function ensureUserRecordExists(userId: string, email: string = '', authProvider: string = 'email'): Promise<boolean> {
  try {
    await ensureUserExists(userId, email, authProvider);
    return true;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return false;
  }
}

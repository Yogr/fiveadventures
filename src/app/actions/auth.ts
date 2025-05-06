'use server';

import { createClient } from '@/lib/supabase/server';

// Authentication functions
export async function signInWithGoogle() {
  const supabase = await createClient();
  
  // Get site URL with fallback to localhost for development
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localshmost:3000';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { url: data.url };
}

// Handle OAuth callback
export async function handleAuthCallback() {
  const supabase = await createClient();
  
  try {
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No user found in session', user: null };
    }
    
    // Ensure user record exists in the database
    const result = await ensureUserRecordExists(
      user.id, 
      user.email || '', 
      user.app_metadata?.provider || 'email'
    );
    
    if (result.error) {
      return { success: false, error: result.error, user };
    }
    
    return { success: true, user };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error during authentication';
    console.error('Error in handleAuthCallback:', error);
    return { success: false, error, user: null };
  }
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true, user: data.user };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true, user: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return { error: error.message };
  }
  
  return { success: true };
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return data;
}

// Ensure a user record exists in the database
export async function ensureUserRecordExists(userId: string, email: string = '', provider: string = 'email') {
  const supabase = await createClient();
  
  // Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking for user existence:', checkError);
    return { error: checkError.message };
  }
  
  // If user doesn't exist, create them
  if (!existingUser) {
    const { error: createError } = await supabase
      .from('users')
      .insert({ 
        id: userId,
        email: email,
        auth_provider: provider,
        status: 'basic' // Default to basic status
      });
      
    if (createError) {
      console.error('Error creating user record:', createError);
      return { error: createError.message };
    }
  }
  
  return { success: true };
}

// Admin-related functions
export async function isUserAdmin() {
  // Get the current user session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If no session, user is not authenticated
  if (!user) {
    return false;
  }
  
  // Check if user has admin status
  const { data: userData } = await supabase
    .from('users')
    .select('status')
    .eq('id', user.id)
    .single();
    
  // Return true if user has admin status
  return userData?.status === 'admin';
}

// Function to require admin access for server actions
export async function requireAdmin() {
  const isAdmin = await isUserAdmin();
  
  if (!isAdmin) {
    throw new Error('Admin privileges required');
  }
}

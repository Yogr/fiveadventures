import { redirect } from 'next/navigation';
import { handleAuthCallback } from '@/app/actions/auth';
import { ROUTES } from '@/lib/constants';

export default async function AuthCallbackPage() {
  try {
    // Process the auth callback and create/update user record
    const result = await handleAuthCallback();
    
    if (result.error) {
      console.error('Auth callback error:', result.error);
      // Redirect to login page with error message
      return redirect(`/login?error=${encodeURIComponent(result.error)}`);
    }
  
    // Redirect to adventure page or home page if successful
    return redirect(ROUTES.ADVENTURE);
  } catch (error) {
    console.error('Unexpected auth callback error:', error);
    // Redirect to login page on error
    return redirect('/login?error=Authentication%20failed');
  }
}

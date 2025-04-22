import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth/auth-form'
import Link from 'next/link'
import { getUser } from '@/app/actions/auth'
import { ROUTES } from '@/lib/constants'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Login - Five Adventures',
  description: 'Sign in to Five Adventures to save your progress across devices',
}

export default async function LoginPage() {
  // Check if user is already logged in
  const user = await getUser();
  
  // Check if the character cookie exists
  const cookieStore = await cookies();
  const characterIdCookie = cookieStore.get(COOKIE_NAMES.CHARACTER_ID);
  
  // If user is logged in and has a character, redirect to adventure page
  if (user && characterIdCookie?.value) {
    redirect(ROUTES.ADVENTURE);
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Five Adventures</h1>
          <p className="text-gray-400">Sign in to save your progress across devices</p>
        </div>

        <AuthForm />

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium"
          >
            Return to Game
          </Link>
        </div>

        {user && (
          <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded-md">
            <p className="text-center text-sm">
              You are already signed in as <strong>{user.email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

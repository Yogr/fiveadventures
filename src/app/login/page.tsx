import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth/auth-form'
import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/app/actions/auth'
import { ROUTES } from '@/lib/constants'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Login - Five Adventures',
  description: 'Sign in to Five Adventures to save your progress across devices',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Check if user is already logged in
  const user = await getUser();

  const _searchParams = await searchParams;
  
  // Check if the character cookie exists
  const cookieStore = await cookies();
  const characterIdCookie = cookieStore.get(COOKIE_NAMES.CHARACTER_ID);
  
  // If user is logged in and has a character, redirect to adventure page
  if (user && characterIdCookie?.value) {
    redirect(ROUTES.ADVENTURE);
  }
  
  // Get error from query parameters if it exists
  const errorMessage = _searchParams.error ? 
    Array.isArray(_searchParams.error) ? _searchParams.error[0] : _searchParams.error 
    : undefined;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Fantasy-themed background with texture */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: "url('/image/ui/brickbackground.png')", 
            backgroundSize: "320px",
            opacity: 0.6,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-amber-950/70 to-gray-900/80" />
      </div>

      {/* Magical particle effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-amber-300 animate-ping opacity-75" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-amber-200 animate-ping opacity-70" style={{ animationDuration: '5s', animationDelay: '1.5s' }} />
        <div className="absolute top-2/3 right-1/6 w-2 h-2 rounded-full bg-amber-300 animate-ping opacity-60" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/5 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-75" style={{ animationDuration: '4.5s', animationDelay: '0s' }} />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-amber-900/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
      
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-amber-500/10 blur-xl"></div>
      <div className="absolute top-1/4 right-10 w-32 h-32 rounded-full bg-amber-600/10 blur-xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-40 h-40 rounded-full bg-amber-700/5 blur-xl"></div>
      
      <div className="w-full max-w-md z-10 relative">
        {/* Logo with glowing effect */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-72 h-36 relative mb-4">
            <div className="absolute inset-0 w-full h-full blur-sm bg-amber-500/20 rounded-full transform scale-90"></div>
            <Image
              src="/image/ui/logo.png"
              alt="Five Adventures Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
              className="relative z-10"
            />
          </div>
          <p className="text-amber-100 text-xl">Sign in to save your progress across devices</p>
        </div>

        {/* Auth Form with error message if any */}
        <AuthForm initialError={errorMessage} />

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white rounded-md text-md font-medium border-2 border-amber-600/30 shadow-lg transform transition-all duration-200 hover:scale-105"
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

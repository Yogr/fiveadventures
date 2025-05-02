'use client'

import { useState, useEffect } from 'react'
import { signIn, signUp, signInWithGoogle } from '@/app/actions/auth'
import Image from 'next/image'

interface AuthFormProps {
  initialError?: string;
}

export default function AuthForm({ initialError }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(initialError || null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      const result = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Redirect or show success message
      }
    } catch (e) {
      setError('An unexpected error occurred')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signInWithGoogle()
      
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        // Redirect to Google OAuth
        window.location.href = result.url
      }
    } catch (e) {
      setError('An unexpected error occurred')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Render auth provider buttons - only Google for now
  const renderProviderButtons = () => (
    <div className="space-y-4">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 rounded-md font-medium transition-all duration-200 shadow-md border-2 border-amber-800/30 hover:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-6 h-6 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#EA4335"
              d="M12 5c1.6173 0 3.0067.55383 4.12 1.4867l3.0533-3.0533C17.1533 1.936 14.7073 1 12 1 7.8933 1 4.38 3.2133 2.4867 6.5867l3.5667 2.76C7.08 6.86 9.3533 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23 12c0-.8427-.0707-1.6613-.2133-2.44H12v4.6133h6.1253c-.2667 1.4-1.0467 2.5933-2.2467 3.3933l3.4773 2.6933c2.04-1.8867 3.2147-4.6667 3.2147-8.2533z"
            />
            <path
              fill="#FBBC05"
              d="M6.0533 14.6533l-3.5667 2.76C4.00001 20.7667 7.8933 23 12 23c2.7067 0 5.0533-.8867 6.7333-2.4l-3.4773-2.6933c-.96.64-2.1867 1.0267-3.256 1.0267-2.6467 0-4.92-1.7867-5.7467-4.1933z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.7067 0 5.0533-.8867 6.7333-2.4l-3.4773-2.6933c-.96.64-2.1867 1.0267-3.256 1.0267-2.6467 0-4.92-1.7867-5.7467-4.1933l-3.5667 2.76C4.00001 20.7667 7.8933 23 12 23z"
            />
          </svg>
        </div>
        <span className="ml-2 text-lg">
          {isLoading ? 'Processing...' : 'Sign in with Google'}
        </span>
      </button>

      {/* Email Option */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute border-t border-amber-800/30 w-full"></div>
        <div className="relative bg-amber-950/50 px-4 text-amber-200 text-sm rounded-md">or continue with</div>
      </div>

      <button
        type="button"
        onClick={() => setShowEmailForm(true)}
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-md font-medium transition-all duration-200 shadow-md border-2 border-amber-500/50 text-lg"
      >
        Sign in with Email
      </button>
    </div>
  )

  // Render email form
  const renderEmailForm = () => (
    <div>
      <button
        type="button"
        onClick={() => setShowEmailForm(false)}
        className="mb-4 inline-flex items-center text-amber-300 hover:text-amber-200"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to all options
      </button>

      <h2 className="text-2xl font-bold text-center mb-6 text-amber-100">
        {isSignUp ? 'Create Account' : 'Sign In with Email'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded text-green-200">
          {isSignUp 
            ? 'Account created! Check your email for confirmation.'
            : 'Successfully signed in!'}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-amber-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 bg-amber-900/30 border border-amber-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-amber-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 bg-amber-900/30 border border-amber-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-amber-300 hover:text-amber-200"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-b from-amber-950/90 to-gray-900/90 rounded-lg shadow-xl border border-amber-800/30 backdrop-blur-sm">
      {showEmailForm ? renderEmailForm() : renderProviderButtons()}

      {!showEmailForm && (
        <div className="mt-6 text-center text-sm text-amber-200/80">
          <p>You can also continue without an account.</p>
          <p>Signing in allows you to save your progress across devices.</p>
        </div>
      )}
    </div>
  )
}

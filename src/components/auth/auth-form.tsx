'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/app/actions/auth'
import Image from 'next/image'

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = isSignUp 
        ? await signUp(formData)
        : await signIn(formData)

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

  // Sign in with provider (these would connect to Supabase OAuth in a real implementation)
  const handleProviderSignIn = (provider: string) => {
    setError(`OAuth with ${provider} will be implemented soon!`)
  }

  // Render auth provider buttons
  const renderProviderButtons = () => (
    <div className="space-y-4">
      {/* Google */}
      <button
        type="button"
        onClick={() => handleProviderSignIn('Google')}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 rounded-md font-medium transition-all duration-200 shadow-md border-2 border-amber-800/30 hover:border-amber-700"
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
        <span className="ml-2 text-lg">Sign in with Google</span>
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => handleProviderSignIn('Facebook')}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white rounded-md font-medium transition-all duration-200 shadow-md border-2 border-amber-600/50"
      >
        <div className="w-6 h-6 flex-shrink-0 bg-white rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <span className="ml-2 text-lg">Sign in with Facebook</span>
      </button>

      {/* Discord */}
      <button
        type="button"
        onClick={() => handleProviderSignIn('Discord')}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white rounded-md font-medium transition-all duration-200 shadow-md border-2 border-blue-600/50"
      >
        <div className="w-6 h-6 flex-shrink-0 bg-white rounded-full flex items-center justify-center p-0.5">
          <svg viewBox="0 0 71 55" width="18" height="18" fill="#5865F2">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
          </svg>
        </div>
        <span className="ml-2 text-lg">Sign in with Discord</span>
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleProviderSignIn('Apple')}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white rounded-md font-medium transition-all duration-200 shadow-md border-2 border-gray-600/50"
      >
        <div className="w-6 h-6 flex-shrink-0 bg-white rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="black">
            <path d="M11.6734 8.8739C11.6734 6.81264 13.2772 6.09394 13.3561 6.05659C12.4061 4.65659 10.9209 4.44212 10.4059 4.42659C9.14344 4.30157 7.91795 5.15405 7.27592 5.15405C6.6139 5.15405 5.5894 4.44212 4.51992 4.45659C3.13593 4.47212 1.8394 5.24637 1.12488 6.48185C-0.344583 8.98938 0.687395 12.6967 2.09138 14.7339C2.7934 15.7394 3.6184 16.8634 4.69886 16.8284C5.74834 16.7889 6.1434 16.1614 7.41787 16.1614C8.67687 16.1614 9.04242 16.8284 10.1384 16.8034C11.2644 16.7889 11.9819 15.7889 12.6594 14.7734C13.4584 13.6384 13.7784 12.5244 13.7934 12.4654C13.7634 12.4554 11.6784 11.6339 11.6734 8.8739Z" />
            <path d="M10.4104 3.55651C11.0084 2.81776 11.4104 1.80329 11.2954 0.773804C10.4429 0.8043 9.35744 1.37283 8.72991 2.08657C8.17242 2.71905 7.68592 3.77304 7.81545 4.76199C8.77342 4.82736 9.78245 4.28082 10.4104 3.55651Z" />
          </svg>
        </div>
        <span className="ml-2 text-lg">Sign in with Apple</span>
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

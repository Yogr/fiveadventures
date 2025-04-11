'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

interface AuthStatusProps {
  user?: {
    email: string
  } | null
}

export default function AuthStatus({ user = null }: AuthStatusProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-300 truncate max-w-[150px]">
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => router.push('/login')}
          className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Sign In
        </button>
      )}
    </div>
  )
}

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import CharacterCreationForm from './character/create/character-creation-form';
import LoadingSpinner from '@/components/ui/loading-spinner';
import WelcomePopup from '@/components/welcome/welcome-popup';
import ContinuePlayingCard from '@/components/character/continue-playing-card';
import NewCharacterConfirmation from '@/components/character/new-character-confirmation';
import { COOKIE_NAMES, ROUTES } from '@/lib/constants';
import { getUser } from './actions/auth';
import { getCharacterForUser } from './actions/character';

export default async function Home() {
  // Check if user is signed in
  const user = await getUser();
  
  // Check if character exists
  const characterResponse = await getCharacterForUser();
  const hasCharacter = characterResponse.success && characterResponse.data;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-1 mt-0">
          <Image 
            src="/image/ui/logo.png" 
            alt="Five Adventures" 
            width={240}
            height={96}
            priority
            className="object-contain"
          />
        </div>
        
        <div className="space-y-6">
          {hasCharacter ? (
            <div className="space-y-4">
              {/* Continue playing with existing character */}
              <ContinuePlayingCard character={characterResponse.data!} />
              
              {/* Option to create a new character */}
              <NewCharacterConfirmation />
              
              {/* Sign in to another account option */}
              <div className="w-full">
                <Link
                  href={ROUTES.LOGIN}
                  className="pixel-button bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-sm md:text-base py-2 px-6 w-full block text-center"
                >
                  Sign in to an account
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950 bg-opacity-90 p-3 sm:p-4 rounded-lg">
              {/* Sign in option above character creation if no character */}
              {!user && (
                <div className="mb-4 p-3 border border-amber-700/50 rounded-lg">
                  <p className="text-amber-200 text-center mb-2">Already have an account?</p>
                  <Link
                    href={ROUTES.LOGIN}
                    className="pixel-button bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white text-sm md:text-base py-2 px-6 w-full block text-center"
                  >
                    Sign in to your account
                  </Link>
                </div>
              )}
              
              <Suspense fallback={
                <div className="flex justify-center items-center w-full py-8">
                  <LoadingSpinner />
                </div>
              }>
                <CharacterCreationForm />
              </Suspense>
            </div>
          )}
        </div>
      </div>
      
      {/* Welcome popup that shows only on first visit */}
      <WelcomePopup />
    </div>
  );
}

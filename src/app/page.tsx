import { Suspense } from 'react';
import Image from 'next/image';
import CharacterCreationForm from './character/create/character-creation-form';
import LoadingSpinner from '@/components/ui/loading-spinner';
import WelcomePopup from '@/components/welcome/welcome-popup';

export default function Home() {
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
        
        <div className="bg-amber-950 bg-opacity-90 p-3 sm:p-4 rounded-lg">
          <Suspense fallback={<LoadingSpinner />}>
            <CharacterCreationForm />
          </Suspense>
        </div>
      </div>
      
      {/* Welcome popup that shows only on first visit */}
      <WelcomePopup />
    </div>
  );
}

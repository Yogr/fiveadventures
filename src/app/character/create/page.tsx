import { Suspense } from 'react';
import CharacterCreationForm from './character-creation-form';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function CharacterCreatePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl sm:text-5xl font-pixel mb-6 text-center text-purple-400">
          Create Your Hero
        </h1>
        
        <div className="pixel-border bg-gray-900 bg-opacity-80 p-4 sm:p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <CharacterCreationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

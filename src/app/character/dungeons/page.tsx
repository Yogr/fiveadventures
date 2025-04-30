'use client';

import { useEffect, useState } from 'react';
import { getCharacterForUser } from '@/app/actions/character';
import DungeonContainer from '@/components/dungeon/DungeonContainer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { HiChevronLeft } from 'react-icons/hi';
import type { Character } from '@/lib/types';

export default function DungeonsPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCharacter() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCharacterForUser(); // This will get character for current user
        
        if (!response.success || !response.data) {
          setError(response.error || 'Failed to load character data');
          setLoading(false);
          return;
        }
        
        setCharacter(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error loading character:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    loadCharacter();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="p-4 bg-red-900/50 text-red-100 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error || 'Character not found'}</p>
        <Link href="/" className="inline-flex items-center text-amber-300 hover:text-amber-200 transition-colors mt-4">
          <HiChevronLeft className="mr-1" />
          <span>Back</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <DungeonContainer character={character} />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { deleteExistingCharacter } from '@/app/actions/character';

export default function NewCharacterConfirmation() {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateNewClick = () => {
    setShowConfirmation(true);
    setConfirmText('');
    setError(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText('');
    setError(null);
  };

  const handleConfirm = async () => {
    if (confirmText.toUpperCase() === 'DELETE') {
      try {
        setIsDeleting(true);
        setError(null);
        
        // Delete the existing character
        const result = await deleteExistingCharacter();
        
        if (result.success) {
          // Navigate to character creation page
          router.push(ROUTES.CHARACTER_CREATE);
        } else {
          setError(result.error || 'Failed to delete character');
          setIsDeleting(false);
        }
      } catch (err) {
        console.error('Error deleting character:', err);
        setError('An unexpected error occurred');
        setIsDeleting(false);
      }
    } else {
      setError('Please type DELETE to confirm');
    }
  };

  return (
    <div className="w-full">
      {!showConfirmation ? (
        <button
          onClick={handleCreateNewClick}
          className="pixel-button bg-red-900 hover:bg-red-800 active:bg-red-950 text-sm md:text-base py-2 px-6 w-full"
        >
          Create a new character
        </button>
      ) : (
        <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border border-red-700">
          <h3 className="text-lg font-semibold text-red-400 mb-3">Warning!</h3>
          <p className="text-amber-200 mb-4">
            Only one character is permitted per account. Creating a new character will delete your existing one.
          </p>
          <p className="text-amber-200 mb-4 font-bold">
            Proceed? Please type DELETE to continue.
          </p>
          
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-2 py-1 bg-amber-900 border border-amber-700 rounded-md text-sm md:text-base mb-3"
            placeholder="Type DELETE to confirm"
          />
          
          {error && (
            <div className="bg-red-900 border border-red-500 p-2 rounded-md text-center text-sm mb-3">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className={`pixel-button text-sm md:text-base py-2 flex-1 
                ${isDeleting
                  ? 'bg-gray-600 cursor-not-allowed opacity-70'
                  : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
                }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={`pixel-button text-sm md:text-base py-2 flex-1 
                ${isDeleting
                  ? 'bg-gray-600 cursor-not-allowed opacity-70'
                  : 'bg-red-900 hover:bg-red-800 active:bg-red-950'
                }`}
            >
              {isDeleting ? 'Deleting...' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCharacter } from '@/app/actions/character-delete';
import type { Character } from '@/lib/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface CharacterActionsProps {
  character: Character;
  onSuccess?: () => void;
}

export default function CharacterActions({ character, onSuccess }: CharacterActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteCharacter = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteCharacter(character.id);
      
      if (result.success) {
        // Close the confirmation dialog
        setShowConfirmDelete(false);
        
        // Refresh the page or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
          router.push('/character');
        }
      } else {
        console.error('Error deleting character:', result.error);
        setError(result.error || 'Failed to delete character');
      }
    } catch (err) {
      console.error('Unexpected error deleting character:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h3>
        
        <div className="bg-gray-800 rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-md font-medium">Delete Character</h4>
            <p className="text-sm text-gray-400">This action cannot be undone.</p>
          </div>
          
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Character'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-500 rounded-md">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <Transition appear show={showConfirmDelete} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setShowConfirmDelete(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-red-500"
                  >
                    Delete Character?
                  </Dialog.Title>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-300">
                      You are about to delete <span className="font-bold">{character.name}</span>. This action cannot be undone and all progress, items, and stats will be lost forever.
                    </p>
                    
                    <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
                      <p><span className="font-semibold">Name:</span> {character.name}</p>
                      <p><span className="font-semibold">Class:</span> {character.class}</p>
                      <p><span className="font-semibold">Level:</span> {character.level}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium"
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                      onClick={handleDeleteCharacter}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

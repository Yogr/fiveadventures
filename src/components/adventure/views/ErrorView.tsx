'use client';

import { memo } from 'react';
import { useAdventure } from '../AdventureContext';

interface ErrorViewProps {
  error: string;
}

const ErrorView = memo(function ErrorView({ error }: ErrorViewProps) {
  const { dispatch } = useAdventure();
  
  const handleTryAgain = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };
  
  return (
    <div className="bg-red-900 border border-red-500 p-4 rounded-md text-center animate-fadeIn">
      <p className="text-xl mb-4">{error}</p>
      <button 
        onClick={handleTryAgain} 
        className="pixel-button"
      >
        Try Again
      </button>
    </div>
  );
});

export default ErrorView;

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisitedBefore) {
      // If first visit, show the popup and set the flag
      setIsVisible(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-gray-900 pixel-border p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[90vh]">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-pixel mb-3 sm:mb-4 md:mb-6 text-center text-purple-400 pulse-animation">
          Five Adventures
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6">
          Embark on a daily journey of five unique adventures in this pixelated RPG!
        </p>
        
        <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <div className="flex flex-col items-center">
            <h2 className="text-base sm:text-lg md:text-2xl text-yellow-400 mb-1 sm:mb-2">Create a Hero</h2>
            <p className="text-xs sm:text-sm md:text-base">
              Choose from four unique classes: Warrior, Wizard, Thief, or Ranger.
              Each with their own strengths and abilities.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-base sm:text-lg md:text-2xl text-green-400 mb-1 sm:mb-2">Daily Adventures</h2>
            <p className="text-xs sm:text-sm md:text-base">
              Embark on five adventures each day. Make choices, face challenges,
              and reap rewards based on your character's abilities.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-base sm:text-lg md:text-2xl text-blue-400 mb-1 sm:mb-2">Collect & Equip</h2>
            <p className="text-xs sm:text-sm md:text-base">
              Find weapons, armor, and magical trinkets to boost your stats
              and unlock new abilities for your character.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-base sm:text-lg md:text-2xl text-red-400 mb-1 sm:mb-2">Battle World Bosses</h2>
            <p className="text-xs sm:text-sm md:text-base">
              Join forces with other players to defeat powerful weekly bosses
              and earn exclusive rewards.
            </p>
          </div>
        </div>
        
        <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-6 text-center">
          No account needed to start playing, but creating one will save your progress!
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={closePopup}
            className="pixel-button text-sm sm:text-base md:text-lg py-1 sm:py-2 px-4 sm:px-6"
          >
            Start Your Adventure
          </button>
        </div>
      </div>
    </div>
  );
}

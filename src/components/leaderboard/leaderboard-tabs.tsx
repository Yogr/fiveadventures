'use client';

import { useState } from 'react';
import type { CharacterClass } from '@/lib/types';

export type LeaderboardCategory = 
  | 'level'
  | 'wealth' 
  | 'power'
  | 'adventures'
  | 'bosses_slain'
  | 'boss_damage';

export type LeaderboardSubcategory = 
  | 'overall'
  | CharacterClass;

interface LeaderboardTabsProps {
  currentCategory: LeaderboardCategory;
  currentSubcategory: LeaderboardSubcategory;
  onCategoryChange: (category: LeaderboardCategory) => void;
  onSubcategoryChange: (subcategory: LeaderboardSubcategory) => void;
  availableClasses?: CharacterClass[];
  showClassTabs?: boolean;
  classTabsTitle?: string;
  bossTabsTitle?: string;
}

export default function LeaderboardTabs({
  currentCategory,
  currentSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  availableClasses = ['Warrior', 'Thief', 'Wizard', 'Ranger', 'Cleric'],
  showClassTabs = true,
  classTabsTitle = 'Filter by Class:',
  bossTabsTitle = 'Boss Categories:'
}: LeaderboardTabsProps) {
  // Define category labels for display
  const categoryLabels: Record<LeaderboardCategory, string> = {
    'level': 'Level',
    'wealth': 'Wealth',
    'power': 'Power',
    'adventures': 'Adventures',
    'bosses_slain': 'Bosses Slain',
    'boss_damage': 'Boss Damage'
  };
  
  // Define which categories support class filtering
  const categoriesWithClassFilters: LeaderboardCategory[] = ['level', 'power', 'adventures'];
  
  // Check if the current category supports class filtering
  const shouldShowClassTabs = showClassTabs && categoriesWithClassFilters.includes(currentCategory);
  
  // Check if current category is a boss category
  const isBossCategory = currentCategory === 'bosses_slain' || currentCategory === 'boss_damage';
  
  return (
    <div className="space-y-4">
      {/* Main category tabs */}
      <div className="border-b border-amber-800">
        <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Leaderboard Categories">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key as LeaderboardCategory)}
              className={`
                whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-md
                ${currentCategory === key 
                  ? 'bg-amber-900 text-amber-200 border border-amber-800 border-b-0' 
                  : 'text-amber-300 hover:text-amber-200 hover:bg-amber-900/30'}
              `}
              aria-current={currentCategory === key ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Subcategory tabs for class filtering */}
      {shouldShowClassTabs && (
        <div className="bg-gray-800/50 rounded-md p-3">
          <div className="mb-2 text-sm text-amber-200">{classTabsTitle}</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSubcategoryChange('overall')}
              className={`
                px-3 py-1 text-xs font-medium rounded-md
                ${currentSubcategory === 'overall'
                  ? 'bg-amber-900 text-amber-200 border border-amber-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-amber-900/30 hover:text-amber-200'}
              `}
            >
              All Classes
            </button>
            
            {availableClasses.map((classType) => (
              <button
                key={classType}
                onClick={() => onSubcategoryChange(classType)}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md
                  ${currentSubcategory === classType
                    ? 'bg-amber-900 text-amber-200 border border-amber-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-amber-900/30 hover:text-amber-200'}
                `}
              >
                {classType}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Boss category tabs */}
      {isBossCategory && (
        <div className="bg-gray-800/50 rounded-md p-3">
          <div className="mb-2 text-sm text-amber-200">{bossTabsTitle}</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange('bosses_slain')}
              className={`
                px-3 py-1 text-xs font-medium rounded-md
                ${currentCategory === 'bosses_slain'
                  ? 'bg-amber-900 text-amber-200 border border-amber-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-amber-900/30 hover:text-amber-200'}
              `}
            >
              Most Bosses Slain
            </button>
            
            <button
              onClick={() => onCategoryChange('boss_damage')}
              className={`
                px-3 py-1 text-xs font-medium rounded-md
                ${currentCategory === 'boss_damage'
                  ? 'bg-amber-900 text-amber-200 border border-amber-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-amber-900/30 hover:text-amber-200'}
              `}
            >
              Highest Boss Damage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

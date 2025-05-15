'use client';

import React, { useState } from 'react';
import TabNavigation from '@/components/ui/tab-navigation';
import type { TabItem } from '@/components/ui/tab-navigation';
import AdventureContainer from '@/components/adventure/AdventureContainer';
import DungeonTabContent from '@/components/dungeon/DungeonTabContent';
import { AdventureProvider } from '@/components/adventure/AdventureContext';
import { DungeonProvider, DungeonStateProvider } from '@/components/dungeon/DungeonContext';
import type { Area, Character } from '@/lib/types';

interface AdventureTabContainerProps {
  character: Character;
  currentDay: number;
  areas: Area[];
  selectedArea: Area | null;
}

export default function AdventureTabContainer({
  character,
  currentDay,
  areas,
  selectedArea
}: AdventureTabContainerProps) {
  const [activeTab, setActiveTab] = useState<string>('adventure');

  const tabs: TabItem[] = [
    {
      id: 'adventure',
      label: 'Adventure',
      icon: '/image/ui/adventure.png'
    },
    {
      id: 'dungeon',
      label: 'Dungeon',
      icon: '/image/ui/dungeon_key.png' // Placeholder until a proper dungeon gate icon is created
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="w-full">
      <TabNavigation 
        tabs={tabs} 
        defaultTab="adventure" 
        onTabChange={handleTabChange}
        fullWidth={true}
        className="mb-4"
      />
      
      <div className="w-full">
        {activeTab === 'adventure' ? (
          <AdventureProvider 
            initialCharacter={character} 
            currentDay={currentDay}
            initialAreas={areas}
            initialSelectedArea={selectedArea}
          >
            <AdventureContainer />
          </AdventureProvider>
        ) : (
          <DungeonProvider>
            <DungeonStateProvider>
              <DungeonTabContent character={character} />
            </DungeonStateProvider>
          </DungeonProvider>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TabNavigation from '@/components/ui/tab-navigation';
import type { TabItem } from '@/components/ui/tab-navigation';
import AdventureContainer from '@/components/adventure/AdventureContainer';
import { AdventureProvider } from '@/components/adventure/AdventureContext';
import { DungeonProvider, DungeonStateProvider } from '@/components/dungeon/DungeonContext';
import type { Area, Character } from '@/lib/types';
import DungeonTabContent from '@/components/dungeon/DungeonTabContent';
import Image from 'next/image';

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
  const searchParams = useSearchParams();
  
  // Check for tab parameter in URL and set active tab accordingly
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'dungeon') {
      setActiveTab('dungeon');
    }
  }, [searchParams]);

  const tabs: TabItem[] = [
    {
      id: 'adventure',
      label: 'Adventure',
      icon: '/image/ui/adventure.png'
    },
    {
      id: 'dungeon',
      label: 'Dungeon',
      icon: '/image/ui/dungeon_key.png'
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="w-full">
      <TabNavigation 
        tabs={tabs} 
        defaultTab={activeTab}  // Use defaultTab instead of activeTab
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
          <div className="w-full relative">
            <DungeonProvider>
              <DungeonStateProvider>
                <DungeonTabContent character={character} />
              </DungeonStateProvider>
            </DungeonProvider>
          </div>
        )}
      </div>
    </div>
  );
}

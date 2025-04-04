'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import WorldBossButtonCompanion from '@/components/worldboss/world-boss-button-companion';

interface GameNavigationProps {
  activeTab: 'adventure' | 'shop' | 'worldboss';
}

export default function GameNavigation({ activeTab }: GameNavigationProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
        <Link 
          href={ROUTES.ADVENTURE}
          className={`rounded-full px-4 py-2 text-sm sm:text-base text-center text-white font-medium ${activeTab === 'adventure' ? 'bg-red-700' : 'bg-red-600 hover:bg-red-500'}`}
        >
          Adventure
        </Link>
        
        <Link 
          href={ROUTES.SHOP}
          className={`rounded-full px-4 py-2 text-sm sm:text-base text-center text-white font-medium ${activeTab === 'shop' ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-500'}`}
        >
          Shop & Inventory
        </Link>
        
        <div className="relative flex items-center">
          <Link 
            href={ROUTES.WORLD_BOSS}
            className={`rounded-full px-4 py-2 text-sm sm:text-base text-center text-white font-medium ${activeTab === 'worldboss' ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-500'}`}
          >
            World Boss
          </Link>
          
          <div className="absolute left-[calc(100%-10px)]">
            <WorldBossButtonCompanion />
          </div>
        </div>
      </div>
    </div>
  );
}

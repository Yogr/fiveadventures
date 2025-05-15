'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Helper function for conditional class names
const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  fullWidth?: boolean;
  className?: string;
}

export default function TabNavigation({
  tabs,
  defaultTab,
  onTabChange,
  fullWidth = true,
  className
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={cn(
      'border-b border-amber-800/50',
      fullWidth ? 'w-full' : 'w-auto',
      className
    )}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'flex items-center justify-center px-4 py-3 font-medium text-sm focus:outline-none transition-colors',
              'border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-amber-500 text-amber-100'
                : 'border-transparent text-amber-400 hover:text-amber-200 hover:border-amber-700',
              fullWidth ? 'flex-1' : ''
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon && (
              <Image
                src={tab.icon}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

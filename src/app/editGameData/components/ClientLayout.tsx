'use client';

import React from 'react';
import type { ReactNode } from 'react';
import AdminMenu from './AdminMenu';
import TopNav from './TopNav';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row w-full">
      <AdminMenu />
      <div className="flex-1 flex flex-col bg-amber-900 min-h-screen">
        <TopNav />
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

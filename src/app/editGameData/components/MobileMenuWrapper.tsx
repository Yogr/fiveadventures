'use client';

import React from 'react';
import type { ReactNode } from 'react';
import { MobileMenuProvider } from './MobileMenuContext';

export default function MobileMenuWrapper({ children }: { children: ReactNode }) {
  return (
    <MobileMenuProvider>
      {children}
    </MobileMenuProvider>
  );
}

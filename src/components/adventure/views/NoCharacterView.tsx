'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const NoCharacterView = memo(function NoCharacterView() {
  return (
    <div className="text-center animate-fadeIn">
      <p className="text-xl mb-4">Character not found</p>
      <Link href={ROUTES.CHARACTER_CREATE} className="pixel-button">
        Create Character
      </Link>
    </div>
  );
});

export default NoCharacterView;

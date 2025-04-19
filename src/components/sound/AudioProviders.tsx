'use client';

import type { ReactNode } from 'react';
import { SoundProvider } from './SoundContext';
import { MusicProvider } from './MusicContext';
import { SoundControls } from './SoundControls';

type AudioProvidersProps = {
  children: ReactNode;
  userId?: string;
  initialSoundEnabled?: boolean;
  initialMusicEnabled?: boolean;
};

export function AudioProviders({
  children,
  userId,
  initialSoundEnabled = false,
  initialMusicEnabled = false
}: AudioProvidersProps) {
  return (
    <SoundProvider userId={userId} initialSoundEnabled={initialSoundEnabled}>
      <MusicProvider userId={userId} initialMusicEnabled={initialMusicEnabled}>
        {children}
        <SoundControls />
      </MusicProvider>
    </SoundProvider>
  );
}

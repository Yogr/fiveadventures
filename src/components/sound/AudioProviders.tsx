'use client';

import type { ReactNode } from 'react';
import { SoundProvider } from './SoundContext';
import { MusicProvider } from './MusicContext';
import { SoundControls } from './SoundControls';
import { GlobalMusicPlayer } from './GlobalMusicPlayer';
import AudioTestButton from './AudioTestButton';

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
        {children}
    </SoundProvider>
  );
}

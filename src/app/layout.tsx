import './globals.css';
import type { Metadata } from 'next';
import { AudioProviders } from '@/components/sound/AudioProviders';
import { getUserSettings } from '@/app/actions/user-settings';
import { getUser } from '@/app/actions/auth';

export const metadata: Metadata = {
  title: 'Five Adventures',
  description: 'A daily RPG adventure game with pixelated art style',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user
  const user = await getUser();
  
  // Default settings if user is not logged in
  let musicEnabled = false;
  let soundEnabled = false;
  let userId: string | undefined = undefined;
  
  // Get user settings if logged in
  if (user) {
    userId = user.id;
    const settingsResponse = await getUserSettings(userId);
    if (settingsResponse.success) {
      musicEnabled = settingsResponse.data?.musicEnabled || false;
      soundEnabled = settingsResponse.data?.soundEnabled || false;
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AudioProviders 
          userId={userId}
          initialMusicEnabled={musicEnabled}
          initialSoundEnabled={soundEnabled}
        >
          <main className="min-h-screen">
            {children}
          </main>
        </AudioProviders>
      </body>
    </html>
  );
}

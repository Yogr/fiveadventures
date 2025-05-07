import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import WorldBossesComponent from '@/app/editGameData/worldBosses/WorldBossesComponent';

export default async function WorldBossesPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">World Bosses Editor</h1>
      <WorldBossesComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

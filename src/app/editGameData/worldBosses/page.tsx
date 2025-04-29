import { isUserAdmin } from '@/app/actions/auth';
import AdminMenu from '../components/AdminMenu';
import WorldBossesComponent from './WorldBossesComponent';

export default async function WorldBossesPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <div className="flex w-full">
      <AdminMenu />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">World Bosses Editor</h1>
        <WorldBossesComponent isAdmin={isAdmin} />
      </div>
    </div>
  );
}

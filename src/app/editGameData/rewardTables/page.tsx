import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import RewardTablesComponent from '@/app/editGameData/rewardTables/RewardTablesComponent';

export default async function RewardTablesPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">Reward Tables Editor</h1>
      <RewardTablesComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

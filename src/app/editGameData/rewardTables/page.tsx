import { isUserAdmin } from '@/app/actions/auth';
import AdminMenu from '../components/AdminMenu';
import RewardTablesComponent from './RewardTablesComponent';

export default async function RewardTablesPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <div className="flex w-full">
      <AdminMenu />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Reward Tables Editor</h1>
        <RewardTablesComponent isAdmin={isAdmin} />
      </div>
    </div>
  );
}

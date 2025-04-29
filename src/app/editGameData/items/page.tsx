import { isUserAdmin } from '@/app/actions/auth';
import AdminMenu from '../components/AdminMenu';
import ItemsComponent from '@/app/editGameData/items/ItemsComponent';

export default async function ItemsPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <div className="flex w-full">
      <AdminMenu />
      <div className="flex-1 p-6 bg-amber-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-amber-100">Items Editor</h1>
        <ItemsComponent isAdmin={isAdmin} />
      </div>
    </div>
  );
}

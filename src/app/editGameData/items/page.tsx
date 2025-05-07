import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import ItemsComponent from '@/app/editGameData/items/ItemsComponent';

export default async function ItemsPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">Items Editor</h1>
      <ItemsComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

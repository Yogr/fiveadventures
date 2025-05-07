import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import ShopItemsComponent from '@/app/editGameData/shopItems/ShopItemsComponent';

export default async function ShopItemsPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">Shop Items Editor</h1>
      <ShopItemsComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

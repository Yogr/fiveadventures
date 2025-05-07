import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import AreasComponent from '@/app/editGameData/areas/AreasComponent';

export default async function AreasPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">Areas Editor</h1>
      <AreasComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import MonstersComponent from '@/app/editGameData/monsters/MonstersComponent';

export default async function MonstersPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">Monsters Editor</h1>
      <MonstersComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

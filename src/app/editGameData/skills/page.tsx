import { isUserAdmin } from '@/app/actions/auth';
import ClientLayout from '../components/ClientLayout';
import SkillsComponent from '@/app/editGameData/skills/SkillsComponent';

export default async function SkillsPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold mb-6 text-amber-100">Skills Editor</h1>
      <SkillsComponent isAdmin={isAdmin} />
    </ClientLayout>
  );
}

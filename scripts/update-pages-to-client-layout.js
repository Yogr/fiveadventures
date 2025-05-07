/**
 * This script provides a template for updating all the other pages to use the ClientLayout component.
 * 
 * For each page in the editGameData directory, you'll need to:
 * 1. Replace the AdminMenu import with ClientLayout import
 * 2. Replace the flex container with ClientLayout component
 * 
 * Example for each page:
 * 
 * FROM:
 * ```jsx
 * import { isUserAdmin } from '@/app/actions/auth';
 * import AdminMenu from '../components/AdminMenu';
 * import ComponentName from '@/app/editGameData/path/ComponentName';
 * 
 * export default async function PageName() {
 *   // Check if user is admin (but don't restrict access)
 *   const isAdmin = await isUserAdmin();
 *   
 *   return (
 *     <div className="flex w-full">
 *       <AdminMenu />
 *       <div className="flex-1 p-6 bg-amber-900 min-h-screen">
 *         <h1 className="text-2xl font-bold mb-6 text-amber-100">Page Title</h1>
 *         <ComponentName isAdmin={isAdmin} />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * TO:
 * ```jsx
 * import { isUserAdmin } from '@/app/actions/auth';
 * import ClientLayout from '../components/ClientLayout';
 * import ComponentName from '@/app/editGameData/path/ComponentName';
 * 
 * export default async function PageName() {
 *   // Check if user is admin (but don't restrict access)
 *   const isAdmin = await isUserAdmin();
 *   
 *   return (
 *     <ClientLayout>
 *       <h1 className="text-2xl font-bold mb-6 text-amber-100">Page Title</h1>
 *       <ComponentName isAdmin={isAdmin} />
 *     </ClientLayout>
 *   );
 * }
 * ```
 * 
 * Pages to update:
 * - src/app/editGameData/adventures/page.tsx
 * - src/app/editGameData/areas/page.tsx
 * - src/app/editGameData/classes/page.tsx
 * - src/app/editGameData/monsters/page.tsx
 * - src/app/editGameData/rewardTables/page.tsx
 * - src/app/editGameData/shopItems/page.tsx
 * - src/app/editGameData/skills/page.tsx
 * - src/app/editGameData/worldBosses/page.tsx
 */

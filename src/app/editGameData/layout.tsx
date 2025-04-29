import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function GameDataEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  
  // No session means no access to admin area
  if (!user) {
    redirect('/login?redirect=/editGameData');
  }
  
  // Check if the user exists and is at least a basic user
  const { data: userData, error } = await supabase
    .from('users')
    .select('status')
    .eq('id', user.id)
    .single();
  
  // If user doesn't exist or fails to load, redirect to login
  if (error || !userData) {
    redirect('/login?redirect=/editGameData');
  }
  
  // User must be admin to access this section
  // For viewing purposes we'll still let them see it, but components will be read-only
  // and this is enforced again by the server actions for actual data mutations
  
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}

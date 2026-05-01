import AppLayout from "@/components/layouts/AppLayout";
import { createClientServer } from "@/lib/supabase/server";
import { playerNav, parentNav, coachNav } from "@/lib/navItems";

export default async function DashboardLayout({ children }) {
  const supabase = createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role;

  let navItems = [];

  if (role === "player") navItems = playerNav;
  if (role === "parent") navItems = parentNav;
  if (role === "coach") navItems = coachNav;

  return <AppLayout navItems={navItems}>{children}</AppLayout>;
}

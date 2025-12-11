import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar/Sidebar";

const RoomsLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      <main className="flex w-full flex-1 flex-col bg-slate-300 text-slate-900 dark:text-slate-100 dark:bg-slate-800">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default RoomsLayout;

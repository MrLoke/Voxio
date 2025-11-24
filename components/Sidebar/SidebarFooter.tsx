import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../ui/sidebar";
import { signOutAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const SidebarFooterSection = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user?.id)
    .maybeSingle();

  if (profileError) {
    console.error("Błąd odczytu profilu:", profileError);
  }

  const displayName =
    profileData?.username || user?.user_metadata?.username || "Użytkownik";
  const displayEmail = user?.email || "";

  return (
    <SidebarMenu className="border-2 rounded-lg">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={profileData?.avatar_url || ""}
                  alt={displayName}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
          >
            <DropdownMenuItem>
              <span>Account</span>
            </DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem>
              <span>Status</span>
            </DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem asChild>
              <form action={signOutAction} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

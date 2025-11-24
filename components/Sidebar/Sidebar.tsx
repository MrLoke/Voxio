import {
  Sidebar as UISidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarHeaderSection } from "./SidebarHeader";
import { SidebarMenuSection } from "./SidebarMenu";
import { SidebarFooterSection } from "./SidebarFooter";

export const Sidebar = () => {
  return (
    <UISidebar collapsible="icon">
      <SidebarHeader>
        <SidebarHeaderSection />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenuSection />
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterSection />
      </SidebarFooter>
    </UISidebar>
  );
};

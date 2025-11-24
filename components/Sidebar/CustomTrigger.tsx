"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";

export const CustomTrigger = () => {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();
  console.log(
    "state",
    state,
    "open",
    open,
    "openMobile",
    openMobile,
    "isMobile",
    isMobile
  );

  return (
    <div
      className="flex sticky top-0 z-50 hover:cursor-pointer"
      onClick={toggleSidebar}
    >
      {open ? (
        <TbLayoutSidebarLeftCollapseFilled
          size={30}
          className="text-app-primary hover:cursor-pointer"
        />
      ) : (
        <TbLayoutSidebarLeftExpandFilled
          size={30}
          className="text-app-primary hover:cursor-pointer"
        />
      )}
    </div>
  );
};

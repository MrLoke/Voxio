"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  className?: string;
};

export const CustomTrigger = ({ className }: Props) => {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  return (
    <div
      className={cn("flex sticky top-0 z-50 hover:cursor-pointer", className)}
      onClick={toggleSidebar}
    >
      {open || openMobile ? (
        <Tooltip>
          <TooltipTrigger>
            <ArrowLeftFromLine
              size={24}
              className="text-amber-500 hover:cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Hide sidebar</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <ArrowRightFromLine
              size={24}
              className="text-amber-500 hover:cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Show sidebar</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

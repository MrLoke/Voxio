"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  BiSolidHome,
  BiSolidChat,
  BiSolidBell,
  BiSolidCog,
} from "react-icons/bi";
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoAddCircle } from "react-icons/io5";
import { Circle } from "../ui/circle";

export const SidebarMenuSection = () => {
  const buttonClasses =
    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Dashboard" className={buttonClasses}>
              <Link href="/dashboard" className="flex items-center">
                <Circle>
                  <BiSolidHome className="h-5 w-5" />
                </Circle>
                <span className="pl-2 group-data-[collapsible=icon]:hidden">
                  Dashboard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Notifications"
              className={buttonClasses}
            >
              <Circle>
                <BiSolidBell className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                Notifications
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Messages" className={buttonClasses}>
              <Circle>
                <BiSolidChat className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                Messages
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" className={buttonClasses}>
              <Circle>
                <BiSolidCog className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                Settings
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>

      <SidebarGroupLabel className="mt-2">Rooms</SidebarGroupLabel>
      <SidebarGroupContent className="mt-2 group-data-[collapsible=icon]:mt-8">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem className="mb-2">
            <SidebarMenuButton tooltip="Add new room" className={buttonClasses}>
              <Circle>
                <IoAddCircle className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                Add new room
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="#Test Room 1" className={buttonClasses}>
              <Circle>
                <HiMiniUserGroup className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                #Test Room 1
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="#Test Room 2" className={buttonClasses}>
              <Circle>
                <HiMiniUserGroup className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                #Test Room 2
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="#Test Room 3" className={buttonClasses}>
              <Circle>
                <HiMiniUserGroup className="h-5 w-5" />
              </Circle>
              <span className="group-data-[collapsible=icon]:hidden">
                #Test Room 3
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

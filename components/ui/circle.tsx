import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
};

export const Circle = ({ children, className, iconClassName }: Props) => {
  const defaultClasses =
    "inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 shrink-0";

  return (
    <div className={cn(defaultClasses, className)}>
      <div className={cn("text-amber-50", iconClassName)}>{children}</div>
    </div>
  );
};

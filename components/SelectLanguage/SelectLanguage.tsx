import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

const triggerClasses =
  "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50 rounded-lg shadow-lg hover:bg-slate-200 dark:hover:bg-slate-700";
const contentClasses =
  "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 shadow-xl rounded-lg";
const itemClasses =
  "text-slate-700 focus:bg-slate-200 dark:text-slate-100 dark:focus:bg-slate-700 focus:text-app-primary font-medium";

export const SelectLanguage = () => {
  return (
    <Select defaultValue="en">
      <SelectTrigger className={`w-[180px] mx-3 ${triggerClasses}`}>
        <Languages className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={contentClasses}>
        <SelectGroup>
          <SelectLabel className="text-slate-400 dark:text-slate-400 text-sm pt-2">
            Language
          </SelectLabel>
          <SelectItem value="pl" className={cn(itemClasses)}>
            Polski
          </SelectItem>
          <SelectItem value="en" className={cn(itemClasses)}>
            English
          </SelectItem>
          <SelectItem value="de" className={cn(itemClasses)}>
            Deutsch
          </SelectItem>
          <SelectItem value="es" className={cn(itemClasses)}>
            Español
          </SelectItem>
          <SelectItem value="fr" className={cn(itemClasses)}>
            Français
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

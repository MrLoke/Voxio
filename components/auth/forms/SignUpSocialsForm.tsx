import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const socialsButtonClasses =
  "w-full flex gap-2 bg-slate-100 text-slate-950 hover:bg-slate-200";

export const SignUpSocialsForm = () => {
  return (
    <div className="flex flex-col gap-4">
      <Button className={socialsButtonClasses}>
        <FcGoogle /> Continue with Google
      </Button>
      <Button className={socialsButtonClasses}>
        <FaApple /> Continue with Apple
      </Button>
      <Button className={socialsButtonClasses}>
        <FaSquareXTwitter /> Continue with X
      </Button>
    </div>
  );
};

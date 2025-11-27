import Link from "next/link";
import { DASHBOARD_ROUTE } from "@/lib/constants";

export const metadata = {
  title: "404 - Page Not Found",
};

const NotFound = () => {
  return (
    <div className="flex flex-col items-center pt-24">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">This page does not exist.</p>

      <Link href={DASHBOARD_ROUTE} className="underline mt-6 text-slate-100">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;

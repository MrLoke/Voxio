import Link from "next/link";
import { SIGNIN_ROUTE } from "@/lib/constants";

const AuthCodeErrorPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const errorMsg = searchParams?.error
    ? Array.isArray(searchParams.error)
      ? searchParams.error[0]
      : searchParams.error
    : "We couldn’t verify your login link.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-zinc-50 p-8 text-center">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-xl border border-red-500/30">
        <h2 className="text-2xl font-bold mb-4 text-red-400">
          Something went wrong!
        </h2>

        <p className="text-zinc-300 mb-8">{errorMsg}</p>

        <p className="text-zinc-400 text-sm mb-6">
          The link may have expired, been used already, or is no longer valid.
        </p>

        <Link href={SIGNIN_ROUTE}>
          <button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold py-2 px-6 rounded transition-colors">
            Return to Sign In
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AuthCodeErrorPage;

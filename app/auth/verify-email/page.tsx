import Link from "next/link";
import { SIGNIN_ROUTE } from "@/lib/constants";

const VerifyEmailPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-zinc-50 p-8 text-center">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-green-400">
          ✉️ You&apos;re almost there!
        </h1>

        <p className="text-zinc-300 mb-6">
          We’ve sent a verification link to your email address.
        </p>

        <p className="text-zinc-400 mb-8 text-sm">
          Open the link to activate your account and complete the sign-in
          process. If you don’t see the message within a few minutes, check your
          Spam or Promotions folder.
        </p>

        <hr className="border-zinc-700 my-6" />

        <Link href={SIGNIN_ROUTE} passHref>
          <button className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Go to Sign In
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

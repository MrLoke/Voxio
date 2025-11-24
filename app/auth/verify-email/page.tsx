import Link from "next/link";
import { SIGNIN_ROUTE } from "@/lib/constants";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-zinc-50 p-8 text-center">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-green-400">
          ✉️ Prawie gotowe!
        </h1>

        <p className="text-zinc-300 mb-6">
          Wysłaliśmy link weryfikacyjny na Twój adres e-mail.
        </p>

        <p className="text-zinc-400 mb-8 text-sm">
          Kliknij link, aby aktywować swoje konto i móc się zalogować. Sprawdź
          folder SPAM, jeśli wiadomość nie dotarła w ciągu kilku minut.
        </p>

        <hr className="border-zinc-700 my-6" />

        <Link href={SIGNIN_ROUTE} passHref>
          <button className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Przejdź do logowania
          </button>
        </Link>
      </div>
    </div>
  );
}

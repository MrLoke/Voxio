import Link from "next/link";
import { SIGNIN_ROUTE, SIGNUP_ROUTE } from "@/lib/constants";
import { AuroraBackground } from "@/components/AuroraBackground/AuroraBackground";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { SelectLanguage } from "@/components/SelectLanguage/SelectLanguage";

const Index = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-900 text-zinc-50">
      <AuroraBackground />

      <div className="flex w-full items-center px-8 justify-end">
        <SelectLanguage />

        <ModeToggle />
      </div>
      <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-linear-to-r from-zinc-200 to-zinc-400">
        Witaj w VOXIO
      </h1>
      <p className="text-2xl text-zinc-400 max-w-2xl text-center mb-10">
        VOXIO to nowoczesna platforma do prowadzenia czatów głosowych i wideo,
        idealna do spotkań towarzyskich i małych grup roboczych. Połącz się ze
        znajomymi w wirtualnych pokojach, bez instalacji i opóźnień.
      </p>
      <div className="flex space-x-4">
        <Link href={SIGNUP_ROUTE}>
          <button className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Zarejestruj się
          </button>
        </Link>
        <Link href={SIGNIN_ROUTE}>
          <button className="border border-zinc-600 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Zaloguj się
          </button>
        </Link>
      </div>

      <p className="mt-12 text-zinc-500">
        [Tutaj można dodać więcej sekcji opisujących funkcjonalność]
      </p>
    </div>
  );
};

export default Index;

import { signOutAction } from "@/actions/auth";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(SIGNIN_ROUTE); // Just in case, cuz middleware should catch this
  }

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Błąd odczytu profilu:", profileError);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-800 text-zinc-50 p-8">
      <ModeToggle />

      <p className="text-xl text-zinc-300 mb-8">
        Jesteś zalogowany jako:{" "}
        <strong>Witaj, {user.user_metadata?.username || user.email}!</strong>
        <br />
        <strong className="text-white">{user?.email}</strong>.
      </p>

      {profileData?.avatar_url ? (
        <Image
          src={profileData.avatar_url}
          alt="Avatar użytkownika"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border-2 border-green-400 shadow-lg object-cover mb-6"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center">
          Brak avatara
        </div>
      )}
      <p className="text-lg text-zinc-400 mb-10">
        To jest chroniony widok Twojej aplikacji VOXIO.
      </p>

      <form action={signOutAction}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Wyloguj się
        </button>
      </form>
    </div>
  );
}

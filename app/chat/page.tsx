import { RealtimeChat } from "@/components/RealtimeChat/RealtimeChat";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProfileData = {
  id: string;
  username: string;
  avatar_url: string;
};

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    redirect(SIGNIN_ROUTE);
  }

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Błąd odczytu profilu:", profileError);
  }

  const username = user.user_metadata.username || user.email || "Anonim";

  return (
    <RealtimeChat
      userId={user.id}
      currentUsername={username}
      profileData={profileData as ProfileData}
    />
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { ChatRoom } from "@/components/chat/ChatRoom/ChatRoom";

type PageProps = {
  params: {
    roomId: string;
  };
};

const RoomPage = async ({ params }: PageProps) => {
  const { roomId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(SIGNIN_ROUTE);

  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const profileData = {
    id: user.id,
    username:
      currentUserProfile?.username || user.email?.split("@")[0] || "User",
    avatar_url: currentUserProfile?.avatar_url || "",
  };

  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("id", roomId)
    .single();

  if (!room) return <div>The room does not exist.</div>;

  const { data: initialMessages, error: messagesError } = await supabase
    .from("messages")
    .select("*, users(username, avatar_url)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
  }

  console.log("initialMessages", initialMessages);
  console.log("profileData", profileData);
  console.log("room", room);

  return (
    <div className="h-screen min-w-2xl bg-slate-300 text-slate-900 dark:text-slate-100 dark:bg-slate-800 overflow-hidden">
      <ChatRoom
        userId={user.id}
        currentUsername={profileData.username}
        profileData={profileData}
        roomId={roomId}
        roomName={room.name}
        initialMessages={initialMessages || []}
      />
    </div>
  );
};

export default RoomPage;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RealtimeChat } from "@/components/RealtimeChat/RealtimeChat";
import { SIGNIN_ROUTE } from "@/lib/constants";

interface PageProps {
  params: {
    roomId: string;
  };
}

async function RoomPage({ params }: PageProps) {
  const { roomId } = await params;

  const supabase = await createClient();

  console.log("roomId", roomId);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(SIGNIN_ROUTE);

  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("id", roomId)
    .single();

  if (!room) return <div>Pokój nie istnieje!</div>;

  const profileData = {
    id: user.id,
    username:
      user.user_metadata.username || user.email?.split("@")[0] || "User",
    avatar_url: user.user_metadata.avatar_url || "",
  };

  return (
    <RealtimeChat
      userId={user.id}
      currentUsername={profileData.username}
      profileData={profileData}
      roomId={roomId}
      roomName={room.name}
    />
  );
}

export default RoomPage;

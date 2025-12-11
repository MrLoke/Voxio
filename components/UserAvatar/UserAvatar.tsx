import { API_DICEBEAR } from "@/lib/constants";
import { getAvatarColor, getInitials } from "@/lib/helpers/getInitials";
import Image from "next/image";

interface UserAvatarProps {
  userId: string;
  name: string;
  customImageUrl?: string;
  size?: number;
}

export const UserAvatar = ({
  userId,
  name,
  customImageUrl,
  size = 40,
}: UserAvatarProps) => {
  const sourceImageUrl =
    customImageUrl || `${API_DICEBEAR}${encodeURIComponent(userId)}`;

  const initials = getInitials(name);
  const fallbackColor = getAvatarColor(userId);

  if (customImageUrl) {
    return (
      <div
        className="relative overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <Image
          src={sourceImageUrl}
          alt={`Awatar ${name}`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    );
  } else {
    return (
      <div
        style={{ backgroundColor: fallbackColor, width: size, height: size }}
        className="rounded-full text-white font-semibold flex items-center justify-center"
      >
        {initials}
      </div>
    );
  }
};

import Avatar1 from "@/assets/svgs/avatars/avatar-1.svg";
import Avatar2 from "@/assets/svgs/avatars/avatar-2.svg";
import Avatar3 from "@/assets/svgs/avatars/avatar-3.svg";
import Avatar4 from "@/assets/svgs/avatars/avatar-4.svg";
import Avatar5 from "@/assets/svgs/avatars/avatar-5.svg";
import Avatar6 from "@/assets/svgs/avatars/avatar-6.svg";
import Avatar7 from "@/assets/svgs/avatars/avatar-7.svg";
import Avatar8 from "@/assets/svgs/avatars/avatar-8.svg";
import React from "react";
import { SvgProps } from "react-native-svg";

type AvatarComponent = React.FC<SvgProps>;

export const AVATAR_MAP: Record<string, AvatarComponent> = {
  "avatar-1": Avatar1,
  "avatar-2": Avatar2,
  "avatar-3": Avatar3,
  "avatar-4": Avatar4,
  "avatar-5": Avatar5,
  "avatar-6": Avatar6,
  "avatar-7": Avatar7,
  "avatar-8": Avatar8,
};

export const AVATAR_IDS = Object.keys(AVATAR_MAP);

interface AvatarProps extends SvgProps {
  avatarId: string | undefined;
  size?: number;
}

export function Avatar({ avatarId, size = 48, ...props }: AvatarProps) {
  if (!avatarId || !AVATAR_MAP[avatarId]) {
    return null;
  }

  const AvatarComponent = AVATAR_MAP[avatarId];
  return <AvatarComponent width={size} height={size} {...props} />;
};
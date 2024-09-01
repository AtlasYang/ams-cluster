import { IoIosNotifications } from "react-icons/io";

export default function NotificationIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <IoIosNotifications size={size} color={color} />;
}

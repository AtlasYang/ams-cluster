import { FaRegCalendarAlt } from "react-icons/fa";

export default function CalendarIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaRegCalendarAlt size={size} color={color} />;
}

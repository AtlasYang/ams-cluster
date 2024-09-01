import { FaCircleXmark } from "react-icons/fa6";

export default function CircleXMarkIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaCircleXmark size={size} color={color} />;
}

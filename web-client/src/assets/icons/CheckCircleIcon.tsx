import { FaRegCircleCheck } from "react-icons/fa6";

export default function CheckCircleIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaRegCircleCheck size={size} color={color} />;
}

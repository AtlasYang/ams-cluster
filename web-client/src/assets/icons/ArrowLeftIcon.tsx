import { FaArrowLeft } from "react-icons/fa6";

export default function ArrowLeftIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaArrowLeft size={size} color={color} />;
}

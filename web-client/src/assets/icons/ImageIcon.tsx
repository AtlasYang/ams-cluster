import { CiImageOn } from "react-icons/ci";

export default function ImageIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <CiImageOn size={size} color={color} />;
}

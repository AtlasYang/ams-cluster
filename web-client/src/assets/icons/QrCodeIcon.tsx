import { IoQrCodeOutline } from "react-icons/io5";

export default function QrCodeIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <IoQrCodeOutline size={size} color={color} />;
}

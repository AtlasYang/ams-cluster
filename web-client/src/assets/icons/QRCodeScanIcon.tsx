import { BsQrCodeScan } from "react-icons/bs";

export default function QRCodeScanIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <BsQrCodeScan size={size} color={color} />;
}

import CheckCircleIcon from "@/assets/icons/CheckCircleIcon";
import CircleXMarkIcon from "@/assets/icons/CircleXMarkIcon";

export default function StatusIcon({
  status,
  size,
}: {
  status: boolean;
  size: number;
}) {
  return status ? (
    <CheckCircleIcon size={size} color="green" />
  ) : (
    <CircleXMarkIcon size={size} color="red" />
  );
}

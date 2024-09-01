import { FaSearch } from "react-icons/fa";

export default function SearchIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaSearch size={size} color={color} />;
}

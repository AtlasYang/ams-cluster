"use client";

import PlusIcon from "@/assets/icons/PlusIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { useRouter } from "next/navigation";
import { MdAdd } from "react-icons/md";
import { Action, Fab } from "react-tiny-fab";

export default function HomeFAB() {
  const router = useRouter();

  return (
    <Fab
      style={{
        bottom: 8,
        right: 8,
      }}
      icon={<MdAdd />}
      event="click"
      alwaysShowTitle={true}
      mainButtonStyles={{ backgroundColor: "white", color: "black" }}
    >
      <Action
        text="그룹 만들기"
        onClick={() => {
          router.push("/create-group");
        }}
      >
        <PlusIcon size={24} color="black" />
      </Action>
      <Action
        text="그룹 찾아보기"
        onClick={() => {
          router.push("/search-group");
        }}
      >
        <SearchIcon size={24} color="black" />
      </Action>
    </Fab>
  );
}

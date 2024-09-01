"use client";

import { useService } from "@/service/useService";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { User } from "@/service/user/interface";
import { useRouter } from "next/navigation";
import { GroupListItem } from "@/service/group/interface";
import GroupList from "./components/group/GroupList";
import PlusIcon from "@/assets/icons/PlusIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import LogoutIcon from "@/assets/icons/LogoutIcon";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const router = useRouter();
  const { userService, groupService, authService } = useService();

  const handleGetUser = async () => {
    const user = await userService.getUser();
    setUser(user);
  };

  const handleGetGroups = async () => {
    if (!user?.user_id) return;
    const res = await groupService.getGroupsByUserId({ user_id: user.user_id });
    setGroups(res);
  };

  useEffect(() => {
    handleGetUser();
  }, []);

  useEffect(() => {
    handleGetGroups();
  }, [user]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/logo.svg" alt="logo" width={48} height={48} />
          <div className={styles.spacer} />
          {/* <button>
            <GroupAddIcon size={24} color="#CDCDCD" />
            <span></span>
          </button>
          <button>
            <NotificationIcon size={24} color="#CDCDCD" />
            <span></span>
          </button> */}
          <button
            onClick={() => {
              authService.logout();
              router.push("/signin");
            }}
          >
            <LogoutIcon size={24} color="#CDCDCD" />
          </button>
          <button>
            <img
              src={user?.profile_picture_url || "/logo.svg"}
              alt="profile"
              width={32}
              height={32}
            />
          </button>
        </div>
        <div className={styles.title}>
          <h1>
            <span>{user?.name}</span>님 환영합니다!
          </h1>
        </div>
        <div className={styles.buttonSection}>
          <button
            className={styles.bigButton}
            onClick={() => router.push("/create-group")}
          >
            <PlusIcon size={36} color="black" />
            <div>
              <h2>그룹 만들기</h2>
              <p>새로운 그룹을 만들어보세요!</p>
            </div>
          </button>
          <button
            className={styles.bigButton}
            onClick={() => router.push("/search-group")}
          >
            <SearchIcon size={24} color="black" />
            <div>
              <h2>그룹 찾아보기</h2>
              <p>다양한 그룹을 탐색하고 참여해보세요.</p>
            </div>
          </button>
        </div>
        <GroupList groups={groups} />
      </div>
    </main>
  );
}

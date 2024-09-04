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
import QRCodeScreen from "./group/[groupId]/screens/QRCodeScreen";
import QrCodeIcon from "@/assets/icons/QrCodeIcon";
import CircleXMarkIcon from "@/assets/icons/CircleXMarkIcon";
import XMarkIcon from "@/assets/icons/XMarkIcon";
import { motion } from "framer-motion";
import QRCodeScanIcon from "@/assets/icons/QRCodeScanIcon";
import dynamic from "next/dynamic";

const FABComponent = dynamic(() => import("./components/HomeFAB"), {
  ssr: false,
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [isBigButtonSectionOpen, setIsBigButtonSectionOpen] =
    useState<boolean>(false);
  const [isQRCodeSectionOpen, setIsQRCodeSectionOpen] =
    useState<boolean>(false);
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
        {isBigButtonSectionOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsBigButtonSectionOpen(false)}
          ></div>
        )}
        {!isQRCodeSectionOpen ? <FABComponent /> : <></>}
        {!isQRCodeSectionOpen ? (
          <>
            <div className={styles.header}>
              <img src="/logo.svg" alt="logo" width={48} height={48} />
              <div className={styles.spacer} />
              {/* <button
                onClick={() => {
                  authService.logout();
                  router.push("/signin");
                }}
              >
                <LogoutIcon size={24} color="#CDCDCD" />
              </button> */}
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
              {user?.name && (
                <h1>
                  <span>{user.name}</span>님 환영합니다!
                </h1>
              )}
            </div>
          </>
        ) : (
          <></>
        )}
        <motion.div
          initial={{ opacity: 0.7, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1.0,
          }}
          transition={{ duration: 0.3, repeat: 0 }}
          className={styles.qrCodeButton}
        >
          {isQRCodeSectionOpen ? (
            <>
              <p>QR 코드를 스캔하세요</p>
              <div
                onClick={() => {
                  setIsQRCodeSectionOpen(false);
                }}
              >
                <XMarkIcon size={48} color="black" />
              </div>
            </>
          ) : (
            <motion.div
              whileTap={{
                scale: 0.9,
              }}
              onClick={() => {
                setIsQRCodeSectionOpen(true);
              }}
            >
              <QRCodeScanIcon size={144} color="black" />
            </motion.div>
          )}
        </motion.div>
        {isQRCodeSectionOpen && <QRCodeScreen />}
        {!isQRCodeSectionOpen && <GroupList groups={groups} />}
      </div>
    </main>
  );
}

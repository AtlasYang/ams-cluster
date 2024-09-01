"use client";

import CalendarIcon from "@/assets/icons/CalendarIcon";
import CheckCircleIcon from "@/assets/icons/CheckCircleIcon";
import NotificationIcon from "@/assets/icons/NotificationIcon";
import QrCodeIcon from "@/assets/icons/QrCodeIcon";
import SettingIcon from "@/assets/icons/SettingIcon";
import { Group } from "@/service/group/interface";
import styles from "@/styles/group/MemberHome.module.css";
import { useEffect, useState } from "react";
import AttendanceScreen from "./screens/AttendanceScreen";
import SessionScreen from "./screens/SessionScreen";
import QRCodeScreen from "./screens/QRCodeScreen";
import NotificationScreen from "./screens/NotificationScreen";
import SettingScreen from "./screens/SettingScreen";
import { useService } from "@/service/useService";
import { Session } from "@/service/session/interface";
import { useRouter } from "next/navigation";
import HomeIcon from "@/assets/icons/HomeIcon";

export default function MemberHome({
  groupData,
  role,
  updateGroup,
}: {
  groupData: Group;
  role: number;
  updateGroup: () => void;
}) {
  const [menu, setMenu] = useState(0);
  const [sessions, setSessions] = useState<Session | null>(null);
  const { sessionService } = useService();
  const router = useRouter();

  const handleGetTodaySession = async () => {
    const session = await sessionService.getTodaySessionsByGroupId({
      group_id: groupData.group_id,
    });

    setSessions(session);
  };

  useEffect(() => {
    handleGetTodaySession();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img
            src={groupData.group_picture_url}
            alt="group"
            width={44}
            height={44}
          />
          <h3>{groupData.name}</h3>
          <div className={styles.spacer} />
          {(role === 0 || role === 1) && (
            <button
              className={styles.adminButton}
              onClick={() =>
                router.replace(`/group-admin/${groupData.group_id}`)
              }
            >
              관리자로 전환
            </button>
          )}
          <button onClick={() => router.replace("/")}>
            <HomeIcon size={24} color="#FFF" />
          </button>
          {/* {sessions && (
            <div className={styles.todaySession}>
              <p>{sessions.name}</p>
              <p>{new Date(sessions.session_date).toLocaleDateString()}</p>
            </div>
          )} */}
        </div>
        <div className={styles.body}>
          {menu === 0 && <AttendanceScreen groupData={groupData} />}
          {menu === 1 && <SessionScreen groupData={groupData} />}
          {menu === 2 && (
            <QRCodeScreen groupData={groupData} updateGroup={updateGroup} />
          )}
          {menu === 3 && <NotificationScreen groupData={groupData} />}
          {menu === 4 && <SettingScreen groupData={groupData} />}
        </div>
        <div className={styles.footer}>
          <div
            className={`${styles.footerItem} ${menu === 0 && styles.active}`}
            onClick={() => setMenu(0)}
          >
            <CheckCircleIcon size={24} color="" />
          </div>
          <div
            className={`${styles.footerItem} ${menu === 1 && styles.active}`}
            onClick={() => setMenu(1)}
          >
            <CalendarIcon size={24} color="" />
          </div>
          <div
            className={`${styles.footerItemAlt} ${menu === 2 && styles.active}`}
            onClick={() => setMenu(2)}
          >
            <QrCodeIcon size={32} color="#FFF" />
          </div>
          <div
            className={`${styles.footerItem} ${menu === 3 && styles.active}`}
            onClick={() => setMenu(3)}
          >
            <NotificationIcon size={24} color="" />
          </div>
          <div
            className={`${styles.footerItem} ${menu === 4 && styles.active}`}
            onClick={() => setMenu(4)}
          >
            <SettingIcon size={24} color="" />
          </div>
        </div>
      </div>
    </div>
  );
}

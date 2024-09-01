"use client";

import CalendarIcon from "@/assets/icons/CalendarIcon";
import CheckCircleIcon from "@/assets/icons/CheckCircleIcon";
import NotificationIcon from "@/assets/icons/NotificationIcon";
import QrCodeIcon from "@/assets/icons/QrCodeIcon";
import SettingIcon from "@/assets/icons/SettingIcon";
import { Group } from "@/service/group/interface";
import styles from "@/styles/group/AdminHome.module.css";
import { useEffect, useState } from "react";
import { useService } from "@/service/useService";
import { Session } from "@/service/session/interface";
import { useRouter } from "next/navigation";
import useModal from "@/lib/useModal";
import QRCodeDisplayModal from "./components/QRCodeDisplayModal";
import CheckDoubleIcon from "@/assets/icons/CheckDoubleIcon";
import GroupAddIcon from "@/assets/icons/GroupAddIcon";
import GroupSettingsModal from "./components/GroupSettingsModal";

export default function AdminHome({
  groupData,
  role,
  updateGroup,
}: {
  groupData: Group;
  role: number;
  updateGroup: () => void;
}) {
  const [menu, setMenu] = useState(0);
  const [todaySession, setTodaySession] = useState<Session | null>(null);
  const [
    uncheckedAttendanceRequestsNumber,
    setUncheckedAttendanceRequestsNumber,
  ] = useState<number>(0);
  const [unreadGroupRequestsNumber, setUnreadGroupRequestsNumber] =
    useState<number>(0);
  const { sessionService, groupService } = useService();
  const {
    openModal: openQRCodeDisplayModal,
    closeModal: closeQRCodeDisplayModal,
    renderModal: renderQRCodeDisplayModal,
  } = useModal();
  const {
    openModal: openGroupSettingsModal,
    closeModal: closeGroupSettingsModal,
    renderModal: renderGroupSettingsModal,
  } = useModal();
  const router = useRouter();

  const handleGetTodaySession = async () => {
    const session = await sessionService.getTodaySessionsByGroupId({
      group_id: groupData.group_id,
    });

    setTodaySession(session);
  };

  const handleGetUncheckedAttendanceRequestsNumberByGroupId = async () => {
    const uncheckedAttendanceRequestsNumber =
      await sessionService.getUncheckedAttendanceRequestsNumberByGroupId({
        group_id: groupData.group_id,
      });

    setUncheckedAttendanceRequestsNumber(uncheckedAttendanceRequestsNumber);
  };

  const handleGetUnreadGroupRequestsNumberByGroupId = async () => {
    const unreadGroupRequestsNumber =
      await groupService.getUnreadGroupRequestsNumberByGroupId({
        group_id: groupData.group_id,
      });

    setUnreadGroupRequestsNumber(unreadGroupRequestsNumber);
  };

  useEffect(() => {
    handleGetTodaySession();
    handleGetUncheckedAttendanceRequestsNumberByGroupId();
    handleGetUnreadGroupRequestsNumberByGroupId();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            className={styles.memberButton}
            onClick={() => {
              router.replace(`/group/${groupData.group_id}`);
            }}
          >
            멤버로 전환
          </button>
          <img
            src={groupData.group_picture_url}
            alt="group"
            width={160}
            height={160}
          />
          <div className={styles.groupSection}>
            <h3>{groupData.name}</h3>
            <p>{groupData.description}</p>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.todaySession}>
            {todaySession && !(todaySession.tags == "closed") ? (
              <div
                className={styles.qrcodeSection}
                onClick={() => openQRCodeDisplayModal()}
              >
                <div className={styles.qrcode}>
                  <QrCodeIcon size={80} color="black" />
                </div>
                <h1>QR 코드 생성하기</h1>
                <div className={styles.qrcodeInfo}>
                  <h3>{todaySession.name}</h3>
                  <p>
                    {todaySession.session_time.split(":").slice(0, 2).join(":")}
                  </p>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        "정말로 세션을 끝내시겠습니까? 더 이상 출석을 받을 수 없게 됩니다."
                      )
                    ) {
                      await sessionService.closeSession({
                        session_id: todaySession.session_id,
                      });
                      handleGetTodaySession();
                    }
                  }}
                >
                  세션 끝내기
                </button>
              </div>
            ) : (
              <h3>오늘은 세션이 없네요!</h3>
            )}
          </div>
          <div
            className={styles.menu}
            onClick={() => {
              router.push(`/group-admin/${groupData.group_id}/sessions`);
            }}
          >
            <CalendarIcon size={80} color="black" />
            <h1>세션 관리</h1>
            <div className={styles.spacer} />
          </div>
          <div
            className={styles.menu}
            onClick={() => {
              router.push(`/group-admin/${groupData.group_id}/attendances`);
            }}
          >
            <CheckCircleIcon size={80} color="black" />
            <h1>출석 및 공결 관리</h1>
            <div className={styles.spacer} />
            <div className={styles.notification}>
              <NotificationIcon size={32} color="#c2c2c2" />
              {uncheckedAttendanceRequestsNumber > 0 &&
                uncheckedAttendanceRequestsNumber < 100 && (
                  <p>{uncheckedAttendanceRequestsNumber}</p>
                )}
              {uncheckedAttendanceRequestsNumber >= 100 && <p>99+</p>}
            </div>
          </div>
          <div
            className={styles.menu}
            onClick={() => {
              router.push(`/group-admin/${groupData.group_id}/members`);
            }}
          >
            <GroupAddIcon size={80} color="black" />
            <h1>그룹 멤버 관리</h1>
            <div className={styles.spacer} />
            <div className={styles.notification}>
              <NotificationIcon size={32} color="#c2c2c2" />
              {unreadGroupRequestsNumber > 0 &&
                unreadGroupRequestsNumber < 100 && (
                  <p>{unreadGroupRequestsNumber}</p>
                )}
              {unreadGroupRequestsNumber >= 100 && <p>99+</p>}
            </div>
          </div>
          <div
            className={styles.menu}
            onClick={() => {
              openGroupSettingsModal();
            }}
          >
            <SettingIcon size={80} color="black" />
            <h1>그룹 설정</h1>
            <div className={styles.spacer} />
          </div>
        </div>
      </div>
      {renderQRCodeDisplayModal(
        todaySession?.qrcode_link && (
          <QRCodeDisplayModal
            link={todaySession.qrcode_link}
            close={closeQRCodeDisplayModal}
          />
        )
      )}
      {renderGroupSettingsModal(
        <GroupSettingsModal
          groupData={groupData}
          close={() => {
            closeGroupSettingsModal();
            updateGroup();
          }}
        />
      )}
    </div>
  );
}

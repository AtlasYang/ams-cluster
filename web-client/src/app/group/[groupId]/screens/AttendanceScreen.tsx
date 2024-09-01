"use client";

import styles from "@/styles/group/MobileView.module.css";
import { participationStatus } from "@/lib/constants";
import { Group } from "@/service/group/interface";
import { SessionParticipation } from "@/service/session/interface";
import { useService } from "@/service/useService";
import { useEffect, useState } from "react";
import useModal from "@/lib/useModal";
import AttendanceRequestModal from "@/app/components/group/AttendanceRequestModal";

export default function AttendanceScreen({ groupData }: { groupData: Group }) {
  const [participations, setParticipations] = useState<SessionParticipation[]>(
    []
  );
  const { sessionService } = useService();
  const [todaySessionId, setTodaySessionId] = useState<number | null>(null);
  const {
    openModal: openAttendanceRequestModal,
    closeModal: closeAttendanceRequestModal,
    renderModal: renderAttendanceRequestModal,
  } = useModal();

  const handleGetAllParticipations = async () => {
    const participations =
      await sessionService.getParticipationsByUserIdAndGroupId({
        group_id: groupData.group_id,
      });
    setParticipations(participations);
  };

  const handleGetTodaySessionId = async () => {
    const todaySession = await sessionService.getTodaySessionsByGroupId({
      group_id: groupData.group_id,
    });

    setTodaySessionId(todaySession.session_id ?? null);
  };

  useEffect(() => {
    handleGetAllParticipations();
    handleGetTodaySessionId();
  }, []);

  return (
    <div className={styles.container}>
      {todaySessionId && (
        <button
          className={styles.topRightButton}
          onClick={() => {
            openAttendanceRequestModal();
          }}
        >
          출석 인정 신청하기
        </button>
      )}
      <h1>출석 기록</h1>
      <div className={styles.basicList}>
        {participations.map((participation) => (
          <div
            key={participation.session_id}
            className={styles.participationItem}
          >
            <h3>
              {participation.created_at && formatDate(participation.created_at)}
            </h3>
            <p>
              {
                participationStatus.find(
                  (s) => s.id == participation.participation_state
                )?.krName
              }
            </p>
            {participation.attended && <span />}
          </div>
        ))}
      </div>
      {renderAttendanceRequestModal(
        <AttendanceRequestModal
          close={closeAttendanceRequestModal}
          sessionId={todaySessionId ?? -1}
        />
      )}
    </div>
  );
}

function formatDate(date: Date) {
  // from ISOString to "yyyy.MM.dd HH:mm:ss"
  const d = new Date(date);
  const str = d
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+Z/, "");
  return str;
}

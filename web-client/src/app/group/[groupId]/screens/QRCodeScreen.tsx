"use client";

import styles from "@/styles/group/MobileView.module.css";
import { Group } from "@/service/group/interface";
import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";
import { useService } from "@/service/useService";
import { errorToast, successToast } from "@/lib/toast";

export default function QRCodeScreen({
  groupData,
  updateGroup,
}: {
  groupData: Group;
  updateGroup: () => void;
}) {
  const [result, setResult] = useState<string>("");
  const { sessionService, groupService } = useService();
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      setResult(result.getText());
    },
  });

  const handleCreateParticipation = async () => {
    const sessionId = await sessionService.getSessionIdBySessionSecret({
      session_secret: result,
    });
    const session = await sessionService.getSessionById({
      session_id: sessionId,
    });

    const now = new Date();
    const sessionDate = new Date(session.session_date); // only use date part of the session date
    const sessionTimeRaw = session.session_time; // HH:MM:SS

    const {
      allowed_extra_minutes_for_late,
      allowed_extra_minutes_for_presence,
    } = await groupService.getGroupMinutesBySessionId({
      session_id: sessionId,
    });

    // if allowed_extra_minutes_for_presence is 0, then the user can only be present at the exact time of the session or earlier
    // user is late if the current time is greater than the session time + allowed_extra_minutes_for_late
    // user is present if the current time is less than the session time + allowed_extra_minutes_for_presence
    // user is absent if the current time is greater than the session time + allowed_extra_minutes_for_presence
    let attendanceStatus = 0;

    // first, check if session date and today's date are the same
    if (
      now.getFullYear() !== sessionDate.getFullYear() ||
      now.getMonth() !== sessionDate.getMonth() ||
      now.getDate() !== sessionDate.getDate()
    ) {
      errorToast("출석 가능한 세션이 아닙니다.");
      return;
    }

    // then, check if the user is late, present, or absent
    // calculate the diff in minutes between the current time and the session time
    const sessionTimeParts = sessionTimeRaw.split(":");
    const sessionTimeDate = new Date();
    sessionTimeDate.setHours(
      parseInt(sessionTimeParts[0]),
      parseInt(sessionTimeParts[1]),
      parseInt(sessionTimeParts[2])
    );
    const diff = now.getTime() - sessionTimeDate.getTime();
    const diffMinutes = Math.floor(diff / 60000);

    console.log(diffMinutes);

    if (diffMinutes < 0 || diffMinutes <= allowed_extra_minutes_for_presence) {
      attendanceStatus = 1;
    } else if (diffMinutes > allowed_extra_minutes_for_late) {
      attendanceStatus = 3;
    } else {
      attendanceStatus = 2;
    }

    const res = await sessionService.createSessionParticipation({
      session_id: sessionId,
      participation_state: attendanceStatus,
      attended: attendanceStatus !== 3,
    });

    if (res) {
      successToast("출석이 완료되었습니다.");
    } else {
      errorToast("출석에 실패했습니다.");
    }

    updateGroup();
  };

  useEffect(() => {
    if (result) {
      handleCreateParticipation();
    }
  }, [result]);

  return (
    <div className={styles.containerDark}>
      <h3>QR 코드를 스캔하여 세션에 출석하세요.</h3>
      <video ref={ref} width={360} style={{ borderRadius: 10 }} />
      <div />
    </div>
  );
}

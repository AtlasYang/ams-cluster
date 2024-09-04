"use client";

import { successToast } from "@/lib/toast";
import { Session } from "@/service/session/interface";
import { useService } from "@/service/useService";
import styles from "@/styles/components/Modals.module.css";
import { useState } from "react";

export default function AttendanceRequestModal({
  session,
  close,
}: {
  session: Session;
  close: () => void;
}) {
  const [message, setMessage] = useState<string>("");
  const [evidenceFileUrl, setEvidenceFileUrl] = useState<string | null>(null);
  const { sessionService, fileService } = useService();

  const handleSendAttendanceRequest = async () => {
    await sessionService.createAttendanceRequest({
      session_id: session.session_id,
      request_message: message,
      evidence_file_url: evidenceFileUrl ?? undefined,
    });
    successToast("출석 인정 신청이 완료되었습니다.");
    close();
  };

  const handleUploadEvidenceFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await fileService.uploadFile({ file });
    setEvidenceFileUrl(res);
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={close}>
        <span>&times;</span>
      </button>
      <h1>출석 인정 신청</h1>
      <h3>세션 날짜: {new Date(session.session_date).toLocaleDateString()}</h3>
      <textarea
        placeholder="출석 인정 신청 사유를 입력해주세요."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <h3>증빙 자료</h3>
      <input type="file" onChange={handleUploadEvidenceFile} />
      <button
        className={styles.submitButton}
        onClick={handleSendAttendanceRequest}
      >
        출석 인정 신청하기
      </button>
    </div>
  );
}

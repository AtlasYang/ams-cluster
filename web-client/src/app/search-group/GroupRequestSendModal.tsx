"use client";

import { successToast } from "@/lib/toast";
import { useService } from "@/service/useService";
import styles from "@/styles/components/Modals.module.css";
import { useState } from "react";

export default function GroupRequestSendModal({
  groupName,
  groupId,
  close,
}: {
  groupName: string;
  groupId: number;
  close: () => void;
}) {
  const [message, setMessage] = useState<string>("");
  const { groupService } = useService();

  const handleSendRequest = async () => {
    await groupService.createGroupRequest({
      group_id: groupId,
      request_message: message,
    });
    close();
    successToast("그룹 가입 신청이 완료되었습니다.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.closeButton} onClick={close}>
        <span>&times;</span>
      </div>
      <h1>그룹 가입 신청</h1>
      <p>{groupName} 그룹에 가입 신청하기</p>
      <textarea
        placeholder="그룹 가입 신청 메시지를 입력해주세요."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className={styles.submitButton} onClick={handleSendRequest}>
        가입 신청
      </button>
    </div>
  );
}

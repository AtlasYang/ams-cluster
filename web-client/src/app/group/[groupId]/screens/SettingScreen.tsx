"use client";

import styles from "@/styles/group/MobileView.module.css";
import { Group } from "@/service/group/interface";
import { useService } from "@/service/useService";

export default function SettingScreen({ groupData }: { groupData: Group }) {
  const { groupService } = useService();

  return (
    <div className={styles.container}>
      <h1>설정</h1>
      <button
        className={styles.quitButton}
        onClick={async () => {
          if (window.confirm("정말 그룹을 탈퇴하시겠습니까?")) {
            await groupService.quitGroup({ group_id: groupData.group_id });
            window.location.href = "/";
          }
        }}
      >
        그룹 탈퇴하기
      </button>
      <div className={styles.info}>
        <p>
          개발자 연락처: <a href="mailto:atlas.yang3598@gmail.com">이메일</a>
        </p>
      </div>
    </div>
  );
}

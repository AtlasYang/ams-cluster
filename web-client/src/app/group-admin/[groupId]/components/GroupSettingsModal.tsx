"use client";

import { errorToast, successToast } from "@/lib/toast";
import { Group } from "@/service/group/interface";
import { useService } from "@/service/useService";
import styles from "@/styles/components/Modals.module.css";
import { useState } from "react";

export default function GroupSettingsModal({
  groupData,
  close,
}: {
  groupData: Group;
  close: () => void;
}) {
  const [extraMinPresence, setExtraMinPresence] = useState<number>(
    groupData.allowed_extra_minutes_for_presence
  );
  const [extraMinLate, setExtraMinLate] = useState<number>(
    groupData.allowed_extra_minutes_for_late
  );
  const [usePenalty, setUsePenalty] = useState<boolean>(
    groupData.use_unattendance_penalty
  );
  const [latePenalty, setLatePenalty] = useState<number>(
    groupData.late_penalty
  );
  const [approvedAbsencePenalty, setApprovedAbsencePenalty] = useState<number>(
    groupData.approved_absence_penalty
  );
  const [unexcusedAbsencePenalty, setUnexcusedAbsencePenalty] =
    useState<number>(groupData.unexcused_absence_penalty);
  const { groupService } = useService();

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={close}>
        <span>&times;</span>
      </button>
      <h1>그룹 설정</h1>
      <div className={styles.settingList}>
        <div className={styles.settingItem}>
          <div>
            <h3>출석 유효 시간</h3>
            <p>출석을 인정하는 시간을 설정할 수 있습니다. (분 단위)</p>
          </div>
          <input
            type="text"
            value={extraMinPresence}
            onChange={(e) => setExtraMinPresence(Number(e.target.value))}
          />
        </div>
        <div className={styles.settingItem}>
          <div>
            <h3>지각 유효 시간</h3>
            <p>지각을 인정하는 시간을 설정할 수 있습니다. (분 단위)</p>
          </div>
          <input
            type="text"
            value={extraMinLate}
            onChange={(e) => setExtraMinLate(Number(e.target.value))}
          />
        </div>
        <div className={styles.settingItem}>
          <div>
            <h3>벌점 부여 여부</h3>
            <p>지각, 결석 시 벌점을 부여할지 결정할 수 있습니다.</p>
          </div>
          <input
            type="checkbox"
            checked={usePenalty}
            onChange={(e) => setUsePenalty(e.target.checked)}
          />
        </div>
        <div className={styles.settingItem}>
          <div>
            <h3>지각 패널티</h3>
            <p>1회 지각 당 부여되는 벌점의 양입니다.</p>
          </div>
          <input
            type="text"
            value={latePenalty}
            onChange={(e) => setLatePenalty(Number(e.target.value))}
          />
        </div>
        <div className={styles.settingItem}>
          <div>
            <h3>사유 없는 결석 패널티</h3>
            <p>1회의 사유 없는 결석 당 부여되는 벌점의 양입니다.</p>
          </div>
          <input
            type="text"
            value={unexcusedAbsencePenalty}
            onChange={(e) => setUnexcusedAbsencePenalty(Number(e.target.value))}
          />
        </div>
        <div className={styles.settingItem}>
          <div>
            <h3>사유 있는 결석 패널티</h3>
            <p>운영진에 의해 허가된 결석 1회 당 부여되는 벌점의 양입니다.</p>
          </div>
          <input
            type="text"
            value={approvedAbsencePenalty}
            onChange={(e) => setApprovedAbsencePenalty(Number(e.target.value))}
          />
        </div>
      </div>
      <button
        className={styles.submitButton}
        onClick={async () => {
          if (extraMinPresence < 0 || extraMinLate < 0) {
            errorToast("유효 시간은 음수가 될 수 없습니다.");
            return;
          }

          if (extraMinPresence > extraMinLate) {
            errorToast(
              "출석 유효 시간은 지각 유효 시간보다 같거나 작아야 합니다."
            );
            return;
          }

          if (
            usePenalty &&
            (latePenalty < 0 ||
              unexcusedAbsencePenalty < 0 ||
              approvedAbsencePenalty < 0)
          ) {
            errorToast("패널티는 음수가 될 수 없습니다.");
            return;
          }

          await groupService.updateGroup({
            group_id: groupData.group_id,
            updateData: {
              allowed_extra_minutes_for_late: extraMinLate,
              allowed_extra_minutes_for_presence: extraMinPresence,
              use_unattendance_penalty: usePenalty,
              late_penalty: latePenalty,
              approved_absence_penalty: approvedAbsencePenalty,
              unexcused_absence_penalty: unexcusedAbsencePenalty,
            },
          });

          successToast("그룹 설정이 변경되었습니다.");

          close();
        }}
      >
        저장
      </button>
    </div>
  );
}

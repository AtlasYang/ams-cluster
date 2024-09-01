"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useService } from "@/service/useService";
import ProfileImageSelector from "../components/ProfileImageSelector";
import { errorToast } from "@/lib/toast";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useRouter } from "next/navigation";
import StatusIcon from "../components/StatusIcon";
import { GroupListItem } from "@/service/group/interface";
import useModal from "@/lib/useModal";
import GroupRequestSendModal from "./GroupRequestSendModal";

export default function SearchGroup() {
  const [groupName, setGroupName] = useState<string>("");
  const [searchedGroups, setSearchedGroups] = useState<GroupListItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupListItem | null>(
    null
  );
  const { groupService } = useService();
  const router = useRouter();
  const { openModal, closeModal, renderModal } = useModal();

  const handleGetGroupsByName = useCallback(async () => {
    const res = await groupService.searchGroups({
      group_name_partial: groupName,
    });
    setSearchedGroups(res);
  }, [groupName]);

  useEffect(() => {
    if (!groupName) {
      setSearchedGroups([]);
      return;
    }
    handleGetGroupsByName();
  }, [groupName]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div
          className={styles.back}
          onClick={() => {
            router.push("/");
          }}
        >
          <ArrowLeftIcon size={20} color="black" />
        </div>
        <h1>그룹 찾아보기</h1>
        <input
          type="text"
          placeholder="그룹 이름을 입력해주세요."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className={styles.groupList}>
          {searchedGroups.length === 0 && (
            <div className={styles.empty}>
              <p>그룹을 검색해보세요.</p>
            </div>
          )}
          {searchedGroups.map((group) => (
            <div className={styles.group} key={group.group_id}>
              <img
                src={group.group_picture_url || "/logo.svg"}
                alt="group"
                width={56}
                height={56}
              />
              <div className={styles.groupInfo}>
                <h2>{group.name}</h2>
                <p>{group.description}</p>
                <h6>{group.member_count}명의 멤버</h6>
              </div>
              <div className={styles.spacer} />
              <button
                onClick={() => {
                  setSelectedGroup(group);
                  openModal();
                }}
              >
                그룹 가입 신청
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedGroup &&
        renderModal(
          <GroupRequestSendModal
            groupName={selectedGroup?.name}
            groupId={selectedGroup?.group_id}
            close={closeModal}
          />
        )}
    </main>
  );
}

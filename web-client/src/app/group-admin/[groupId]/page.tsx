"use client";

import styles from "./page.module.css";
import { useService } from "@/service/useService";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Group } from "@/service/group/interface";
import AdminHome from "./AdminHome";

export default function GroupHome() {
  const path = usePathname();
  const router = useRouter();
  const { groupService, memberService } = useService();
  const groupId = path.split("/")[2];
  const [group, setGroup] = useState<Group | null>(null);
  const [role, setRole] = useState<number | null>(null);

  const fetchGroup = useCallback(async () => {
    const group = await groupService.getGroupById({
      group_id: Number(groupId),
    });
    setGroup(group);
  }, [groupId, groupService]);

  const handleGetRole = useCallback(async () => {
    const role = await memberService.getMyRoleInGroup({
      group_id: Number(groupId),
    });
    setRole(role);
  }, [groupId, memberService]);

  useEffect(() => {
    fetchGroup();
    handleGetRole();
  }, []);

  return (
    <div className={styles.main}>
      {group && (role == 0 || role == 1) && (
        <AdminHome groupData={group} role={role} updateGroup={fetchGroup} />
      )}
      {group && role == 2 && (
        <h3>올바르지 않은 접근입니다. 딱 걸리셨어요! 😜</h3>
      )}
    </div>
  );
}

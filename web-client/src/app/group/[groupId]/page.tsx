"use client";

import styles from "./page.module.css";
import { useService } from "@/service/useService";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MemberHome from "./MemberHome";
import { Group } from "@/service/group/interface";

export default function GroupHome() {
  const path = usePathname();
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
      {group && role !== null && (
        <MemberHome groupData={group} role={role} updateGroup={fetchGroup} />
      )}
    </div>
  );
}

"use client";

import styles from "@/styles/components/GroupList.module.css";
import { GroupListItem } from "@/service/group/interface";
import { useRouter } from "next/navigation";

export default function GroupList({ groups }: { groups: GroupListItem[] }) {
  const router = useRouter();

  return (
    <div className={styles.groupList}>
      {groups.map((group) => {
        return (
          <div
            key={group.group_id}
            className={styles.groupItem}
            onClick={() => {
              router.push(`/group/${group.group_id}`);
            }}
          >
            <img
              src={group.group_picture_url}
              alt="group"
              width={150}
              height={150}
            />
            <div>
              <h3>
                {group.name}
                <span>{group.member_count}</span>
              </h3>
              <p>{group.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useService } from "@/service/useService";
import { useCallback, useEffect, useState } from "react";
import { Member } from "@/service/member/interface";
import { GroupRequest } from "@/service/group/interface";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { memberRoles } from "@/lib/constants";
import { successToast } from "@/lib/toast";

export default function GroupAdminMembersPage() {
  const path = usePathname();
  const groupId = Number(path.split("/")[2]);

  const router = useRouter();
  const { groupService, memberService } = useService();
  const [allGroupMembers, setAllGroupMembers] = useState<Member[]>([]);
  const [allGroupRequests, setAllGroupRequests] = useState<GroupRequest[]>([]);
  const [menu, setMenu] = useState(0);

  const handleGetAllGroupMembers = async () => {
    const res = await memberService.getMemberByGroupId({
      group_id: groupId,
    });
    setAllGroupMembers(res);
  };

  const handleGetGroupRequest = async () => {
    const res = await groupService.getGroupRequestsByGroupId({
      group_id: groupId,
    });
    setAllGroupRequests(res);
  };

  const handleGetRole = useCallback(async () => {
    const role = await memberService.getMyRoleInGroup({
      group_id: Number(groupId),
    });
    if (role !== 0 && role !== 1) {
      router.push("/");
    }
  }, [groupId, memberService]);

  useEffect(() => {
    handleGetAllGroupMembers();
    handleGetGroupRequest();
    handleGetRole();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>멤버 관리</h1>
          <div className={styles.spacer} />
          <div
            className={`${styles.menu} ${menu === 0 ? styles.active : ""}`}
            onClick={() => setMenu(0)}
          >
            전체 멤버
          </div>
          <div
            className={`${styles.menu} ${menu === 1 ? styles.active : ""}`}
            onClick={() => setMenu(1)}
          >
            그룹 참여 요청
            <span>
              {
                allGroupRequests.filter((request) => request.read === false)
                  .length
              }
            </span>
          </div>
          <div className={styles.spacer} />
          <button onClick={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </button>
        </div>
        <div className={styles.body}>
          {menu === 0 && (
            <>
              <div className={styles.memberItem}>
                <h1>이름</h1>
                <h2>이메일</h2>
                <p>지각</p>
                <p>공결</p>
                <p>결석</p>
                <h3>역할</h3>
                <h4>벌점</h4>
                <div />
              </div>
              <hr />
              <div className={styles.memberList}>
                {allGroupMembers.map((member) => (
                  <div key={member.member_id} className={styles.memberItem}>
                    <h1>{member.member_name}</h1>
                    <h2>{member.member_email}</h2>
                    <p>{member.late_count}</p>
                    <p>{member.approved_absence_count}</p>
                    <p>{member.unexcused_absence_count}</p>
                    <h3>
                      {
                        memberRoles.find(
                          (role) => role.id === member.member_role
                        )?.krName
                      }
                    </h3>
                    <h4>{member.penalty_point}</h4>
                    <div>
                      {member.member_role !== 0 && (
                        <>
                          <button
                            onClick={async () => {
                              await memberService.changeRole({
                                member_id: member.member_id,
                                new_role: member.member_role === 2 ? 1 : 2,
                              });
                              handleGetAllGroupMembers();
                              successToast(
                                member.member_role === 2
                                  ? "어드민으로 임명되었습니다."
                                  : "어드민에서 해제되었습니다."
                              );
                            }}
                          >
                            {member.member_role === 2
                              ? "어드민 임명"
                              : "어드민 해제"}
                          </button>
                          <button
                            style={{
                              backgroundColor: "#FF2727",
                              color: "#fff",
                            }}
                            onClick={async () => {
                              if (window.confirm("정말 추방하시겠습니까?")) {
                                await memberService.removeMember({
                                  member_id: member.member_id,
                                });
                                handleGetAllGroupMembers();
                                successToast("멤버가 추방되었습니다.");
                              }
                            }}
                          >
                            추방
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {menu === 1 && (
            <div className={styles.requestList}>
              {allGroupRequests.map((request) => (
                <div
                  key={request.group_request_id}
                  className={styles.requestItem}
                >
                  <h4>{request.user_name}</h4>
                  <p>{request.request_message}</p>
                  <small>
                    {new Date(request.created_at).toLocaleDateString()}
                  </small>
                  <div className={styles.spacer} />
                  <button
                    onClick={async () => {
                      await groupService.acceptGroupRequest({
                        group_request_id: request.group_request_id,
                      });
                      handleGetGroupRequest();
                      handleGetAllGroupMembers();
                      successToast("요청이 수락되었습니다.");
                    }}
                  >
                    수락
                  </button>
                  <button
                    onClick={async () => {
                      await groupService.rejectGroupRequest({
                        group_request_id: request.group_request_id,
                      });
                      handleGetGroupRequest();
                      successToast("요청이 거절되었습니다.");
                    }}
                  >
                    거절
                  </button>
                  {request.read == false && <span></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

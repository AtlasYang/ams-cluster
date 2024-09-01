"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useService } from "@/service/useService";
import { useCallback, useEffect, useState } from "react";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { errorToast, successToast } from "@/lib/toast";
import {
  Session,
  SessionAttendanceRequest,
  SessionParticipation,
} from "@/service/session/interface";
import BasicCalendar, { Value } from "@/app/components/BasicCalendar";
import { participationStatus } from "@/lib/constants";

export default function GroupAdminAttendancePage() {
  const path = usePathname();
  const groupId = Number(path.split("/")[2]);

  const router = useRouter();
  const { memberService, sessionService } = useService();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [menu, setMenu] = useState(0);
  const [dateValue, setDateValue] = useState<Value>(new Date());
  const [sessionParticipations, setSessionParticipations] = useState<
    SessionParticipation[]
  >([]);
  const [allAttendanceRequests, setAllAttendanceRequests] = useState<
    SessionAttendanceRequest[]
  >([]);

  const handleGetAllSessions = async () => {
    const res = await sessionService.getSessionsByGroupId({
      group_id: groupId,
    });
    setAllSessions(res);
  };

  const handleGetSessionsByDate = async () => {
    const sessions = await sessionService.getSessionsByGroupIdAndDate({
      group_id: groupId,
      date: dateValue instanceof Date ? dateValue.toLocaleDateString() : "",
    });
    setSessions(sessions);
  };

  const handleGetRole = useCallback(async () => {
    const role = await memberService.getMyRoleInGroup({
      group_id: Number(groupId),
    });
    if (role !== 0 && role !== 1) {
      router.push("/");
    }
  }, [groupId, memberService]);

  const handleGetAllParticipations = useCallback(async () => {
    const res = await sessionService.getSessionParticipation({
      session_id: selectedSession?.session_id ?? 0,
    });
    setSessionParticipations(res);
  }, [selectedSession, sessionService]);

  const handleGetAllAttendanceRequests = async () => {
    const res = await sessionService.getAttendanceRequestBySessionId({
      session_id: selectedSession?.session_id ?? 0,
    });
    setAllAttendanceRequests(res);
  };

  useEffect(() => {
    handleGetRole();
    handleGetAllSessions();
    handleGetAllAttendanceRequests();
  }, []);

  useEffect(() => {
    handleGetSessionsByDate();
  }, [dateValue]);

  useEffect(() => {
    if (selectedSession) {
      handleGetAllParticipations();
      handleGetAllAttendanceRequests();
    }
  }, [selectedSession]);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>출석 관리</h1>
          <div className={styles.spacer} />
          <div
            className={`${styles.menu} ${menu === 0 ? styles.active : ""}`}
            onClick={() => setMenu(0)}
          >
            멤버 출석 현황
          </div>
          <div
            className={`${styles.menu} ${menu === 1 ? styles.active : ""}`}
            onClick={() => setMenu(1)}
          >
            병결 / 공결 요청 관리
          </div>
          <div className={styles.spacer} />
          <button onClick={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.calendar}>
            <BasicCalendar
              value={dateValue}
              onChange={setDateValue}
              events={allSessions.map(
                (session) => new Date(session.session_date)
              )}
            />
            <div className={styles.section}>
              <div className={styles.sessionItem}>
                <h1>이름</h1>
                <h2>날짜</h2>
                <h3>시간</h3>
                <h4>비고</h4>
                <div />
              </div>
              <hr />
              <div className={styles.sessionList}>
                {sessions.map((session) => (
                  <div key={session.session_id} className={styles.sessionItem}>
                    <h1>{session.name}</h1>
                    <h2>
                      {new Date(session.session_date).toLocaleDateString()}
                    </h2>
                    <h3>{session.session_time}</h3>
                    <h4>{session.special_notes ?? "비고가 없습니다"}</h4>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                        }}
                      >
                        선택
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {menu === 0 && (
            <>
              <div className={styles.participationList}>
                {sessionParticipations.length === 0 && (
                  <h6>출석한 멤버가 없습니다.</h6>
                )}
                {sessionParticipations.map((participation) => {
                  return (
                    <div className={styles.participationItem}>
                      <h3>{participation.member_name}</h3>
                      <h4>{formatDate(participation.created_at)}</h4>
                      <p>
                        {
                          participationStatus.find(
                            (s) => s.id == participation.participation_state
                          )?.krName
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {menu === 1 && (
            <div className={styles.requestList}>
              {allAttendanceRequests.length === 0 && <h5>요청이 없습니다.</h5>}
              {allAttendanceRequests.map((request) => (
                <div key={request.session_id} className={styles.requestItem}>
                  <h1>{request.request_message}</h1>
                  {request.evidence_file_url && (
                    <a
                      onClick={() => {
                        if (!request.evidence_file_url) {
                          errorToast("증빙 자료가 없습니다.");
                          return;
                        }
                        const link = document.createElement("a");
                        link.href = request.evidence_file_url;
                        link.download = "증빙자료";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      증빙 자료 내려받기
                    </a>
                  )}
                  <div className={styles.spacer} />
                  <p>{request.request_approved.toString()}</p>
                  <h2>{formatDate(request.created_at)}</h2>
                  {!request.request_checked && (
                    <>
                      <button
                        onClick={async () => {
                          await sessionService.approveAttendanceRequest({
                            session_attendance_request_id:
                              request.session_attendance_request_id,
                          });
                          successToast("승인되었습니다.");
                          handleGetAllAttendanceRequests();
                        }}
                      >
                        승인
                      </button>
                      <button
                        onClick={async () => {
                          await sessionService.rejectAttendanceRequest({
                            session_attendance_request_id:
                              request.session_attendance_request_id,
                          });
                          successToast("거절되었습니다.");
                          handleGetAllAttendanceRequests();
                        }}
                      >
                        거절
                      </button>
                    </>
                  )}
                  {!request.request_checked && <span />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  // from ISOString to "yyyy.MM.dd HH:mm:ss"
  const d = new Date(date);
  const str = d
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+Z/, "");
  return str;
}

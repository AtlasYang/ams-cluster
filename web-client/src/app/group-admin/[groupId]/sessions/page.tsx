"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useService } from "@/service/useService";
import { useCallback, useEffect, useState } from "react";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { errorToast, successToast } from "@/lib/toast";
import { Session } from "@/service/session/interface";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export default function GroupAdminSessionPage() {
  const path = usePathname();
  const groupId = Number(path.split("/")[2]);

  const router = useRouter();
  const { memberService, sessionService } = useService();
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [menu, setMenu] = useState(0);
  const [newSessionStartDate, setNewSessionStartDate] = useState<Date>(
    new Date()
  );
  const [newSessionEndDate, setNewSessionEndDate] = useState<Date>(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isSingleDate, setIsSingleDate] = useState<boolean>(true);
  const [newSessionName, setNewSessionName] = useState<string>("");
  const [newSessionTime, setNewSessionTime] = useState<string>("");
  const [newSessionSpecialNotes, setNewSessionSpecialNotes] =
    useState<string>("");

  const handleGetAllSessions = async () => {
    const res = await sessionService.getSessionsByGroupId({
      group_id: groupId,
    });
    setAllSessions(res);
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
    handleGetRole();
    handleGetAllSessions();
  }, []);

  const handleCreateSessions = async () => {
    if (!newSessionName) {
      errorToast("세션 이름을 입력해주세요.");
      return;
    }

    if (!newSessionTime) {
      errorToast("세션 시간을 입력해주세요.");
      return;
    }

    if (!isSingleDate && newSessionStartDate > newSessionEndDate) {
      errorToast("시작 날짜가 끝 날짜보다 늦습니다.");
      return;
    }

    if (!isSingleDate && selectedDays.length === 0) {
      errorToast("요일을 선택해주세요.");
      return;
    }

    let dates = [];
    let currentDate = new Date(newSessionStartDate);
    while (currentDate <= newSessionEndDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (isSingleDate) {
      await sessionService.createSession({
        group_id: groupId,
        tags: "",
        name: `${newSessionName}`,
        session_date: newSessionStartDate,
        session_time: newSessionTime,
        special_notes: newSessionSpecialNotes,
      });
    } else {
      let order = 1;

      for (let date of dates) {
        if (!selectedDays.includes(date.getDay())) {
          continue;
        }

        await sessionService.createSession({
          group_id: groupId,
          tags: "",
          name: `제 ${order}회차 ${newSessionName}`,
          session_date: date,
          session_time: newSessionTime,
          special_notes: newSessionSpecialNotes,
        });
        order++;
      }
    }

    setNewSessionName("");
    setNewSessionTime("");
    setNewSessionSpecialNotes("");
    setNewSessionStartDate(new Date());
    setNewSessionEndDate(new Date());
    setIsSingleDate(true);
    setSelectedDays([]);

    handleGetAllSessions();
    successToast("세션이 추가되었습니다.");
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>세션 관리</h1>
          <div className={styles.spacer} />
          <div
            className={`${styles.menu} ${menu === 0 ? styles.active : ""}`}
            onClick={() => setMenu(0)}
          >
            전체 세션
          </div>
          <div
            className={`${styles.menu} ${menu === 1 ? styles.active : ""}`}
            onClick={() => setMenu(1)}
          >
            세션 추가하기
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
                <h2>날짜</h2>
                <h3>시간</h3>
                <h4>비고</h4>
                <div />
              </div>
              <hr />
              <div className={styles.memberList}>
                {allSessions.map((session) => (
                  <div key={session.session_id} className={styles.memberItem}>
                    <h1>{session.name}</h1>
                    <h2>
                      {new Date(session.session_date).toLocaleDateString()}
                    </h2>
                    <h3>{session.session_time}</h3>
                    <h4>{session.special_notes ?? "비고가 없습니다"}</h4>
                    <div>
                      <button
                        style={{
                          backgroundColor: "#FF2727",
                          color: "#fff",
                        }}
                        onClick={async () => {
                          if (window.confirm("정말 삭제하시겠습니까?")) {
                            await sessionService.deleteSession({
                              session_id: session.session_id,
                            });
                            handleGetAllSessions();
                            successToast("세션이 삭제되었습니다.");
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {menu === 1 && (
            <div className={styles.addSession}>
              <h1>세션 추가 마법사</h1>
              <h3>세션 종류</h3>
              <p>세션의 종류를 선택해주세요.</p>
              <div>
                <input
                  type="radio"
                  id="single"
                  name="sessionType"
                  checked={isSingleDate}
                  onChange={() => setIsSingleDate(true)}
                />
                <label htmlFor="single">단일 세션</label>
                <input
                  type="radio"
                  id="multi"
                  name="sessionType"
                  checked={!isSingleDate}
                  onChange={() => setIsSingleDate(false)}
                />
                <label htmlFor="multi">다중 세션</label>
              </div>
              <h3>세션 이름</h3>
              <p>
                세션 이름을 입력해주세요. 제 N차 (세션이름)의 형식으로
                저장됩니다.
              </p>
              <input
                type="text"
                placeholder="세션 이름"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
              <h3>세션 시간</h3>
              <p>세션의 시작 시간을 입력해주세요.</p>
              <input
                type="time"
                value={newSessionTime}
                onChange={(e) => setNewSessionTime(e.target.value)}
              />
              {!isSingleDate ? (
                <>
                  <h3>세션 기간</h3>
                  <p>세션의 시작과 끝 날짜를 입력해주세요.</p>
                  <input
                    type="date"
                    value={newSessionStartDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setNewSessionStartDate(new Date(e.target.value))
                    }
                  />
                  <input
                    type="date"
                    value={newSessionEndDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setNewSessionEndDate(new Date(e.target.value))
                    }
                  />
                  <h3>세션 요일</h3>
                  <p>해당 기간동안 반복되는 요일을 모두 선택해주세요.</p>
                  <div className={styles.weekdays}>
                    {weekdays.map((day, index) => (
                      <div
                        key={index}
                        className={`${styles.weekday} ${
                          selectedDays.includes(index) ? styles.active : ""
                        }`}
                        onClick={() =>
                          setSelectedDays(
                            selectedDays.includes(index)
                              ? selectedDays.filter((d) => d !== index)
                              : [...selectedDays, index]
                          )
                        }
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3>세션 날짜</h3>
                  <p>세션의 날짜를 입력해주세요.</p>
                  <input
                    type="date"
                    value={newSessionStartDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setNewSessionStartDate(new Date(e.target.value))
                    }
                  />
                </>
              )}
              <h3>비고</h3>
              <p>세션에 대한 추가적인 정보를 입력해주세요.</p>
              <textarea
                placeholder="비고"
                rows={4}
                value={newSessionSpecialNotes}
                onChange={(e) => setNewSessionSpecialNotes(e.target.value)}
              />
              <button onClick={handleCreateSessions}>추가하기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import styles from "@/styles/group/MobileView.module.css";
import BasicCalendar, { Value } from "@/app/components/BasicCalendar";
import { Group } from "@/service/group/interface";
import { Session } from "@/service/session/interface";
import { useService } from "@/service/useService";
import { useEffect, useState } from "react";

export default function SessionScreen({ groupData }: { groupData: Group }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [dateValue, setDateValue] = useState<Value>(new Date());
  const { sessionService } = useService();

  const handleGetSessions = async () => {
    const sessions = await sessionService.getSessionsByGroupId({
      group_id: groupData.group_id,
    });
    setAllSessions(sessions);
  };

  const handleGetSessionsByDate = async () => {
    const sessions = await sessionService.getSessionsByGroupIdAndDate({
      group_id: groupData.group_id,
      date: dateValue instanceof Date ? dateValue.toLocaleDateString() : "",
    });
    setSessions(sessions);
  };

  useEffect(() => {
    handleGetSessions();
    handleGetSessionsByDate();
  }, []);

  useEffect(() => {
    handleGetSessionsByDate();
  }, [dateValue]);

  return (
    <div className={styles.container}>
      <h1>세션 일정</h1>
      <div className={styles.calendar}>
        <BasicCalendar
          value={dateValue}
          onChange={setDateValue}
          events={allSessions.map((session) => new Date(session.session_date))}
        />
      </div>
      <h3>
        {dateValue instanceof Date ? dateValue.toLocaleDateString() : "range"}
      </h3>
      <div className={styles.basicList}>
        {sessions.length === 0 && <h6>오늘은 세션이 없네요!</h6>}
        {sessions.map((session) => (
          <div key={session.session_id} className={styles.sessionItem}>
            <h3>{new Date(session.session_date).toLocaleDateString()}</h3>
            <h4>{session.name}</h4>
            <p>{session.special_notes ?? "비고가 없습니다."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

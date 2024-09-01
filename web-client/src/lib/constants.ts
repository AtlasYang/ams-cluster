export const PG_CONNECTION = "PG_CONNECTION";
export const MINIO_CONNECTION = "MINIO_CONNECTION";

export const memberRoles = [
  {
    id: 0,
    name: "Owner",
    krName: "소유자",
  },
  {
    id: 1,
    name: "Admin",
    krName: "관리자",
  },
  {
    id: 2,
    name: "Member",
    krName: "회원",
  },
];

export const participationStatus = [
  {
    id: 0,
    name: "pending",
    krName: "대기",
  },
  {
    id: 1,
    name: "approved_presence",
    krName: "출석 승인",
  },
  {
    id: 2,
    name: "late_presence",
    krName: "지각",
  },
  {
    id: 3,
    name: "unexcused_absence",
    krName: "무단 결석",
  },
  {
    id: 4,
    name: "approved_absence",
    krName: "결석 승인",
  },
  {
    id: 5,
    name: "rejected_absence",
    krName: "결석 거절",
  },
  {
    id: 6,
    name: "pending_approved_absence",
    krName: "결석 승인 대기",
  },
];

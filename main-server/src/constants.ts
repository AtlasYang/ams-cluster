export const PG_CONNECTION = 'PG_CONNECTION';
export const MINIO_CONNECTION = 'MINIO_CONNECTION';

export const memberRoles = [
  {
    id: 0,
    name: 'Owner',
  },
  {
    id: 1,
    name: 'Admin',
  },
  {
    id: 2,
    name: 'Member',
  },
];

export const participationStatus = [
  {
    id: 0,
    name: 'pending',
  },
  {
    id: 1,
    name: 'approved_presence',
  },
  {
    id: 2,
    name: 'late_presence',
  },
  {
    id: 3,
    name: 'unexcused_absence',
  },
  {
    id: 4,
    name: 'approved_absence',
  },
  {
    id: 5,
    name: 'rejected_absence',
  },
  {
    id: 6,
    name: 'pending_approved_absence',
  },
];

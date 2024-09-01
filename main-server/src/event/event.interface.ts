export interface Event {
  event_id: number;
  session_id: number;
  event_name: string;
  event_description: string;
  created_at: Date;
  attended: boolean;
}

export interface EventCreateDto {
  session_id: number;
  event_name: string;
  event_description: string;
}

export interface EventParticipation {
  event_id: number;
  member_id: number;
}

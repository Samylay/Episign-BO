export type Teacher = { id: string; name: string; email: string };

export type SessionStatus = 'in_progress' | 'upcoming' | 'completed';
export type Session = {
  id: string;
  code: string;
  course: string;
  teacher: string;
  teacherId: string;
  room: string;
  date: string;
  timeRange: string;
  slot: 'morning' | 'afternoon' | 'full';
  status: SessionStatus;
  classLabel: string;
  enrolled: number;
  signedAM: number;
  signedPM: number;
  teacherCardCode?: string;
  startsAt?: string;
  endsAt?: string;
};

export type StudentRow = {
  id: number;
  name: string;
  email: string;
  signedAM: boolean;
  signedPM: boolean;
  classLabel: string;
};

export type AlertStatus = 'new' | 'resolved' | 'ignored';
export type Alert = {
  id: number;
  type: 'time';
  student: string;
  session: string;
  classLabel: string;
  date: string;
  time: string;
  detail: string;
  status: AlertStatus;
  comment?: string;
};

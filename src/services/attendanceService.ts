import { api } from './axios';

export interface AttendanceRecord {
  id: number;
  participantId: number;
  checkinTime: string;
}

export const attendanceService = {
  async checkIn(participantCode: string) {
    const { data } = await api.post<AttendanceRecord>('/api/attendance/check-in', { participantCode });
    return data;
  },
};

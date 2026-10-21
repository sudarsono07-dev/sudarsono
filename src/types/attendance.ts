export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  phone?: string;
  parentPhone?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  timeRecorded?: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  classId: string;
  records: Record<string, AttendanceRecord>; // studentId -> AttendanceRecord
  submittedAt?: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string; // e.g. "7", "8", "9"
  section: string; // e.g. "A", "B"
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  subject: string;
  students: Student[];
}

export interface SchoolSettings {
  schoolName: string;
  schoolLevel: string; // e.g. "SMP / MTs"
  schoolAddress: string;
  city: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  teacherName: string;
  teacherNip: string;
  teacherRole: string; // "Guru Mata Pelajaran" | "Wali Kelas"
  headmasterName: string;
  headmasterNip: string;
}

export interface MonthlyStats {
  studentId: string;
  studentName: string;
  nisn: string;
  gender: 'L' | 'P';
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  totalDays: number;
  attendancePercentage: number;
  dailyStatus: Record<number, AttendanceStatus | null>; // day (1..31) -> status
}

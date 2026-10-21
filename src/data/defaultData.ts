import { ClassRoom, SchoolSettings, DailyAttendance, AttendanceStatus } from '../types/attendance';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SMP NEGERI 1 TELADAN',
  schoolLevel: 'Sekolah Menengah Pertama',
  schoolAddress: 'Jl. Merdeka Pendidikan No. 12, Jawa Barat',
  city: 'Bandung',
  academicYear: '2025/2026',
  semester: 'Genap',
  teacherName: 'Sudarsono, S.Pd.',
  teacherNip: '19840512 200902 1 003',
  teacherRole: 'Wali Kelas & Guru Mata Pelajaran',
  headmasterName: 'Dr. H. Ahmad Fauzi, M.Pd.',
  headmasterNip: '19760218 200112 1 002',
};

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'cls-7a',
    name: 'Kelas VII-A',
    grade: '7',
    section: 'A',
    academicYear: '2025/2026',
    semester: 'Genap',
    subject: 'Matematika / Wali Kelas',
    students: [
      { id: 'std-1', nisn: '0098234101', nis: '25260701', name: 'Aditya Pratama Putra', gender: 'L', parentPhone: '081234567801' },
      { id: 'std-2', nisn: '0098234102', nis: '25260702', name: 'Aisyah Putri Azzahra', gender: 'P', parentPhone: '081234567802' },
      { id: 'std-3', nisn: '0098234103', nis: '25260703', name: 'Bagas Satria Wicaksono', gender: 'L', parentPhone: '081234567803' },
      { id: 'std-4', nisn: '0098234104', nis: '25260704', name: 'Cantika Dewi Maharani', gender: 'P', parentPhone: '081234567804' },
      { id: 'std-5', nisn: '0098234105', nis: '25260705', name: 'Dafa Arya Ramadhan', gender: 'L', parentPhone: '081234567805' },
      { id: 'std-6', nisn: '0098234106', nis: '25260706', name: 'Dina Nur Aini', gender: 'P', parentPhone: '081234567806' },
      { id: 'std-7', nisn: '0098234107', nis: '25260707', name: 'Fadhil Ihsan Hakim', gender: 'L', parentPhone: '081234567807' },
      { id: 'std-8', nisn: '0098234108', nis: '25260708', name: 'Farah Khairunnisa', gender: 'P', parentPhone: '081234567808' },
      { id: 'std-9', nisn: '0098234109', nis: '25260709', name: 'Gilang Ramadhan Saputra', gender: 'L', parentPhone: '081234567809' },
      { id: 'std-10', nisn: '0098234110', nis: '25260710', name: 'Hafizah Zahra Salsabila', gender: 'P', parentPhone: '081234567810' },
      { id: 'std-11', nisn: '0098234111', nis: '25260711', name: 'Irfan Maulana Rahman', gender: 'L', parentPhone: '081234567811' },
      { id: 'std-12', nisn: '0098234112', nis: '25260712', name: 'Kayla Zaskia Mecca', gender: 'P', parentPhone: '081234567812' },
      { id: 'std-13', nisn: '0098234113', nis: '25260713', name: 'Muhammad Alif Syahputra', gender: 'L', parentPhone: '081234567813' },
      { id: 'std-14', nisn: '0098234114', nis: '25260714', name: 'Nabila Nur Fitriani', gender: 'P', parentPhone: '081234567814' },
      { id: 'std-15', nisn: '0098234115', nis: '25260715', name: 'Rafi Ahmad Fauzan', gender: 'L', parentPhone: '081234567815' },
      { id: 'std-16', nisn: '0098234116', nis: '25260716', name: 'Rania Salma Humaira', gender: 'P', parentPhone: '081234567816' },
      { id: 'std-17', nisn: '0098234117', nis: '25260717', name: 'Rian Hidayat Santoso', gender: 'L', parentPhone: '081234567817' },
      { id: 'std-18', nisn: '0098234118', nis: '25260718', name: 'Siti Sarah Rahmawati', gender: 'P', parentPhone: '081234567818' },
      { id: 'std-19', nisn: '0098234119', nis: '25260719', name: 'Tiara Anggraini Kusuma', gender: 'P', parentPhone: '081234567819' },
      { id: 'std-20', nisn: '0098234120', nis: '25260720', name: 'Zack Lee Kurniawan', gender: 'L', parentPhone: '081234567820' },
    ],
  },
  {
    id: 'cls-7b',
    name: 'Kelas VII-B',
    grade: '7',
    section: 'B',
    academicYear: '2025/2026',
    semester: 'Genap',
    subject: 'Matematika',
    students: [
      { id: 'std-21', nisn: '0098234201', nis: '25260721', name: 'Aldi Firmansyah', gender: 'L' },
      { id: 'std-22', nisn: '0098234202', nis: '25260722', name: 'Bella Safitri', gender: 'P' },
      { id: 'std-23', nisn: '0098234203', nis: '25260723', name: 'Chandra Wijaya', gender: 'L' },
      { id: 'std-24', nisn: '0098234204', nis: '25260724', name: 'Dian Permatasari', gender: 'P' },
      { id: 'std-25', nisn: '0098234205', nis: '25260725', name: 'Eko Prasetyo', gender: 'L' },
      { id: 'std-26', nisn: '0098234206', nis: '25260726', name: 'Fita Anggraini', gender: 'P' },
      { id: 'std-27', nisn: '0098234207', nis: '25260727', name: 'Gani Maulana', gender: 'L' },
      { id: 'std-28', nisn: '0098234208', nis: '25260728', name: 'Hana Aprilia', gender: 'P' },
    ],
  },
  {
    id: 'cls-8a',
    name: 'Kelas VIII-A',
    grade: '8',
    section: 'A',
    academicYear: '2025/2026',
    semester: 'Genap',
    subject: 'Matematika',
    students: [
      { id: 'std-31', nisn: '0088234301', nis: '24250801', name: 'Bayu Nugroho', gender: 'L' },
      { id: 'std-32', nisn: '0088234302', nis: '24250802', name: 'Citra Kirana', gender: 'P' },
      { id: 'std-33', nisn: '0088234303', nis: '24250803', name: 'Danang Sutrisno', gender: 'L' },
      { id: 'std-34', nisn: '0088234304', nis: '24250804', name: 'Elsa Febriani', gender: 'P' },
      { id: 'std-35', nisn: '0088234305', nis: '24250805', name: 'Gibran Rakabuming', gender: 'L' },
    ],
  },
];

// Generate sample attendance records for the current month so recapitulation has data immediately
export function generateInitialAttendanceHistory(classId: string, students: typeof INITIAL_CLASSES[0]['students']): Record<string, DailyAttendance> {
  const result: Record<string, DailyAttendance> = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // Days 1 up to today's date (or 20 days)
  const currentDay = today.getDate();
  const maxDays = Math.min(currentDay, 28);

  for (let d = 1; d <= maxDays; d++) {
    const checkDate = new Date(year, month, d);
    const dayOfWeek = checkDate.getDay();
    // Skip Sunday (0) and Saturday (6)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const records: Record<string, { studentId: string; status: AttendanceStatus; note?: string }> = {};

    students.forEach((student, index) => {
      // Deterministic simulation: mostly Hadir, with occasional Sakit/Izin/Alpa
      const hash = (index * 7 + d * 13) % 100;
      let status: AttendanceStatus = 'H';
      let note: string | undefined = undefined;

      if (hash === 12 || hash === 42) {
        status = 'S';
        note = 'Demam / Surat dokter';
      } else if (hash === 25 || hash === 77) {
        status = 'I';
        note = 'Acara keluarga';
      } else if (hash === 91) {
        status = 'A';
        note = 'Tanpa keterangan';
      }

      records[student.id] = {
        studentId: student.id,
        status,
        note,
      };
    });

    result[`${classId}_${dateKey}`] = {
      date: dateKey,
      classId,
      records,
      submittedAt: new Date(year, month, d, 7, 45).toISOString(),
      notes: d === currentDay ? 'Pencatatan jam pertama selesai' : undefined,
    };
  }

  return result;
}

import * as XLSX from 'xlsx';
import { ClassRoom, SchoolSettings, DailyAttendance, MonthlyStats } from '../types/attendance';
import { formatIndonesianDate, INDONESIAN_MONTHS, getDaysInMonth, isWeekend } from './dateUtils';

export function exportDailyAttendanceToExcel(
  classRoom: ClassRoom,
  date: string,
  dailyData: DailyAttendance | undefined,
  settings: SchoolSettings
) {
  const records = dailyData?.records || {};
  const formattedDate = formatIndonesianDate(date);

  // Calculate statistics
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;

  classRoom.students.forEach((s) => {
    const st = records[s.id]?.status || 'H';
    if (st === 'H') hadir++;
    else if (st === 'S') sakit++;
    else if (st === 'I') izin++;
    else if (st === 'A') alpa++;
  });

  const total = classRoom.students.length;
  const persentase = total > 0 ? ((hadir / total) * 100).toFixed(1) : '0';

  // Build worksheet rows
  const wsData: (string | number)[][] = [
    [settings.schoolName.toUpperCase()],
    [`LAPORAN DAFTAR HADIR / PRESENSI HARIAN SISWA`],
    [`TAHUN AJARAN ${settings.academicYear} - SEMESTER ${settings.semester.toUpperCase()}`],
    [],
    [`Kelas / Rombel`, `: ${classRoom.name}`, '', `Hari / Tanggal`, `: ${formattedDate}`],
    [`Mata Pelajaran`, `: ${classRoom.subject}`, '', `Guru Pengampu`, `: ${settings.teacherName}`],
    [`Alamat Sekolah`, `: ${settings.schoolAddress}`, '', `Waktu Unduh`, `: ${new Date().toLocaleTimeString('id-ID')}`],
    [],
    ['RINGKASAN KEHADIRAN:'],
    ['Total Siswa', total, 'Hadir (H)', hadir, 'Persentase Kehadiran', `${persentase}%`],
    ['Sakit (S)', sakit, 'Izin (I)', izin, 'Alpa (A)', alpa],
    [],
    ['NO', 'NISN', 'NIS', 'NAMA LENGKAP SISWA', 'L/P', 'STATUS KEHADIRAN', 'KETERANGAN'],
  ];

  classRoom.students.forEach((student, index) => {
    const rec = records[student.id];
    const status = rec?.status || 'H';
    const statusLabel =
      status === 'H' ? 'Hadir' :
      status === 'S' ? 'Sakit' :
      status === 'I' ? 'Izin' : 'Alpa (Tanpa Keterangan)';

    wsData.push([
      index + 1,
      student.nisn,
      student.nis,
      student.name,
      student.gender,
      statusLabel,
      rec?.note || '-',
    ]);
  });

  // Signature lines
  wsData.push([]);
  wsData.push([]);
  wsData.push([
    '',
    `Mengetahui,`,
    '',
    '',
    '',
    `${settings.city}, ${formattedDate.split(', ')[1] || date}`,
  ]);
  wsData.push([
    '',
    `Kepala ${settings.schoolName}`,
    '',
    '',
    '',
    settings.teacherRole || 'Guru Pengampu / Wali Kelas',
  ]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([
    '',
    settings.headmasterName,
    '',
    '',
    '',
    settings.teacherName,
  ]);
  wsData.push([
    '',
    `NIP. ${settings.headmasterNip}`,
    '',
    '',
    '',
    `NIP. ${settings.teacherNip}`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // NISN
    { wch: 12 }, // NIS
    { wch: 32 }, // Nama
    { wch: 6 },  // L/P
    { wch: 22 }, // Status
    { wch: 28 }, // Keterangan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Presensi Harian');

  const fileName = `Presensi_Harian_${classRoom.name.replace(/\s+/g, '_')}_${date}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportMonthlyRecapToExcel(
  classRoom: ClassRoom,
  year: number,
  monthIndex: number, // 0..11
  monthlyStats: MonthlyStats[],
  settings: SchoolSettings
) {
  const monthName = INDONESIAN_MONTHS[monthIndex];
  const daysInMonth = getDaysInMonth(year, monthIndex);

  const headerRow1 = [settings.schoolName.toUpperCase()];
  const headerRow2 = [`REKAPITULASI PRESENSI BULANAN SISWA - BULAN ${monthName.toUpperCase()} ${year}`];
  const headerRow3 = [`Kelas: ${classRoom.name} | Semester: ${settings.semester} | Tahun Ajaran: ${settings.academicYear}`];

  // Table headers
  const tableHeader1: (string | number)[] = ['NO', 'NISN', 'NAMA SISWA', 'L/P'];
  for (let d = 1; d <= daysInMonth; d++) {
    tableHeader1.push(d);
  }
  tableHeader1.push('H', 'S', 'I', 'A', '% HADIR');

  const wsData: (string | number)[][] = [
    headerRow1,
    headerRow2,
    headerRow3,
    [],
    [`Wali Kelas / Guru Pengampu: ${settings.teacherName} (NIP. ${settings.teacherNip})`],
    [`Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa/Tanpa Keterangan. Tanggal akhir pekan ditandai tanda strip (-).`],
    [],
    tableHeader1,
  ];

  monthlyStats.forEach((stat, index) => {
    const row: (string | number)[] = [
      index + 1,
      stat.nisn,
      stat.studentName,
      stat.gender,
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      if (isWeekend(year, monthIndex, d)) {
        row.push('-');
      } else {
        const s = stat.dailyStatus[d];
        row.push(s ? s : '-');
      }
    }

    row.push(stat.hadir, stat.sakit, stat.izin, stat.alpa, `${stat.attendancePercentage.toFixed(1)}%`);
    wsData.push(row);
  });

  // Calculate Column Totals for H, S, I, A
  const totalH = monthlyStats.reduce((acc, curr) => acc + curr.hadir, 0);
  const totalS = monthlyStats.reduce((acc, curr) => acc + curr.sakit, 0);
  const totalI = monthlyStats.reduce((acc, curr) => acc + curr.izin, 0);
  const totalA = monthlyStats.reduce((acc, curr) => acc + curr.alpa, 0);
  const avgPct =
    monthlyStats.length > 0
      ? (
          monthlyStats.reduce((acc, curr) => acc + curr.attendancePercentage, 0) /
          monthlyStats.length
        ).toFixed(1)
      : '0';

  const summaryRow: (string | number)[] = ['TOTAL REKAP KELAS', '', '', ''];
  for (let d = 1; d <= daysInMonth; d++) {
    summaryRow.push('');
  }
  summaryRow.push(totalH, totalS, totalI, totalA, `${avgPct}%`);
  wsData.push(summaryRow);

  // Signatures
  wsData.push([]);
  wsData.push([]);
  wsData.push([
    '',
    `Mengetahui,`,
    '',
    '',
    ...Array(daysInMonth - 5).fill(''),
    `${settings.city}, ${daysInMonth} ${monthName} ${year}`,
  ]);
  wsData.push([
    '',
    `Kepala ${settings.schoolName}`,
    '',
    '',
    ...Array(daysInMonth - 5).fill(''),
    settings.teacherRole || 'Wali Kelas / Guru Pengampu',
  ]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([
    '',
    settings.headmasterName,
    '',
    '',
    ...Array(daysInMonth - 5).fill(''),
    settings.teacherName,
  ]);
  wsData.push([
    '',
    `NIP. ${settings.headmasterNip}`,
    '',
    '',
    ...Array(daysInMonth - 5).fill(''),
    `NIP. ${settings.teacherNip}`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column width config
  const colWidths: { wch: number }[] = [
    { wch: 5 },  // No
    { wch: 14 }, // NISN
    { wch: 28 }, // Nama
    { wch: 5 },  // L/P
  ];
  for (let d = 1; d <= daysInMonth; d++) {
    colWidths.push({ wch: 4 }); // date columns
  }
  colWidths.push({ wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 10 }); // H, S, I, A, %

  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Rekap_${monthName}`);

  const fileName = `Rekap_Bulanan_${classRoom.name.replace(/\s+/g, '_')}_${monthName}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClassRoom, SchoolSettings, DailyAttendance, MonthlyStats } from '../types/attendance';
import { formatIndonesianDate, INDONESIAN_MONTHS, getDaysInMonth, isWeekend } from './dateUtils';

export function exportDailyAttendanceToPdf(
  classRoom: ClassRoom,
  date: string,
  dailyData: DailyAttendance | undefined,
  settings: SchoolSettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const formattedDate = formatIndonesianDate(date);
  const records = dailyData?.records || {};

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

  // KOP SURAT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEMERINTAH DAERAH PROVINSI / KABUPATEN', 105, 14, { align: 'center' });
  doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', 105, 19, { align: 'center' });
  doc.setFontSize(14);
  doc.text(settings.schoolName.toUpperCase(), 105, 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${settings.schoolAddress} - Kota ${settings.city}`, 105, 30, { align: 'center' });

  // Line separator
  doc.setLineWidth(0.8);
  doc.line(14, 33, 196, 33);
  doc.setLineWidth(0.2);
  doc.line(14, 34, 196, 34);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LAPORAN DAFTAR HADIR / PRESENSI HARIAN SISWA', 105, 41, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tahun Ajaran ${settings.academicYear} | Semester ${settings.semester}`, 105, 46, { align: 'center' });

  // Metadata Grid
  doc.setFontSize(9);
  doc.text(`Kelas / Rombel : ${classRoom.name}`, 14, 53);
  doc.text(`Mata Pelajaran : ${classRoom.subject}`, 14, 58);
  doc.text(`Hari, Tanggal   : ${formattedDate}`, 120, 53);
  doc.text(`Guru Pengampu  : ${settings.teacherName}`, 120, 58);

  // Stats Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 62, 182, 11, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 62, 182, 11, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Total: ${total} Siswa | Hadir: ${hadir} | Sakit: ${sakit} | Izin: ${izin} | Alpa: ${alpa} | Tingkat Kehadiran: ${persentase}%`,
    105,
    69,
    { align: 'center' }
  );

  // Table Body
  const tableRows = classRoom.students.map((student, idx) => {
    const rec = records[student.id];
    const status = rec?.status || 'H';
    const statusLabel =
      status === 'H' ? 'Hadir (H)' :
      status === 'S' ? 'Sakit (S)' :
      status === 'I' ? 'Izin (I)' : 'Alpa (A)';

    return [
      idx + 1,
      student.nisn,
      student.nis,
      student.name,
      student.gender,
      statusLabel,
      rec?.note || '-',
    ];
  });

  autoTable(doc, {
    startY: 76,
    head: [['No', 'NISN', 'NIS', 'Nama Lengkap Siswa', 'L/P', 'Status', 'Keterangan']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 22 },
      3: { cellWidth: 55 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 25 },
      6: { cellWidth: 32 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw);
        if (val.includes('(H)')) data.cell.styles.textColor = [21, 128, 61];
        else if (val.includes('(S)')) data.cell.styles.textColor = [29, 78, 216];
        else if (val.includes('(I)')) data.cell.styles.textColor = [180, 83, 9];
        else if (val.includes('(A)')) data.cell.styles.textColor = [185, 28, 28];
      }
    },
  });

  // Calculate signature position
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  const signatureY = finalY + 12 < 240 ? finalY + 12 : 240;

  if (signatureY > 235) {
    doc.addPage();
  }

  const actualSignY = signatureY > 235 ? 30 : signatureY;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', 40, actualSignY, { align: 'center' });
  doc.text(`Kepala ${settings.schoolName}`, 40, actualSignY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(settings.headmasterName, 40, actualSignY + 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.headmasterNip}`, 40, actualSignY + 33, { align: 'center' });

  doc.text(`${settings.city}, ${formattedDate.split(', ')[1] || date}`, 160, actualSignY, { align: 'center' });
  doc.text(settings.teacherRole || 'Guru Pengampu / Wali Kelas', 160, actualSignY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(settings.teacherName, 160, actualSignY + 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.teacherNip}`, 160, actualSignY + 33, { align: 'center' });

  const fileName = `Laporan_Presensi_Harian_${classRoom.name.replace(/\s+/g, '_')}_${date}.pdf`;
  doc.save(fileName);
}

export function exportMonthlyRecapToPdf(
  classRoom: ClassRoom,
  year: number,
  monthIndex: number,
  monthlyStats: MonthlyStats[],
  settings: SchoolSettings
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const monthName = INDONESIAN_MONTHS[monthIndex];
  const daysInMonth = getDaysInMonth(year, monthIndex);

  // KOP
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(settings.schoolName.toUpperCase(), 148, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`REKAPITULASI PRESENSI BULANAN SISWA - BULAN ${monthName.toUpperCase()} ${year}`, 148, 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Kelas: ${classRoom.name} | Semester: ${settings.semester} | Tahun Ajaran: ${settings.academicYear} | Wali Kelas: ${settings.teacherName}`, 148, 22, { align: 'center' });

  doc.setLineWidth(0.4);
  doc.line(14, 25, 283, 25);

  // Build Table Headers
  const dateHeaders: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dateHeaders.push(String(d));
  }

  const head = [
    [
      'No',
      'Nama Siswa',
      'L/P',
      ...dateHeaders,
      'H',
      'S',
      'I',
      'A',
      '%',
    ],
  ];

  const body = monthlyStats.map((stat, idx) => {
    const daysCells: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      if (isWeekend(year, monthIndex, d)) {
        daysCells.push('-');
      } else {
        daysCells.push(stat.dailyStatus[d] || '-');
      }
    }

    return [
      String(idx + 1),
      stat.studentName,
      stat.gender,
      ...daysCells,
      String(stat.hadir),
      String(stat.sakit),
      String(stat.izin),
      String(stat.alpa),
      `${stat.attendancePercentage.toFixed(0)}%`,
    ];
  });

  // Summary Row
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

  body.push([
    '',
    'TOTAL KELAS',
    '',
    ...Array(daysInMonth).fill(''),
    String(totalH),
    String(totalS),
    String(totalI),
    String(totalA),
    `${avgPct}%`,
  ]);

  // Dynamic column widths for landscape A4 (approx 269mm usable width)
  const colStyles: Record<number, any> = {
    0: { cellWidth: 8, halign: 'center' },
    1: { cellWidth: 42 },
    2: { cellWidth: 8, halign: 'center' },
  };

  const dayColWidth = Math.max(4.5, (269 - 8 - 42 - 8 - (5 * 7.5)) / daysInMonth);
  for (let i = 0; i < daysInMonth; i++) {
    colStyles[3 + i] = { cellWidth: dayColWidth, halign: 'center', fontSize: 6.5 };
  }
  const summaryStart = 3 + daysInMonth;
  colStyles[summaryStart] = { cellWidth: 7.5, halign: 'center', fontStyle: 'bold' };
  colStyles[summaryStart + 1] = { cellWidth: 7.5, halign: 'center' };
  colStyles[summaryStart + 2] = { cellWidth: 7.5, halign: 'center' };
  colStyles[summaryStart + 3] = { cellWidth: 7.5, halign: 'center' };
  colStyles[summaryStart + 4] = { cellWidth: 10, halign: 'center', fontStyle: 'bold' };

  autoTable(doc, {
    startY: 28,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.2,
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: colStyles,
    didParseCell: (data) => {
      // Highlight weekends
      if (data.section === 'body' && data.column.index >= 3 && data.column.index < 3 + daysInMonth) {
        const dayNum = data.column.index - 2;
        if (isWeekend(year, monthIndex, dayNum)) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [148, 163, 184];
        } else {
          const val = data.cell.raw;
          if (val === 'H') data.cell.styles.textColor = [21, 128, 61];
          else if (val === 'S') data.cell.styles.textColor = [29, 78, 216];
          else if (val === 'I') data.cell.styles.textColor = [180, 83, 9];
          else if (val === 'A') data.cell.styles.textColor = [185, 28, 28];
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  const signY = finalY + 8 < 175 ? finalY + 8 : 175;

  if (signY > 170) {
    doc.addPage();
  }
  const actualSignY = signY > 170 ? 25 : signY;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', 50, actualSignY, { align: 'center' });
  doc.text(`Kepala ${settings.schoolName}`, 50, actualSignY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(settings.headmasterName, 50, actualSignY + 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.headmasterNip}`, 50, actualSignY + 24, { align: 'center' });

  doc.text(`${settings.city}, ${daysInMonth} ${monthName} ${year}`, 235, actualSignY, { align: 'center' });
  doc.text(settings.teacherRole || 'Wali Kelas / Guru Pengampu', 235, actualSignY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(settings.teacherName, 235, actualSignY + 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.teacherNip}`, 235, actualSignY + 24, { align: 'center' });

  const fileName = `Rekap_Presensi_Bulanan_${classRoom.name.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`;
  doc.save(fileName);
}

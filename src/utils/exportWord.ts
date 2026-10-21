import { ClassRoom, SchoolSettings, DailyAttendance, MonthlyStats } from '../types/attendance';
import { formatIndonesianDate, INDONESIAN_MONTHS, getDaysInMonth, isWeekend } from './dateUtils';

function triggerDownload(content: string, fileName: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDailyAttendanceToWord(
  classRoom: ClassRoom,
  date: string,
  dailyData: DailyAttendance | undefined,
  settings: SchoolSettings
) {
  const records = dailyData?.records || {};
  const formattedDate = formatIndonesianDate(date);

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

  const rowsHtml = classRoom.students
    .map((student, idx) => {
      const rec = records[student.id];
      const status = rec?.status || 'H';
      const statusText =
        status === 'H' ? '<span style="color:#15803d;font-weight:bold;">Hadir</span>' :
        status === 'S' ? '<span style="color:#1d4ed8;font-weight:bold;">Sakit</span>' :
        status === 'I' ? '<span style="color:#b45309;font-weight:bold;">Izin</span>' :
        '<span style="color:#b91c1c;font-weight:bold;">Alpa</span>';

      return `
        <tr>
          <td style="text-align:center;padding:6px;border:1px solid #333;">${idx + 1}</td>
          <td style="text-align:center;padding:6px;border:1px solid #333;">${student.nisn}</td>
          <td style="text-align:center;padding:6px;border:1px solid #333;">${student.nis}</td>
          <td style="padding:6px 10px;border:1px solid #333;">${student.name}</td>
          <td style="text-align:center;padding:6px;border:1px solid #333;">${student.gender}</td>
          <td style="text-align:center;padding:6px;border:1px solid #333;">${statusText}</td>
          <td style="padding:6px 10px;border:1px solid #333;">${rec?.note || '-'}</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Laporan Presensi Harian</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; color: #111; margin: 20px; }
        .kop-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 0; text-transform: uppercase; }
        .kop-subtitle { text-align: center; font-size: 11pt; margin: 2px 0; }
        .kop-line { border-top: 3px double #000; margin: 12px 0 16px 0; }
        .meta-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; }
        .meta-table td { padding: 3px 6px; font-size: 10.5pt; vertical-align: top; }
        .recap-box { margin-bottom: 15px; padding: 10px; background-color: #f8fafc; border: 1px solid #cbd5e1; }
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.data-table th { background-color: #f1f5f9; border: 1px solid #333; padding: 7px; font-size: 10pt; text-align: center; }
        .signature-table { width: 100%; margin-top: 35px; border-collapse: collapse; page-break-inside: avoid; }
        .signature-table td { text-align: center; vertical-align: top; width: 50%; padding: 4px; }
      </style>
    </head>
    <body>
      <div style="text-align:center;">
        <p class="kop-subtitle" style="font-weight:bold;letter-spacing:1px;">PEMERINTAH DAERAH PROVINSI / KABUPATEN</p>
        <p class="kop-subtitle" style="font-weight:bold;">DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
        <h2 class="kop-title">${settings.schoolName}</h2>
        <p class="kop-subtitle">${settings.schoolAddress} &bull; Kota ${settings.city}</p>
        <div class="kop-line"></div>
      </div>

      <h3 style="text-align:center;text-decoration:underline;margin:0 0 4px 0;font-size:12pt;">LAPORAN DAFTAR HADIR / PRESENSI HARIAN SISWA</h3>
      <p style="text-align:center;font-size:10pt;margin:0 0 14px 0;">Tahun Ajaran ${settings.academicYear} &mdash; Semester ${settings.semester}</p>

      <table class="meta-table">
        <tr>
          <td style="width:18%;"><strong>Kelas / Rombel</strong></td>
          <td style="width:32%;">: ${classRoom.name}</td>
          <td style="width:18%;"><strong>Hari, Tanggal</strong></td>
          <td style="width:32%;">: ${formattedDate}</td>
        </tr>
        <tr>
          <td><strong>Mata Pelajaran</strong></td>
          <td>: ${classRoom.subject}</td>
          <td><strong>Wali Kelas / Guru</strong></td>
          <td>: ${settings.teacherName}</td>
        </tr>
      </table>

      <div class="recap-box">
        <table style="width:100%;font-size:10pt;">
          <tr>
            <td><strong>Total Siswa:</strong> ${total} Orang</td>
            <td><strong>Hadir (H):</strong> ${hadir} Orang</td>
            <td><strong>Sakit (S):</strong> ${sakit} Orang</td>
            <td><strong>Izin (I):</strong> ${izin} Orang</td>
            <td><strong>Alpa (A):</strong> ${alpa} Orang</td>
            <td><strong>Tingkat Kehadiran:</strong> <strong>${persentase}%</strong></td>
          </tr>
        </table>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:15%;">NISN</th>
            <th style="width:12%;">NIS</th>
            <th>Nama Lengkap Siswa</th>
            <th style="width:6%;">L/P</th>
            <th style="width:14%;">Status</th>
            <th style="width:25%;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <table class="signature-table">
        <tr>
          <td>
            Mengetahui,<br>
            Kepala ${settings.schoolName}
            <br><br><br><br><br>
            <strong><u>${settings.headmasterName}</u></strong><br>
            NIP. ${settings.headmasterNip}
          </td>
          <td>
            ${settings.city}, ${formattedDate.split(', ')[1] || date}<br>
            ${settings.teacherRole || 'Guru Pengampu / Wali Kelas'}
            <br><br><br><br><br>
            <strong><u>${settings.teacherName}</u></strong><br>
            NIP. ${settings.teacherNip}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const fileName = `Laporan_Presensi_Harian_${classRoom.name.replace(/\s+/g, '_')}_${date}.doc`;
  triggerDownload(htmlContent, fileName);
}

export function exportMonthlyRecapToWord(
  classRoom: ClassRoom,
  year: number,
  monthIndex: number,
  monthlyStats: MonthlyStats[],
  settings: SchoolSettings
) {
  const monthName = INDONESIAN_MONTHS[monthIndex];
  const daysInMonth = getDaysInMonth(year, monthIndex);

  let thDays = '';
  for (let d = 1; d <= daysInMonth; d++) {
    const isWk = isWeekend(year, monthIndex, d);
    thDays += `<th style="width:20px;padding:3px;border:1px solid #333;font-size:8pt;${isWk ? 'background-color:#fee2e2;' : ''}">${d}</th>`;
  }

  const rowsHtml = monthlyStats
    .map((stat, idx) => {
      let tdDays = '';
      for (let d = 1; d <= daysInMonth; d++) {
        const isWk = isWeekend(year, monthIndex, d);
        if (isWk) {
          tdDays += `<td style="text-align:center;padding:2px;border:1px solid #333;background-color:#f1f5f9;font-size:8pt;color:#94a3b8;">-</td>`;
        } else {
          const s = stat.dailyStatus[d];
          const color =
            s === 'H' ? '#15803d' :
            s === 'S' ? '#1d4ed8' :
            s === 'I' ? '#b45309' :
            s === 'A' ? '#b91c1c' : '#cbd5e1';
          tdDays += `<td style="text-align:center;padding:2px;border:1px solid #333;font-size:8pt;font-weight:bold;color:${color};">${s || '-'}</td>`;
        }
      }

      return `
        <tr>
          <td style="text-align:center;padding:4px;border:1px solid #333;font-size:8.5pt;">${idx + 1}</td>
          <td style="padding:4px 6px;border:1px solid #333;font-size:8.5pt;white-space:nowrap;">${stat.studentName}</td>
          <td style="text-align:center;padding:4px;border:1px solid #333;font-size:8.5pt;">${stat.gender}</td>
          ${tdDays}
          <td style="text-align:center;padding:3px;border:1px solid #333;font-size:8.5pt;font-weight:bold;color:#15803d;">${stat.hadir}</td>
          <td style="text-align:center;padding:3px;border:1px solid #333;font-size:8.5pt;color:#1d4ed8;">${stat.sakit}</td>
          <td style="text-align:center;padding:3px;border:1px solid #333;font-size:8.5pt;color:#b45309;">${stat.izin}</td>
          <td style="text-align:center;padding:3px;border:1px solid #333;font-size:8.5pt;color:#b91c1c;">${stat.alpa}</td>
          <td style="text-align:center;padding:3px;border:1px solid #333;font-size:8.5pt;font-weight:bold;">${stat.attendancePercentage.toFixed(1)}%</td>
        </tr>
      `;
    })
    .join('');

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

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Rekapitulasi Presensi Bulanan</title>
      <style>
        @page { size: landscape; margin: 1.5cm; }
        body { font-family: 'Times New Roman', serif; font-size: 9.5pt; line-height: 1.2; color: #111; margin: 15px; }
        .kop-title { text-align: center; font-size: 13pt; font-weight: bold; margin: 0; text-transform: uppercase; }
        .kop-subtitle { text-align: center; font-size: 10pt; margin: 2px 0; }
        .kop-line { border-top: 2px double #000; margin: 8px 0 12px 0; }
        table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        table.matrix-table th { background-color: #f1f5f9; border: 1px solid #333; padding: 4px 2px; font-size: 8.5pt; }
        .signature-table { width: 100%; margin-top: 25px; border-collapse: collapse; page-break-inside: avoid; }
        .signature-table td { text-align: center; vertical-align: top; width: 50%; font-size: 9.5pt; }
      </style>
    </head>
    <body>
      <div style="text-align:center;">
        <h2 class="kop-title">${settings.schoolName}</h2>
        <p class="kop-subtitle">REKAPITULASI PRESENSI BULANAN SISWA &mdash; BULAN ${monthName.toUpperCase()} ${year}</p>
        <p class="kop-subtitle" style="font-size:9pt;">Kelas: <strong>${classRoom.name}</strong> &bull; Semester: <strong>${settings.semester}</strong> &bull; Tahun Ajaran: <strong>${settings.academicYear}</strong></p>
        <div class="kop-line"></div>
      </div>

      <p style="font-size:8.5pt;margin:4px 0 8px 0;"><strong>Keterangan:</strong> H = Hadir, S = Sakit, I = Izin, A = Alpa. Kolom berarsir/abu adalah hari libur akhir pekan.</p>

      <table class="matrix-table">
        <thead>
          <tr>
            <th rowspan="2" style="width:25px;">No</th>
            <th rowspan="2" style="width:160px;">Nama Siswa</th>
            <th rowspan="2" style="width:25px;">L/P</th>
            <th colspan="${daysInMonth}">Tanggal Presensi (1 - ${daysInMonth})</th>
            <th colspan="5">Rekapitulasi</th>
          </tr>
          <tr>
            ${thDays}
            <th style="width:25px;">H</th>
            <th style="width:25px;">S</th>
            <th style="width:25px;">I</th>
            <th style="width:25px;">A</th>
            <th style="width:45px;">%</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr style="background-color:#f8fafc;font-weight:bold;">
            <td colspan="${daysInMonth + 3}" style="text-align:right;padding:5px;border:1px solid #333;font-size:8.5pt;">TOTAL REKAPITULASI KELAS:</td>
            <td style="text-align:center;border:1px solid #333;padding:4px;color:#15803d;font-size:8.5pt;">${totalH}</td>
            <td style="text-align:center;border:1px solid #333;padding:4px;color:#1d4ed8;font-size:8.5pt;">${totalS}</td>
            <td style="text-align:center;border:1px solid #333;padding:4px;color:#b45309;font-size:8.5pt;">${totalI}</td>
            <td style="text-align:center;border:1px solid #333;padding:4px;color:#b91c1c;font-size:8.5pt;">${totalA}</td>
            <td style="text-align:center;border:1px solid #333;padding:4px;font-size:8.5pt;">${avgPct}%</td>
          </tr>
        </tbody>
      </table>

      <table class="signature-table">
        <tr>
          <td>
            Mengetahui,<br>
            Kepala ${settings.schoolName}
            <br><br><br><br>
            <strong><u>${settings.headmasterName}</u></strong><br>
            NIP. ${settings.headmasterNip}
          </td>
          <td>
            ${settings.city}, ${daysInMonth} ${monthName} ${year}<br>
            ${settings.teacherRole || 'Wali Kelas / Guru Pengampu'}
            <br><br><br><br>
            <strong><u>${settings.teacherName}</u></strong><br>
            NIP. ${settings.teacherNip}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const fileName = `Rekap_Presensi_Bulanan_${classRoom.name.replace(/\s+/g, '_')}_${monthName}_${year}.doc`;
  triggerDownload(htmlContent, fileName);
}

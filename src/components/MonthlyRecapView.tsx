import React, { useState, useMemo } from 'react';
import { ClassRoom, DailyAttendance, SchoolSettings, MonthlyStats, AttendanceStatus } from '../types/attendance';
import { INDONESIAN_MONTHS, getDaysInMonth, isWeekend } from '../utils/dateUtils';
import { exportMonthlyRecapToExcel } from '../utils/exportExcel';
import { exportMonthlyRecapToWord } from '../utils/exportWord';
import { exportMonthlyRecapToPdf } from '../utils/exportPdf';
import {
  Calendar,
  FileText,
  FileSpreadsheet,
  FileCode2,
  Printer,
  Search,
  Award,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface MonthlyRecapViewProps {
  selectedClass: ClassRoom;
  attendanceRecords: Record<string, DailyAttendance>;
  schoolSettings: SchoolSettings;
  onOpenPrintModal: (mode: 'daily' | 'monthly') => void;
}

export const MonthlyRecapView: React.FC<MonthlyRecapViewProps> = ({
  selectedClass,
  attendanceRecords,
  schoolSettings,
  onOpenPrintModal,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0..11
  const [searchTerm, setSearchTerm] = useState('');

  const daysInMonth = useMemo(() => {
    return getDaysInMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Compute stats for each student in this month
  const monthlyStats: MonthlyStats[] = useMemo(() => {
    return selectedClass.students.map((student) => {
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      let totalSchoolDays = 0;
      const dailyStatus: Record<number, AttendanceStatus | null> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const isWk = isWeekend(selectedYear, selectedMonth, day);
        if (isWk) {
          dailyStatus[day] = null;
          continue;
        }

        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const key = `${selectedClass.id}_${dateStr}`;
        const dailyRecord = attendanceRecords[key];

        if (dailyRecord) {
          totalSchoolDays++;
          const rec = dailyRecord.records[student.id];
          const st = rec ? rec.status : 'H';
          dailyStatus[day] = st;

          if (st === 'H') hadir++;
          else if (st === 'S') sakit++;
          else if (st === 'I') izin++;
          else if (st === 'A') alpa++;
        } else {
          // If no record taken on this school day, leave blank
          dailyStatus[day] = null;
        }
      }

      const totalRecordedDays = hadir + sakit + izin + alpa;
      const percentage = totalRecordedDays > 0 ? (hadir / totalRecordedDays) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        nisn: student.nisn,
        gender: student.gender,
        hadir,
        sakit,
        izin,
        alpa,
        totalDays: totalRecordedDays,
        attendancePercentage: percentage,
        dailyStatus,
      };
    });
  }, [selectedClass, attendanceRecords, selectedYear, selectedMonth, daysInMonth]);

  // Filtered by search
  const filteredStats = useMemo(() => {
    return monthlyStats.filter((stat) =>
      stat.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stat.nisn.includes(searchTerm)
    );
  }, [monthlyStats, searchTerm]);

  // Summary Metrics
  const classSummary = useMemo(() => {
    const totalStudents = monthlyStats.length;
    const totalH = monthlyStats.reduce((acc, curr) => acc + curr.hadir, 0);
    const totalS = monthlyStats.reduce((acc, curr) => acc + curr.sakit, 0);
    const totalI = monthlyStats.reduce((acc, curr) => acc + curr.izin, 0);
    const totalA = monthlyStats.reduce((acc, curr) => acc + curr.alpa, 0);
    const totalEntries = totalH + totalS + totalI + totalA;
    const avgAttendance = totalEntries > 0 ? (totalH / totalEntries) * 100 : 0;

    const perfectStudents = monthlyStats.filter((s) => s.totalDays > 0 && s.attendancePercentage === 100);
    const attentionNeeded = monthlyStats.filter((s) => s.alpa >= 2 || (s.totalDays > 0 && s.attendancePercentage < 80));

    // Calculate active days with recorded attendance
    let activeDaysCount = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const key = `${selectedClass.id}_${dateStr}`;
      if (attendanceRecords[key]) {
        activeDaysCount++;
      }
    }

    return {
      totalStudents,
      activeDaysCount,
      totalH,
      totalS,
      totalI,
      totalA,
      avgAttendance,
      perfectStudents,
      attentionNeeded,
    };
  }, [monthlyStats, daysInMonth, selectedYear, selectedMonth, selectedClass.id, attendanceRecords]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Month Selector & Export Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Rekapitulasi Bulanan Otomatis</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Matriks Presensi {selectedClass.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bulan {INDONESIAN_MONTHS[selectedMonth]} {selectedYear} &bull; Semester {schoolSettings.semester} &bull; TA {schoolSettings.academicYear}
            </p>
          </div>

          {/* Download Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportMonthlyRecapToWord(selectedClass, selectedYear, selectedMonth, monthlyStats, schoolSettings)}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh laporan bulanan dalam format Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Word (.doc)</span>
            </button>

            <button
              onClick={() => exportMonthlyRecapToExcel(selectedClass, selectedYear, selectedMonth, monthlyStats, schoolSettings)}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh format tabel matriks lengkap dalam format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportMonthlyRecapToPdf(selectedClass, selectedYear, selectedMonth, monthlyStats, schoolSettings)}
              className="px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh format cetak landscape dalam format PDF (.pdf)"
            >
              <FileCode2 className="w-4 h-4 text-rose-600" />
              <span>PDF (.pdf)</span>
            </button>

            <button
              onClick={() => onOpenPrintModal('monthly')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Pratinjau cetak resmi"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau Cetak</span>
            </button>
          </div>
        </div>

        {/* Month & Year Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Pilih Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {INDONESIAN_MONTHS.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Hari Efektif Belajar</span>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums mt-1">
            {classSummary.activeDaysCount} <span className="text-sm font-normal text-slate-500">Hari</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Presensi tercatat di kelas
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Rata-rata Hadir Kelas</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1">
            {classSummary.avgAttendance.toFixed(1)}%
          </div>
          <span className="text-[11px] text-indigo-600 block mt-0.5">
            Tingkat partisipasi belajar
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Siswa Hadir 100%</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {classSummary.perfectStudents.length} <span className="text-sm font-normal text-slate-500">Siswa</span>
          </div>
          <span className="text-[11px] text-emerald-600 block mt-0.5">
            Predikat sangat rajin / teladan
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Perlu Perhatian (Alpa &ge; 2)</span>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums mt-1">
            {classSummary.attentionNeeded.length} <span className="text-sm font-normal text-slate-500">Siswa</span>
          </div>
          <span className="text-[11px] text-rose-600 block mt-0.5">
            Butuh pembinaan wali kelas
          </span>
        </div>
      </div>

      {/* Matrix Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Tabel Matriks Presensi Harian (1 &ndash; {daysInMonth} {INDONESIAN_MONTHS[selectedMonth]})
            </h3>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa di matriks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 z-20 shadow-xs border-b border-slate-200">
              <tr>
                <th rowSpan={2} className="py-2.5 px-3 w-10 text-center border-r border-slate-200 bg-slate-50">
                  No
                </th>
                <th rowSpan={2} className="py-2.5 px-3 w-48 border-r border-slate-200 bg-slate-50 sticky left-0 z-30 shadow-xs">
                  Nama Lengkap Siswa
                </th>
                <th rowSpan={2} className="py-2.5 px-2 w-10 text-center border-r border-slate-200 bg-slate-50">
                  L/P
                </th>
                <th colSpan={daysInMonth} className="py-1 px-2 text-center border-r border-slate-200 bg-slate-100 font-semibold text-slate-700">
                  Tanggal Presensi ({INDONESIAN_MONTHS[selectedMonth]} {selectedYear})
                </th>
                <th colSpan={5} className="py-1 px-2 text-center bg-indigo-50/70 font-semibold text-indigo-900">
                  Total Rekapitulasi
                </th>
              </tr>
              <tr className="border-t border-slate-200">
                {/* Day numbers 1 to 31 */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isWk = isWeekend(selectedYear, selectedMonth, day);
                  return (
                    <th
                      key={day}
                      className={`py-1.5 px-1 min-w-[26px] text-center font-mono tabular-nums border-r border-slate-200 text-[11px] ${
                        isWk ? 'bg-rose-50 text-rose-500 font-semibold' : 'bg-slate-50 text-slate-700'
                      }`}
                      title={isWk ? `Tanggal ${day}: Akhir Pekan / Libur` : `Tanggal ${day}`}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="py-1.5 px-2 text-center bg-emerald-50 text-emerald-800 font-bold border-r border-slate-200 min-w-[32px]">
                  H
                </th>
                <th className="py-1.5 px-2 text-center bg-blue-50 text-blue-800 font-bold border-r border-slate-200 min-w-[32px]">
                  S
                </th>
                <th className="py-1.5 px-2 text-center bg-amber-50 text-amber-800 font-bold border-r border-slate-200 min-w-[32px]">
                  I
                </th>
                <th className="py-1.5 px-2 text-center bg-rose-50 text-rose-800 font-bold border-r border-slate-200 min-w-[32px]">
                  A
                </th>
                <th className="py-1.5 px-2 text-center bg-indigo-50 text-indigo-800 font-bold min-w-[50px]">
                  %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStats.map((stat, idx) => (
                <tr key={stat.studentId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-500 font-mono tabular-nums border-r border-slate-100">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-xs whitespace-nowrap">
                    <div>{stat.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">{stat.nisn}</div>
                  </td>
                  <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-100">
                    {stat.gender}
                  </td>

                  {/* Day Statuses */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const isWk = isWeekend(selectedYear, selectedMonth, day);
                    const status = stat.dailyStatus[day];

                    if (isWk) {
                      return (
                        <td
                          key={day}
                          className="py-1 px-1 text-center bg-slate-100/60 text-slate-300 border-r border-slate-100 text-[10px]"
                        >
                          -
                        </td>
                      );
                    }

                    return (
                      <td
                        key={day}
                        className="py-1 px-1 text-center border-r border-slate-100 font-mono font-bold text-[11px]"
                      >
                        {status === 'H' ? (
                          <span className="text-emerald-600">H</span>
                        ) : status === 'S' ? (
                          <span className="text-blue-600">S</span>
                        ) : status === 'I' ? (
                          <span className="text-amber-600">I</span>
                        ) : status === 'A' ? (
                          <span className="text-rose-600">A</span>
                        ) : (
                          <span className="text-slate-200">&bull;</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Totals */}
                  <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100 font-mono tabular-nums">
                    {stat.hadir}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-blue-700 bg-blue-50/30 border-r border-slate-100 font-mono tabular-nums">
                    {stat.sakit}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-amber-700 bg-amber-50/30 border-r border-slate-100 font-mono tabular-nums">
                    {stat.izin}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/30 border-r border-slate-100 font-mono tabular-nums">
                    {stat.alpa}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-indigo-700 bg-indigo-50/30 font-mono tabular-nums">
                    {stat.attendancePercentage.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total Row */}
            <tfoot className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-2.5 px-4 text-right text-slate-700 border-r border-slate-200">
                  TOTAL KELAS:
                </td>
                <td colSpan={daysInMonth} className="py-2 px-2 text-center text-slate-500 border-r border-slate-200 text-[11px]">
                  Rangkuman Akumulasi Seluruh Siswa
                </td>
                <td className="py-2 px-2 text-center text-emerald-800 bg-emerald-100/60 border-r border-slate-200 font-mono">
                  {classSummary.totalH}
                </td>
                <td className="py-2 px-2 text-center text-blue-800 bg-blue-100/60 border-r border-slate-200 font-mono">
                  {classSummary.totalS}
                </td>
                <td className="py-2 px-2 text-center text-amber-800 bg-amber-100/60 border-r border-slate-200 font-mono">
                  {classSummary.totalI}
                </td>
                <td className="py-2 px-2 text-center text-rose-800 bg-rose-100/60 border-r border-slate-200 font-mono">
                  {classSummary.totalA}
                </td>
                <td className="py-2 px-2 text-center text-indigo-900 bg-indigo-100/60 font-mono">
                  {classSummary.avgAttendance.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Keterangan Singkatan:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong>H</strong> = Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span><strong>S</strong> = Sakit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span><strong>I</strong> = Izin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span><strong>A</strong> = Alpa</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Tanda strip (-) menandakan hari libur akhir pekan (Sabtu & Minggu)
          </div>
        </div>
      </div>
    </div>
  );
};

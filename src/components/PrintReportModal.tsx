import React, { useRef } from 'react';
import { ClassRoom, DailyAttendance, MonthlyStats, SchoolSettings } from '../types/attendance';
import { formatIndonesianDate, INDONESIAN_MONTHS, getDaysInMonth, isWeekend } from '../utils/dateUtils';
import { Printer, X, Download } from 'lucide-react';
import { exportDailyAttendanceToPdf, exportMonthlyRecapToPdf } from '../utils/exportPdf';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'daily' | 'monthly';
  selectedClass: ClassRoom;
  selectedDate: string;
  dailyAttendance: DailyAttendance | undefined;
  monthlyStats: MonthlyStats[];
  selectedMonth: number;
  selectedYear: number;
  schoolSettings: SchoolSettings;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedClass,
  selectedDate,
  dailyAttendance,
  monthlyStats,
  selectedMonth,
  selectedYear,
  schoolSettings,
}) => {
  if (!isOpen) return null;

  const records = dailyAttendance?.records || {};
  const formattedDate = formatIndonesianDate(selectedDate);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const monthName = INDONESIAN_MONTHS[selectedMonth];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Pratinjau Format Cetak Kertas Resmi ({mode === 'daily' ? 'Harian' : 'Bulanan'})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (mode === 'daily') {
                  exportDailyAttendanceToPdf(selectedClass, selectedDate, dailyAttendance, schoolSettings);
                } else {
                  exportMonthlyRecapToPdf(selectedClass, selectedYear, selectedMonth, monthlyStats, schoolSettings);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Viewport */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/70 print:p-0 print:bg-white">
          <div className="bg-white p-6 sm:p-10 max-w-[210mm] mx-auto shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none text-slate-900 font-serif">
            {/* KOP SURAT RESMI */}
            <div className="text-center border-b-4 border-double border-slate-900 pb-3 mb-6">
              <p className="text-xs font-bold tracking-widest uppercase text-slate-700">
                PEMERINTAH DAERAH PROVINSI / KABUPATEN
              </p>
              <p className="text-xs font-bold uppercase text-slate-800">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </p>
              <h1 className="text-xl font-bold uppercase text-slate-900 mt-1">
                {schoolSettings.schoolName}
              </h1>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                {schoolSettings.schoolAddress} &bull; Kota {schoolSettings.city}
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h2 className="text-base font-bold underline uppercase text-slate-900">
                {mode === 'daily'
                  ? 'LAPORAN DAFTAR HADIR / PRESENSI HARIAN SISWA'
                  : `REKAPITULASI PRESENSI BULANAN SISWA - BULAN ${monthName.toUpperCase()} ${selectedYear}`}
              </h2>
              <p className="text-xs font-sans text-slate-600 mt-0.5">
                Tahun Ajaran {schoolSettings.academicYear} &bull; Semester {schoolSettings.semester}
              </p>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-5 pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Kelas / Rombel</span>
                  <span className="font-semibold text-slate-900">: {selectedClass.name}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-900">: {selectedClass.subject}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">
                    {mode === 'daily' ? 'Hari, Tanggal' : 'Bulan, Tahun'}
                  </span>
                  <span className="font-semibold text-slate-900">
                    : {mode === 'daily' ? formattedDate : `${monthName} ${selectedYear}`}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500 font-medium">Wali Kelas / Guru</span>
                  <span className="font-semibold text-slate-900">: {schoolSettings.teacherName}</span>
                </div>
              </div>
            </div>

            {/* CONTENT BASED ON MODE */}
            {mode === 'daily' ? (
              <div className="space-y-4">
                <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                      <th className="border border-slate-900 py-1.5 px-2 w-8 text-center">No</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-28 text-center">NISN</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-20 text-center">NIS</th>
                      <th className="border border-slate-900 py-1.5 px-3 text-left">Nama Siswa</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-10 text-center">L/P</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-20 text-center">Status</th>
                      <th className="border border-slate-900 py-1.5 px-3 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClass.students.map((student, idx) => {
                      const rec = records[student.id];
                      const status = rec?.status || 'H';
                      return (
                        <tr key={student.id} className="border-b border-slate-300">
                          <td className="border border-slate-900 py-1 px-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{student.nisn}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{student.nis}</td>
                          <td className="border border-slate-900 py-1 px-3 font-medium">{student.name}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center">{student.gender}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                            {status === 'H' ? 'Hadir' : status === 'S' ? 'Sakit' : status === 'I' ? 'Izin' : 'Alpa'}
                          </td>
                          <td className="border border-slate-900 py-1 px-3 text-slate-600">{rec?.note || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4 overflow-x-auto">
                <table className="w-full text-[10px] border-collapse border border-slate-900 font-sans">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
                      <th rowSpan={2} className="border border-slate-900 p-1 w-6">No</th>
                      <th rowSpan={2} className="border border-slate-900 p-1 text-left w-36">Nama Siswa</th>
                      <th rowSpan={2} className="border border-slate-900 p-1 w-6">L/P</th>
                      <th colSpan={daysInMonth} className="border border-slate-900 p-1">
                        Tanggal Presensi (1 - {daysInMonth})
                      </th>
                      <th colSpan={5} className="border border-slate-900 p-1">Rekap</th>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-b border-slate-900 text-center">
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                        <th key={d} className="border border-slate-900 p-0.5 min-w-[14px]">
                          {d}
                        </th>
                      ))}
                      <th className="border border-slate-900 p-1 w-6">H</th>
                      <th className="border border-slate-900 p-1 w-6">S</th>
                      <th className="border border-slate-900 p-1 w-6">I</th>
                      <th className="border border-slate-900 p-1 w-6">A</th>
                      <th className="border border-slate-900 p-1 w-8">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.map((stat, idx) => (
                      <tr key={stat.studentId} className="border-b border-slate-300">
                        <td className="border border-slate-900 p-1 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-1 font-medium whitespace-nowrap">{stat.studentName}</td>
                        <td className="border border-slate-900 p-1 text-center">{stat.gender}</td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                          const isWk = isWeekend(selectedYear, selectedMonth, d);
                          return (
                            <td
                              key={d}
                              className={`border border-slate-900 p-0.5 text-center font-bold text-[9px] ${
                                isWk ? 'bg-slate-200 text-slate-400' : ''
                              }`}
                            >
                              {isWk ? '-' : stat.dailyStatus[d] || '-'}
                            </td>
                          );
                        })}
                        <td className="border border-slate-900 p-1 text-center font-bold text-emerald-800">{stat.hadir}</td>
                        <td className="border border-slate-900 p-1 text-center text-blue-800">{stat.sakit}</td>
                        <td className="border border-slate-900 p-1 text-center text-amber-800">{stat.izin}</td>
                        <td className="border border-slate-900 p-1 text-center text-rose-800">{stat.alpa}</td>
                        <td className="border border-slate-900 p-1 text-center font-bold">
                          {stat.attendancePercentage.toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TANDA TANGAN RESMI */}
            <div className="grid grid-cols-2 gap-8 text-center mt-12 pt-4 font-sans text-xs break-inside-avoid">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala {schoolSettings.schoolName}</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">{schoolSettings.headmasterName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolSettings.headmasterNip}</p>
              </div>

              <div>
                <p>
                  {schoolSettings.city}, {mode === 'daily' ? formattedDate.split(', ')[1] || selectedDate : `${daysInMonth} ${monthName} ${selectedYear}`}
                </p>
                <p>{schoolSettings.teacherRole || 'Wali Kelas / Guru Pengampu'}</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">{schoolSettings.teacherName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolSettings.teacherNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

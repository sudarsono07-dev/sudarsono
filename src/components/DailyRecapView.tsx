import React, { useMemo } from 'react';
import { ClassRoom, DailyAttendance, SchoolSettings } from '../types/attendance';
import { formatIndonesianDate } from '../utils/dateUtils';
import { exportDailyAttendanceToExcel } from '../utils/exportExcel';
import { exportDailyAttendanceToWord } from '../utils/exportWord';
import { exportDailyAttendanceToPdf } from '../utils/exportPdf';
import {
  FileText,
  FileSpreadsheet,
  FileCode2,
  Printer,
  Calendar,
  UserCheck,
  UserX,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

interface DailyRecapViewProps {
  selectedClass: ClassRoom;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dailyAttendance: DailyAttendance | undefined;
  schoolSettings: SchoolSettings;
  onOpenPrintModal: (mode: 'daily' | 'monthly') => void;
}

export const DailyRecapView: React.FC<DailyRecapViewProps> = ({
  selectedClass,
  selectedDate,
  setSelectedDate,
  dailyAttendance,
  schoolSettings,
  onOpenPrintModal,
}) => {
  const records = dailyAttendance?.records || {};
  const formattedDate = formatIndonesianDate(selectedDate);

  const stats = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    const absentDetails: { studentName: string; gender: string; status: string; note: string }[] = [];

    selectedClass.students.forEach((s) => {
      const rec = records[s.id];
      const st = rec?.status || 'H';
      if (st === 'H') {
        hadir++;
      } else {
        if (st === 'S') sakit++;
        else if (st === 'I') izin++;
        else if (st === 'A') alpa++;

        absentDetails.push({
          studentName: s.name,
          gender: s.gender,
          status: st === 'S' ? 'Sakit' : st === 'I' ? 'Izin' : 'Alpa',
          note: rec?.note || 'Tidak ada keterangan',
        });
      }
    });

    const total = selectedClass.students.length;
    const percentage = total > 0 ? (hadir / total) * 100 : 0;

    return { total, hadir, sakit, izin, alpa, percentage, absentDetails };
  }, [selectedClass.students, records]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Date & Downloads */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Rekapitulasi Harian Otomatis</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Presensi {selectedClass.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {formattedDate} &bull; Semester {schoolSettings.semester} &bull; TA {schoolSettings.academicYear}
            </p>
          </div>

          {/* Download Buttons Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Word Download */}
            <button
              onClick={() => exportDailyAttendanceToWord(selectedClass, selectedDate, dailyAttendance, schoolSettings)}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh laporan dalam format Microsoft Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Word (.doc)</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={() => exportDailyAttendanceToExcel(selectedClass, selectedDate, dailyAttendance, schoolSettings)}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh laporan dalam format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </button>

            {/* PDF Download */}
            <button
              onClick={() => exportDailyAttendanceToPdf(selectedClass, selectedDate, dailyAttendance, schoolSettings)}
              className="px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh laporan dalam format Dokumen PDF (.pdf)"
            >
              <FileCode2 className="w-4 h-4 text-rose-600" />
              <span>PDF (.pdf)</span>
            </button>

            {/* Print / Preview */}
            <button
              onClick={() => onOpenPrintModal('daily')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Cetak langsung atau pratinjau format cetak kertas resmi"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau Cetak</span>
            </button>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600">Pilih Tanggal Rekap:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
          />
        </div>
      </div>

      {/* Recapitulation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>Rangkuman Angka</span>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {stats.percentage.toFixed(1)}% Hadir
            </span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Total Siswa Terdaftar:</span>
              <span className="font-bold text-slate-800 font-mono tabular-nums">{stats.total} Orang</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-emerald-700 font-medium">
              <span>Hadir (H):</span>
              <span className="font-bold font-mono tabular-nums">{stats.hadir} Siswa</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-blue-700 font-medium">
              <span>Sakit (S):</span>
              <span className="font-bold font-mono tabular-nums">{stats.sakit} Siswa</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-amber-700 font-medium">
              <span>Izin (I):</span>
              <span className="font-bold font-mono tabular-nums">{stats.izin} Siswa</span>
            </div>
            <div className="flex items-center justify-between py-1 text-rose-700 font-medium">
              <span>Alpa / Tanpa Keterangan (A):</span>
              <span className="font-bold font-mono tabular-nums">{stats.alpa} Siswa</span>
            </div>
          </div>
        </div>

        {/* Visual Ratio Progress Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Visualisasi Distribusi Kehadiran
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Komposisi kehadiran harian seluruh rombel kelas.
            </p>

            {/* Stacked Bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {stats.total > 0 && (
                <>
                  <div
                    style={{ width: `${(stats.hadir / stats.total) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Hadir: ${stats.hadir}`}
                  />
                  <div
                    style={{ width: `${(stats.sakit / stats.total) * 100}%` }}
                    className="bg-blue-500 h-full transition-all"
                    title={`Sakit: ${stats.sakit}`}
                  />
                  <div
                    style={{ width: `${(stats.izin / stats.total) * 100}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title={`Izin: ${stats.izin}`}
                  />
                  <div
                    style={{ width: `${(stats.alpa / stats.total) * 100}%` }}
                    className="bg-rose-500 h-full transition-all"
                    title={`Alpa: ${stats.alpa}`}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Hadir ({((stats.hadir / (stats.total || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Sakit ({((stats.sakit / (stats.total || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Izin ({((stats.izin / (stats.total || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Alpa ({((stats.alpa / (stats.total || 1)) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Target kehadiran minimal sekolah: 90%</span>
          </div>
        </div>

        {/* Note on Absentees */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Catatan Siswa Tidak Hadir
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Perlu tindak lanjut / komunikasi dengan orang tua:
            </p>

            {stats.absentDetails.length === 0 ? (
              <div className="py-6 text-center text-emerald-600 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <p className="text-xs font-semibold">Semua siswa hadir hari ini!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Tidak ada siswa yang sakit, izin, atau alpa.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stats.absentDetails.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-800">{item.studentName}</span>
                      <span
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                          item.status === 'Sakit'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Izin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Table of Daily Attendance */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Daftar Lengkap Presensi Siswa ({selectedClass.students.length} Siswa)
          </h3>
          <span className="text-xs text-slate-500">
            Tanggal: {formattedDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">NISN</th>
                <th className="py-3 px-4 w-28">NIS</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 w-16 text-center">L/P</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedClass.students.map((student, idx) => {
                const rec = records[student.id];
                const status = rec?.status || 'H';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center font-mono tabular-nums text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                      {student.nisn}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                      {student.nis}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {student.name}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {student.gender}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                          status === 'H'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'S'
                            ? 'bg-blue-100 text-blue-800'
                            : status === 'I'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {status === 'H'
                          ? 'Hadir'
                          : status === 'S'
                          ? 'Sakit'
                          : status === 'I'
                          ? 'Izin'
                          : 'Alpa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {rec?.note || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

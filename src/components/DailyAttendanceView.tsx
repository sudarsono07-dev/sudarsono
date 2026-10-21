import React, { useState, useMemo } from 'react';
import { ClassRoom, DailyAttendance, AttendanceStatus, SchoolSettings } from '../types/attendance';
import { formatIndonesianDate, getTodayDateString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCheck,
  RotateCcw,
  Search,
  Share2,
  FileDown,
  Check,
  AlertCircle,
  Copy,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface DailyAttendanceViewProps {
  selectedClass: ClassRoom;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dailyAttendance: DailyAttendance | undefined;
  onUpdateAttendance: (studentId: string, status: AttendanceStatus, note?: string) => void;
  onMarkAllHadir: () => void;
  onResetDay: () => void;
  schoolSettings: SchoolSettings;
  onNavigateToRecap: () => void;
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({
  selectedClass,
  selectedDate,
  setSelectedDate,
  dailyAttendance,
  onUpdateAttendance,
  onMarkAllHadir,
  onResetDay,
  schoolSettings,
  onNavigateToRecap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNoteStudentId, setEditingNoteStudentId] = useState<string | null>(null);
  const [copiedWA, setCopiedWA] = useState(false);

  const records = dailyAttendance?.records || {};

  // Compute stats
  const stats = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let unrecorded = 0;

    selectedClass.students.forEach((s) => {
      const rec = records[s.id];
      if (!rec) {
        unrecorded++;
      } else if (rec.status === 'H') {
        hadir++;
      } else if (rec.status === 'S') {
        sakit++;
      } else if (rec.status === 'I') {
        izin++;
      } else if (rec.status === 'A') {
        alpa++;
      }
    });

    const total = selectedClass.students.length;
    const percentage = total > 0 ? (hadir / total) * 100 : 0;

    return { total, hadir, sakit, izin, alpa, unrecorded, percentage };
  }, [selectedClass.students, records]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return selectedClass.students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nisn.includes(searchTerm) ||
        student.nis.includes(searchTerm);

      if (!matchSearch) return false;

      if (filterStatus === 'all') return true;
      const rec = records[student.id];
      if (filterStatus === 'unrecorded') return !rec;
      return rec?.status === filterStatus;
    });
  }, [selectedClass.students, searchTerm, filterStatus, records]);

  const handleMarkAllHadirWithCelebration = () => {
    onMarkAllHadir();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleCopyWhatsAppSummary = () => {
    const formattedDate = formatIndonesianDate(selectedDate);
    const absentList: string[] = [];

    selectedClass.students.forEach((s) => {
      const rec = records[s.id];
      if (rec && rec.status !== 'H') {
        const type = rec.status === 'S' ? 'Sakit' : rec.status === 'I' ? 'Izin' : 'Alpa';
        const noteStr = rec.note ? ` (${rec.note})` : '';
        absentList.push(`- ${s.name}: ${type}${noteStr}`);
      }
    });

    const text = `*LAPORAN PRESENSI SISWA*
Sekolah: ${schoolSettings.schoolName}
Kelas: ${selectedClass.name}
Tanggal: ${formattedDate}
Guru: ${schoolSettings.teacherName}

*Ringkasan:*
- Total Siswa: ${stats.total}
- Hadir (H): ${stats.hadir}
- Sakit (S): ${stats.sakit}
- Izin (I): ${stats.izin}
- Alpa (A): ${stats.alpa}
- Tingkat Kehadiran: ${stats.percentage.toFixed(1)}%

${absentList.length > 0 ? `*Daftar Siswa Tidak Hadir:*\n${absentList.join('\n')}` : '*Alhamdulillah, semua siswa hadir lengkap (100%)!*'}

_Dibuat otomatis via Sistem Presensi Digital Guru_`;

    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const changeDateByDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() + delta);
    const ny = cur.getFullYear();
    const nm = String(cur.getMonth() + 1).padStart(2, '0');
    const nd = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${ny}-${nm}-${nd}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Date and Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Date selector & Navigation */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="text-sm">Tanggal:</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => changeDateByDays(-1)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Hari Sebelumnya"
              >
                &larr;
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
              />
              <button
                onClick={() => changeDateByDays(1)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Hari Berikutnya"
              >
                &rarr;
              </button>
              <button
                onClick={() => setSelectedDate(getTodayDateString())}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors ml-1"
              >
                Hari Ini
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium pl-2 hidden sm:block">
              {formatIndonesianDate(selectedDate)}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleMarkAllHadirWithCelebration}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Semua Hadir (H)</span>
            </button>

            <button
              onClick={handleCopyWhatsAppSummary}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border ${
                copiedWA
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Salin ringkasan teks untuk grup WhatsApp Orang Tua / Wali Siswa"
            >
              {copiedWA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedWA ? 'Tersalin ke Clipboard!' : 'Salin ke WA'}</span>
            </button>

            <button
              onClick={onResetDay}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
              title="Reset catatan absensi tanggal ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onNavigateToRecap}
              className="px-3.5 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh Laporan</span>
            </button>
          </div>
        </div>

        {/* Real-time Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/70">
            <span className="text-xs text-slate-500 font-medium block">Total Siswa</span>
            <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums mt-0.5">
              {stats.total}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Siswa terdaftar</span>
          </div>

          <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-medium">Hadir (H)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {stats.hadir}
            </div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">
              {stats.total > 0 ? ((stats.hadir / stats.total) * 100).toFixed(0) : 0}% hadir
            </span>
          </div>

          <div className="bg-blue-50/70 rounded-lg p-3 border border-blue-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-800 font-medium">Sakit (S)</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-0.5">
              {stats.sakit}
            </div>
            <span className="text-[11px] text-blue-600 block mt-0.5">Surat keterangan</span>
          </div>

          <div className="bg-amber-50/70 rounded-lg p-3 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-800 font-medium">Izin (I)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
              {stats.izin}
            </div>
            <span className="text-[11px] text-amber-600 block mt-0.5">Pemberitahuan</span>
          </div>

          <div className="bg-rose-50/70 rounded-lg p-3 border border-rose-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-800 font-medium">Alpa (A)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums mt-0.5">
              {stats.alpa}
            </div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Tanpa keterangan</span>
          </div>

          <div className="bg-indigo-50/70 rounded-lg p-3 border border-indigo-200/80">
            <span className="text-xs text-indigo-800 font-medium block">Tingkat Hadir</span>
            <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-0.5">
              {stats.percentage.toFixed(1)}%
            </div>
            <div className="w-full bg-indigo-200/60 rounded-full h-1.5 mt-2">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, stats.percentage)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Interactive Segmented Filter Control */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({selectedClass.students.length})
          </button>
          <button
            onClick={() => setFilterStatus('H')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'H' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Hadir ({stats.hadir})
          </button>
          <button
            onClick={() => setFilterStatus('S')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'S' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            Sakit ({stats.sakit})
          </button>
          <button
            onClick={() => setFilterStatus('I')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'I' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Izin ({stats.izin})
          </button>
          <button
            onClick={() => setFilterStatus('A')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'A' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Alpa ({stats.alpa})
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">NISN / NIS</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 w-16 text-center">L/P</th>
                <th className="py-3 px-4 w-72 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada siswa yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const rec = records[student.id];
                  const currentStatus = rec?.status || 'H';
                  const note = rec?.note || '';
                  const isEditingNote = editingNoteStudentId === student.id;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-slate-500 font-mono tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        <div>{student.nisn}</div>
                        <div className="text-[11px] text-slate-400">{student.nis}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-500 font-medium">
                          {student.gender}
                        </span>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5 bg-slate-100/80 p-1 rounded-lg">
                          {/* Hadir Button */}
                          <button
                            type="button"
                            onClick={() => onUpdateAttendance(student.id, 'H', note)}
                            className={`flex-1 py-1 px-2.5 rounded font-bold text-xs transition-all ${
                              currentStatus === 'H'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-emerald-700 hover:bg-emerald-100/70'
                            }`}
                            title="Hadir"
                          >
                            H
                          </button>

                          {/* Sakit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const newNote = note || 'Sakit';
                              onUpdateAttendance(student.id, 'S', newNote);
                            }}
                            className={`flex-1 py-1 px-2.5 rounded font-bold text-xs transition-all ${
                              currentStatus === 'S'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-blue-700 hover:bg-blue-100/70'
                            }`}
                            title="Sakit (Surat Dokter / Keterangan)"
                          >
                            S
                          </button>

                          {/* Izin Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const newNote = note || 'Izin acara keluarga';
                              onUpdateAttendance(student.id, 'I', newNote);
                            }}
                            className={`flex-1 py-1 px-2.5 rounded font-bold text-xs transition-all ${
                              currentStatus === 'I'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-amber-700 hover:bg-amber-100/70'
                            }`}
                            title="Izin"
                          >
                            I
                          </button>

                          {/* Alpa Button */}
                          <button
                            type="button"
                            onClick={() => onUpdateAttendance(student.id, 'A', note)}
                            className={`flex-1 py-1 px-2.5 rounded font-bold text-xs transition-all ${
                              currentStatus === 'A'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-rose-700 hover:bg-rose-100/70'
                            }`}
                            title="Alpa / Tanpa Keterangan"
                          >
                            A
                          </button>
                        </div>
                      </td>

                      {/* Note / Keterangan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={currentStatus === 'H' ? 'Keterangan opsional...' : 'Alasan / surat...'}
                            defaultValue={note}
                            onBlur={(e) => {
                              onUpdateAttendance(student.id, currentStatus, e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onUpdateAttendance(student.id, currentStatus, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-full text-xs py-1 px-2.5 border border-slate-200 rounded bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Help Guide Footer */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Tips Guru:</strong> Gunakan tombol <strong>"Semua Hadir (H)"</strong> untuk mempercepat input, lalu klik siswa yang Sakit (S), Izin (I), atau Alpa (A). Semua perubahan tersimpan otomatis.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 shrink-0">
          <span>H = Hadir</span>
          <span aria-hidden="true">&bull;</span>
          <span>S = Sakit</span>
          <span aria-hidden="true">&bull;</span>
          <span>I = Izin</span>
          <span aria-hidden="true">&bull;</span>
          <span>A = Alpa</span>
        </div>
      </div>
    </div>
  );
};

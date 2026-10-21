import React from 'react';
import { SchoolSettings, ClassRoom } from '../types/attendance';
import { BookOpen, Calendar, Settings, Users, FileSpreadsheet, CheckCircle2, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  currentTab: 'presensi' | 'rekap-harian' | 'rekap-bulanan' | 'kelola-siswa';
  setCurrentTab: (tab: 'presensi' | 'rekap-harian' | 'rekap-bulanan' | 'kelola-siswa') => void;
  selectedClass: ClassRoom;
  classes: ClassRoom[];
  onSelectClass: (cls: ClassRoom) => void;
  schoolSettings: SchoolSettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedClass,
  classes,
  onSelectClass,
  schoolSettings,
  onOpenSettings,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Zone 1, 2, 3 Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand title, single line */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              AbsensiSiswa
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap block">
              {schoolSettings.schoolName}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentTab('presensi')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'presensi'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Presensi Harian</span>
          </button>

          <button
            onClick={() => setCurrentTab('rekap-harian')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'rekap-harian'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Rekap Harian</span>
          </button>

          <button
            onClick={() => setCurrentTab('rekap-bulanan')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'rekap-bulanan'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap Bulanan</span>
          </button>

          <button
            onClick={() => setCurrentTab('kelola-siswa')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'kelola-siswa'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Siswa</span>
          </button>
        </nav>

        {/* Zone 3: Primary action & Class selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Class Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <span className="text-xs text-slate-500 pl-2 pr-1 font-medium hidden sm:inline">Kelas:</span>
            <select
              value={selectedClass.id}
              onChange={(e) => {
                const found = classes.find((c) => c.id === e.target.value);
                if (found) onSelectClass(found);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 py-1 px-2 focus:outline-none cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.students.length} siswa)
                </option>
              ))}
            </select>
          </div>

          {/* School Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan Sekolah & Guru"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-medium">Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-200 px-2 py-1.5 gap-1 bg-slate-50 text-xs">
        <button
          onClick={() => setCurrentTab('presensi')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
            currentTab === 'presensi' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Presensi Harian
        </button>
        <button
          onClick={() => setCurrentTab('rekap-harian')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
            currentTab === 'rekap-harian' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Rekap Harian
        </button>
        <button
          onClick={() => setCurrentTab('rekap-bulanan')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
            currentTab === 'rekap-bulanan' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Rekap Bulanan
        </button>
        <button
          onClick={() => setCurrentTab('kelola-siswa')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
            currentTab === 'kelola-siswa' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          Data Siswa
        </button>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  loadClasses,
  saveClasses,
  loadSchoolSettings,
  saveSchoolSettings,
  loadAttendanceRecords,
  saveAttendanceRecords,
  loadSelectedClassId,
  saveSelectedClassId,
  resetAllDataToDefault,
} from './utils/storage';
import { getTodayDateString, getDaysInMonth, isWeekend } from './utils/dateUtils';
import { ClassRoom, AttendanceStatus, DailyAttendance, SchoolSettings, MonthlyStats } from './types/attendance';

import { Header } from './components/Header';
import { DailyAttendanceView } from './components/DailyAttendanceView';
import { DailyRecapView } from './components/DailyRecapView';
import { MonthlyRecapView } from './components/MonthlyRecapView';
import { StudentManagementModal } from './components/StudentManagementModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { PrintReportModal } from './components/PrintReportModal';

export default function App() {
  const [classes, setClasses] = useState<ClassRoom[]>(() => loadClasses());
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => loadSchoolSettings());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, DailyAttendance>>(() =>
    loadAttendanceRecords()
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(() => loadSelectedClassId(classes));
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [currentTab, setCurrentTab] = useState<'presensi' | 'rekap-harian' | 'rekap-bulanan' | 'kelola-siswa'>(
    'presensi'
  );

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [printModal, setPrintModal] = useState<{ isOpen: boolean; mode: 'daily' | 'monthly' }>({
    isOpen: false,
    mode: 'daily',
  });

  // Current active class object
  const selectedClass = useMemo(() => {
    const found = classes.find((c) => c.id === selectedClassId);
    return found || classes[0] || { id: 'default', name: 'Kelas 7A', grade: '7', section: 'A', academicYear: '2025/2026', semester: 'Genap', subject: 'Matematika', students: [] };
  }, [classes, selectedClassId]);

  // Current daily attendance record
  const currentDailyKey = `${selectedClass.id}_${selectedDate}`;
  const currentDailyRecord = attendanceRecords[currentDailyKey];

  // Auto-persist changes
  const handleUpdateAttendance = (studentId: string, status: AttendanceStatus, note?: string) => {
    const existingDaily = attendanceRecords[currentDailyKey] || {
      date: selectedDate,
      classId: selectedClass.id,
      records: {},
    };

    const updatedDaily: DailyAttendance = {
      ...existingDaily,
      records: {
        ...existingDaily.records,
        [studentId]: {
          studentId,
          status,
          note: note !== undefined ? note : existingDaily.records[studentId]?.note,
          timeRecorded: new Date().toISOString(),
        },
      },
    };

    const newRecords = {
      ...attendanceRecords,
      [currentDailyKey]: updatedDaily,
    };

    setAttendanceRecords(newRecords);
    saveAttendanceRecords(newRecords);
  };

  const handleMarkAllHadir = () => {
    const newStudentRecords: Record<string, { studentId: string; status: AttendanceStatus; note?: string; timeRecorded?: string }> = {};

    selectedClass.students.forEach((student) => {
      const existing = currentDailyRecord?.records[student.id];
      newStudentRecords[student.id] = {
        studentId: student.id,
        status: 'H',
        note: existing?.note || '',
        timeRecorded: new Date().toISOString(),
      };
    });

    const updatedDaily: DailyAttendance = {
      date: selectedDate,
      classId: selectedClass.id,
      records: newStudentRecords,
      submittedAt: new Date().toISOString(),
    };

    const newRecords = {
      ...attendanceRecords,
      [currentDailyKey]: updatedDaily,
    };

    setAttendanceRecords(newRecords);
    saveAttendanceRecords(newRecords);
  };

  const handleResetDay = () => {
    if (confirm(`Reset semua catatan absensi untuk tanggal ${selectedDate}?`)) {
      const newRecords = { ...attendanceRecords };
      delete newRecords[currentDailyKey];
      setAttendanceRecords(newRecords);
      saveAttendanceRecords(newRecords);
    }
  };

  const handleSelectClass = (cls: ClassRoom) => {
    setSelectedClassId(cls.id);
    saveSelectedClassId(cls.id);
  };

  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    saveSchoolSettings(newSettings);
  };

  const handleUpdateClasses = (newClasses: ClassRoom[]) => {
    setClasses(newClasses);
    saveClasses(newClasses);
  };

  const handleResetAllData = () => {
    const res = resetAllDataToDefault();
    setClasses(res.classes);
    setSchoolSettings(res.settings);
    setAttendanceRecords(res.records);
    setSelectedClassId(res.classes[0]?.id || 'cls-7a');
  };

  // Compute monthly stats for print preview
  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonthIdx);

  const currentMonthlyStats: MonthlyStats[] = useMemo(() => {
    return selectedClass.students.map((student) => {
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      const dailyStatus: Record<number, AttendanceStatus | null> = {};

      for (let day = 1; day <= daysInCurrentMonth; day++) {
        if (isWeekend(currentYear, currentMonthIdx, day)) {
          dailyStatus[day] = null;
          continue;
        }

        const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const key = `${selectedClass.id}_${dateStr}`;
        const dailyRecord = attendanceRecords[key];

        if (dailyRecord) {
          const rec = dailyRecord.records[student.id];
          const st = rec ? rec.status : 'H';
          dailyStatus[day] = st;

          if (st === 'H') hadir++;
          else if (st === 'S') sakit++;
          else if (st === 'I') izin++;
          else if (st === 'A') alpa++;
        } else {
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
  }, [selectedClass, attendanceRecords, currentYear, currentMonthIdx, daysInCurrentMonth]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'kelola-siswa') {
            setIsStudentModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        selectedClass={selectedClass}
        classes={classes}
        onSelectClass={handleSelectClass}
        schoolSettings={schoolSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'presensi' && (
          <DailyAttendanceView
            selectedClass={selectedClass}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dailyAttendance={currentDailyRecord}
            onUpdateAttendance={handleUpdateAttendance}
            onMarkAllHadir={handleMarkAllHadir}
            onResetDay={handleResetDay}
            schoolSettings={schoolSettings}
            onNavigateToRecap={() => setCurrentTab('rekap-harian')}
          />
        )}

        {currentTab === 'rekap-harian' && (
          <DailyRecapView
            selectedClass={selectedClass}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dailyAttendance={currentDailyRecord}
            schoolSettings={schoolSettings}
            onOpenPrintModal={(mode) => setPrintModal({ isOpen: true, mode })}
          />
        )}

        {currentTab === 'rekap-bulanan' && (
          <MonthlyRecapView
            selectedClass={selectedClass}
            attendanceRecords={attendanceRecords}
            schoolSettings={schoolSettings}
            onOpenPrintModal={(mode) => setPrintModal({ isOpen: true, mode })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{schoolSettings.schoolName}</span>
            <span aria-hidden="true">&bull;</span>
            <span>Wali Kelas: {schoolSettings.teacherName}</span>
            <span aria-hidden="true">&bull;</span>
            <span>Semester {schoolSettings.semester} {schoolSettings.academicYear}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Ekspor: Word (.doc), Excel (.xlsx), PDF (.pdf)</span>
            <span aria-hidden="true">&bull;</span>
            <span>Data tersimpan di peramban</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentManagementModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classes={classes}
        selectedClass={selectedClass}
        onUpdateClasses={handleUpdateClasses}
        onSelectClass={handleSelectClass}
      />

      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={schoolSettings}
        onSaveSettings={handleSaveSettings}
        onResetAllData={handleResetAllData}
      />

      <PrintReportModal
        isOpen={printModal.isOpen}
        onClose={() => setPrintModal({ isOpen: false, mode: 'daily' })}
        mode={printModal.mode}
        selectedClass={selectedClass}
        selectedDate={selectedDate}
        dailyAttendance={currentDailyRecord}
        monthlyStats={currentMonthlyStats}
        selectedMonth={currentMonthIdx}
        selectedYear={currentYear}
        schoolSettings={schoolSettings}
      />
    </div>
  );
}

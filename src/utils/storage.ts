import { ClassRoom, SchoolSettings, DailyAttendance } from '../types/attendance';
import { DEFAULT_SCHOOL_SETTINGS, INITIAL_CLASSES, generateInitialAttendanceHistory } from '../data/defaultData';

const STORAGE_KEYS = {
  CLASSES: 'guru_absen_classes',
  SETTINGS: 'guru_absen_settings',
  ATTENDANCE: 'guru_absen_attendance_records',
  SELECTED_CLASS: 'guru_absen_selected_class_id',
};

export function loadSchoolSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load school settings', e);
  }
  return DEFAULT_SCHOOL_SETTINGS;
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save school settings', e);
  }
}

export function loadClasses(): ClassRoom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load classes', e);
  }
  return INITIAL_CLASSES;
}

export function saveClasses(classes: ClassRoom[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.error('Failed to save classes', e);
  }
}

export function loadAttendanceRecords(): Record<string, DailyAttendance> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load attendance records', e);
  }
  // If empty, generate starter records for sample classes
  const initialRecords = {
    ...generateInitialAttendanceHistory('cls-7a', INITIAL_CLASSES[0].students),
    ...generateInitialAttendanceHistory('cls-7b', INITIAL_CLASSES[1].students),
  };
  saveAttendanceRecords(initialRecords);
  return initialRecords;
}

export function saveAttendanceRecords(records: Record<string, DailyAttendance>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendance records', e);
  }
}

export function loadSelectedClassId(classes: ClassRoom[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_CLASS);
    if (saved && classes.some((c) => c.id === saved)) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to load selected class id', e);
  }
  return classes[0]?.id || 'cls-7a';
}

export function saveSelectedClassId(classId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CLASS, classId);
  } catch (e) {
    console.error('Failed to save selected class id', e);
  }
}

export function resetAllDataToDefault(): {
  settings: SchoolSettings;
  classes: ClassRoom[];
  records: Record<string, DailyAttendance>;
} {
  const records = {
    ...generateInitialAttendanceHistory('cls-7a', INITIAL_CLASSES[0].students),
    ...generateInitialAttendanceHistory('cls-7b', INITIAL_CLASSES[1].students),
  };
  saveSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
  saveClasses(INITIAL_CLASSES);
  saveAttendanceRecords(records);
  saveSelectedClassId('cls-7a');
  return {
    settings: DEFAULT_SCHOOL_SETTINGS,
    classes: INITIAL_CLASSES,
    records,
  };
}

import React, { useState } from 'react';
import { ClassRoom, Student } from '../types/attendance';
import { Users, UserPlus, Trash2, Edit2, Plus, X, UploadCloud, Check } from 'lucide-react';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  selectedClass: ClassRoom;
  onUpdateClasses: (updatedClasses: ClassRoom[]) => void;
  onSelectClass: (cls: ClassRoom) => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClass,
  onUpdateClasses,
  onSelectClass,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'bulk' | 'new-class'>('students');

  // Single student form
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    nisn: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    parentPhone: string;
  }>({
    nisn: '',
    nis: '',
    name: '',
    gender: 'L',
    parentPhone: '',
  });

  // Bulk input text
  const [bulkText, setBulkText] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  // New Class Form
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('Matematika');

  if (!isOpen) return null;

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const currentStudents = [...selectedClass.students];

    if (editingStudentId) {
      // Update
      const index = currentStudents.findIndex((s) => s.id === editingStudentId);
      if (index !== -1) {
        currentStudents[index] = {
          ...currentStudents[index],
          ...formData,
        };
      }
    } else {
      // Add new
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nisn: formData.nisn || `009${Math.floor(1000000 + Math.random() * 9000000)}`,
        nis: formData.nis || `2526${String(currentStudents.length + 1).padStart(4, '0')}`,
        name: formData.name.trim(),
        gender: formData.gender,
        parentPhone: formData.parentPhone,
      };
      currentStudents.push(newStudent);
    }

    const updatedClasses = classes.map((c) =>
      c.id === selectedClass.id ? { ...c, students: currentStudents } : c
    );

    onUpdateClasses(updatedClasses);
    setIsAddingStudent(false);
    setEditingStudentId(null);
    setFormData({ nisn: '', nis: '', name: '', gender: 'L', parentPhone: '' });
  };

  const handleEditClick = (student: Student) => {
    setFormData({
      nisn: student.nisn,
      nis: student.nis,
      name: student.name,
      gender: student.gender,
      parentPhone: student.parentPhone || '',
    });
    setEditingStudentId(student.id);
    setIsAddingStudent(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini dari daftar kelas?')) {
      const currentStudents = selectedClass.students.filter((s) => s.id !== id);
      const updatedClasses = classes.map((c) =>
        c.id === selectedClass.id ? { ...c, students: currentStudents } : c
      );
      onUpdateClasses(updatedClasses);
    }
  };

  const handleBulkAdd = () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newStudents: Student[] = lines.map((line, idx) => {
      // Detect CSV/tab or plain name
      const parts = line.split(/[,\t]/);
      const name = parts[0]?.trim() || line;
      const gender = (parts[1]?.trim().toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P';
      const nisn = parts[2]?.trim() || `009${Math.floor(1000000 + Math.random() * 9000000)}`;
      const nis = parts[3]?.trim() || `2526${String(selectedClass.students.length + idx + 1).padStart(4, '0')}`;

      return {
        id: `std-bulk-${Date.now()}-${idx}`,
        nisn,
        nis,
        name,
        gender,
      };
    });

    const updatedStudents = [...selectedClass.students, ...newStudents];
    const updatedClasses = classes.map((c) =>
      c.id === selectedClass.id ? { ...c, students: updatedStudents } : c
    );

    onUpdateClasses(updatedClasses);
    setBulkText('');
    setBulkFeedback(`Berhasil menambahkan ${newStudents.length} siswa baru!`);
    setTimeout(() => {
      setBulkFeedback(null);
      setActiveTab('students');
    }, 1800);
  };

  const handleCreateNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: ClassRoom = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      grade: '7',
      section: 'A',
      academicYear: selectedClass.academicYear,
      semester: selectedClass.semester,
      subject: newClassSubject.trim() || 'Matematika',
      students: [],
    };

    const updated = [...classes, newClass];
    onUpdateClasses(updated);
    onSelectClass(newClass);
    setNewClassName('');
    setActiveTab('students');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Kelola Data Siswa & Rombel
              </h3>
              <p className="text-xs text-slate-500">
                Kelas aktif: <span className="font-semibold text-slate-700">{selectedClass.name}</span> ({selectedClass.students.length} siswa)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-5 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Siswa ({selectedClass.students.length})
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tambah Cepat / Sekaligus
          </button>
          <button
            onClick={() => setActiveTab('new-class')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'new-class'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tambah Kelas Baru
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Form Add / Edit */}
              {isAddingStudent ? (
                <form onSubmit={handleSaveStudent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {editingStudentId ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingStudent(false);
                        setEditingStudentId(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Muhammad Rizky"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Jenis Kelamin</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white cursor-pointer"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">NISN (10 Digit)</label>
                      <input
                        type="text"
                        value={formData.nisn}
                        onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                        placeholder="0098234101"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">No. Induk Siswa (NIS)</label>
                      <input
                        type="text"
                        value={formData.nis}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        placeholder="25260701"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingStudent(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Simpan Data Siswa
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    Total {selectedClass.students.length} siswa dalam kelas ini
                  </span>
                  <button
                    onClick={() => {
                      setFormData({ nisn: '', nis: '', name: '', gender: 'L', parentPhone: '' });
                      setEditingStudentId(null);
                      setIsAddingStudent(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tambah Siswa</span>
                  </button>
                </div>
              )}

              {/* Student List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3 w-12 text-center">L/P</th>
                      <th className="py-2.5 px-3 w-28">NISN</th>
                      <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedClass.students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {student.name}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-medium">
                          {student.gender}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono">
                          {student.nisn}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(student)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Edit Siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                <p className="font-semibold mb-1">Tempel (Paste) Nama Siswa Sekaligus:</p>
                <p className="text-slate-500">
                  Tulis atau tempel 1 nama siswa per baris. Anda juga bisa menempel langsung dari Microsoft Excel dengan format: <code>Nama Siswa [tab] L/P [tab] NISN</code>.
                </p>
              </div>

              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Ahmad Fauzan Pratama&#10;Bella Rahmawati&#10;Chandra Setiawan&#10;Dinda Safitri"
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {bulkFeedback && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{bulkFeedback}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleBulkAdd}
                  disabled={!bulkText.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 disabled:opacity-50 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Tambahkan Semua ke {selectedClass.name}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'new-class' && (
            <form onSubmit={handleCreateNewClass} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800 text-sm mb-1">Buat Rombel / Kelas Baru</p>
                <p className="text-slate-500">
                  Tambahkan kelas lain yang Anda ajar (misal Kelas 7B, 8A, 9C) agar dapat mengelola beberapa rombel sekaligus dalam 1 aplikasi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Rombel / Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas VIII-B"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Matematika"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Buat Kelas Baru & Beralih
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

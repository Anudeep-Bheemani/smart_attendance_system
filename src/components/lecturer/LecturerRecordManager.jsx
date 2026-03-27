import React, { useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, X, Save, User, Mail, Phone, Layers, Calendar, Search, Users, GitBranch, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

const branchColors = {
  CSE: 'bg-blue-100 text-blue-700',
  ECE: 'bg-violet-100 text-violet-700',
  MECH: 'bg-orange-100 text-orange-700',
  CIVIL: 'bg-green-100 text-green-700',
  EEE: 'bg-yellow-100 text-yellow-700',
};
const getBranchColor = (b) => branchColors[b] || 'bg-slate-100 text-slate-600';

const getInitials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
const avatarBg = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
const getAvatarBg = (name) => avatarBg[(name?.charCodeAt(0) || 0) % avatarBg.length];

const InputField = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        className={`w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white`}
        {...props}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, children, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />}
      <select
        className={`w-full ${Icon ? 'pl-9' : 'px-3'} pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none`}
        {...props}
      >
        {children}
      </select>
    </div>
  </div>
);

const LecturerRecordManager = ({ user, students, branches, onAddStudent, onUpdateStudent, onDeleteStudent, onAddBranch, onDeleteBranch }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [currentStudent, setCurrentStudent] = useState({
    name: '', rollNo: '', email: '', phone: '',
    branch: user?.branch || 'CSE', year: 1,
    dob: '', guardianName: '', guardianPhone: ''
  });
  const [branchInput, setBranchInput] = useState('');
  const [filterBranch, setFilterBranch] = useState(user?.branch || 'all');
  const [filterYear, setFilterYear] = useState(user?.academicYear?.toString() || 'all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(s => {
    const branchMatch = filterBranch === 'all' || s.branch === filterBranch;
    const yearMatch = filterYear === 'all' || s.year === parseInt(filterYear);
    const statusMatch = filterStatus === 'all' || (filterStatus === 'verified' ? s.verified : !s.verified);
    const searchMatch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return branchMatch && yearMatch && statusMatch && searchMatch;
  });

  const verifiedCount = students.filter(s => s.verified).length;
  const pendingCount = students.length - verifiedCount;

  const handleAdd = () => {
    setEditMode(false);
    setCurrentStudent({ name: '', rollNo: '', email: '', phone: '', branch: branches[0] || 'CSE', year: 1, dob: '', guardianName: '', guardianPhone: '' });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setCurrentStudent({ ...student });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editMode) {
        await onUpdateStudent(currentStudent.id, currentStudent);
      } else {
        await onAddStudent(currentStudent);
        setFilterBranch('all'); setFilterYear('all'); setSearchQuery('');
      }
      setShowModal(false);
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await onDeleteStudent(id);
      setDeleteConfirmId(null);
    } catch (_) {}
  };

  const handleAddBranch = async () => {
    const val = branchInput.trim().toUpperCase();
    if (val && !branches.includes(val)) {
      try { await onAddBranch(val); setBranchInput(''); } catch (_) {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              Record Manager
            </h1>
            <p className="text-sm text-slate-500 pl-10">Manage students and branches</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users size={15} /> Students
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'branches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <GitBranch size={15} /> Branches
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {activeTab === 'students' ? (
          <>
            {/* ── Stats Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: students.length, icon: Users, color: 'blue' },
                { label: 'Verified', value: verifiedCount, icon: ShieldCheck, color: 'emerald' },
                { label: 'Pending', value: pendingCount, icon: Clock, color: 'amber' },
                { label: 'Showing', value: filteredStudents.length, icon: Search, color: 'violet' },
              ].map(({ label, value, icon: Icon, color }) => {
                const colorMap = {
                  blue:    'bg-blue-50 text-blue-600 border-blue-100',
                  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  amber:   'bg-amber-50 text-amber-600 border-amber-100',
                  violet:  'bg-violet-50 text-violet-600 border-violet-100',
                };
                return (
                  <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{value}</p>
                      <p className="text-xs text-slate-400 font-medium">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, roll no, email..."
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-56"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Branch filter */}
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Branches</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                {/* Year filter */}
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Years</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                </select>

                {/* Status filter */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                  {[['all','All'],['verified','Verified'],['pending','Pending']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilterStatus(val)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterStatus === val ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {(searchQuery || filterBranch !== 'all' || filterYear !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterBranch('all'); setFilterYear('all'); setFilterStatus('all'); }}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm flex-shrink-0"
              >
                <Plus size={16} /> Add Student
              </button>
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll No</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch / Year</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                          {/* Student */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${getAvatarBg(s.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                {getInitials(s.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">{s.name}</div>
                                <div className="text-xs text-slate-400">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          {/* Roll No */}
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {s.rollNo}
                            </span>
                          </td>
                          {/* Branch / Year */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getBranchColor(s.branch)}`}>{s.branch}</span>
                              <span className="text-xs text-slate-500">{YEAR_LABELS[s.year]}</span>
                            </div>
                          </td>
                          {/* Contact */}
                          <td className="px-5 py-3.5 text-xs text-slate-500">{s.phone || '—'}</td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {s.verified ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                                <CheckCircle size={11} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                                <AlertCircle size={11} /> Pending
                              </span>
                            )}
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(s)}
                                title="Edit"
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(s.id)}
                                title="Delete"
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={28} className="text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-500">No students found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or add a new student</p>
                  <button
                    onClick={() => { setSearchQuery(''); setFilterBranch('all'); setFilterYear('all'); setFilterStatus('all'); }}
                    className="mt-4 text-blue-600 hover:underline text-sm font-semibold"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Branches Tab ─────────────────────────────────────────────── */
          <div className="max-w-xl space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <GitBranch size={16} className="text-blue-600" /> Add New Branch
              </h3>
              <p className="text-sm text-slate-500 mb-4">Branch names are stored in uppercase (e.g. IT, AIDS)</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  placeholder="e.g. IT"
                  value={branchInput}
                  onChange={e => setBranchInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleAddBranch()}
                />
                <button
                  onClick={handleAddBranch}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700 text-sm">Existing Branches</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{branches.length} total</span>
              </div>
              <ul className="divide-y divide-slate-50">
                {branches.map((b) => (
                  <li key={b} className="flex justify-between items-center px-5 py-3.5 hover:bg-slate-50 group transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getBranchColor(b)}`}>{b}</span>
                      <span className="text-sm text-slate-500">
                        {students.filter(s => s.branch === b).length} students
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteBranch(b)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
                {branches.length === 0 && (
                  <li className="px-5 py-10 text-center text-slate-400 text-sm">No branches yet. Add one above.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${editMode ? 'bg-amber-100' : 'bg-blue-100'}`}>
                  {editMode ? <Edit3 size={16} className="text-amber-600" /> : <Plus size={16} className="text-blue-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{editMode ? 'Edit Student' : 'Add New Student'}</h3>
                  <p className="text-xs text-slate-400">{editMode ? 'Update student information' : 'Fill in the details below'}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Section: Basic Info */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Basic Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <InputField label="Full Name" icon={User} type="text" value={currentStudent.name} onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })} placeholder="John Doe" required />
                <InputField label="Roll Number" type="text" value={currentStudent.rollNo} onChange={(e) => setCurrentStudent({ ...currentStudent, rollNo: e.target.value })} placeholder="24CSE101" required />
                <InputField label="Email Address" icon={Mail} type="email" value={currentStudent.email || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })} placeholder="student@college.edu" required />
                <InputField label="Phone Number" icon={Phone} type="tel" value={currentStudent.phone || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, phone: e.target.value })} placeholder="9876543210" />
              </div>

              {/* Section: Academic */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Details</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <SelectField label="Branch" icon={Layers} value={currentStudent.branch} onChange={(e) => setCurrentStudent({ ...currentStudent, branch: e.target.value })}>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </SelectField>
                <SelectField label="Year" icon={Calendar} value={currentStudent.year} onChange={(e) => setCurrentStudent({ ...currentStudent, year: parseInt(e.target.value) })}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                </SelectField>
                <InputField label="Date of Birth" type="date" value={currentStudent.dob || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, dob: e.target.value })} />
              </div>

              {/* Section: Guardian */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guardian Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Guardian Name" icon={User} type="text" value={currentStudent.guardianName || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, guardianName: e.target.value })} placeholder="Parent / Guardian" />
                <InputField label="Guardian Phone" icon={Phone} type="tel" value={currentStudent.guardianPhone || ''} onChange={(e) => setCurrentStudent({ ...currentStudent, guardianPhone: e.target.value })} placeholder="9988776655" />
              </div>

              {!editMode && (
                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Mail size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">A verification email with a password setup link will be sent to the student's email address automatically.</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <Save size={15} />
                {saving ? 'Saving...' : editMode ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Student?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will permanently remove the student and all their attendance records. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LecturerRecordManager;

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Filter, User, Users, CheckCircle, Clock, X, Phone, Mail } from 'lucide-react';

const EMPTY_STAFF = { name: '', email: '', phone: '', branch: 'CSE', academicYear: '1st Year' };

const AdminStaffManager = ({ staffList, branches: branchesProp, onAddStaff, onUpdateStaff, onDeleteStaff }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(EMPTY_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const branches = branchesProp?.length ? branchesProp : ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];
  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const yearMap = { '1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4' };

  const getAssignedClass = (branch, year) => `${branch}-${yearMap[year] || year}`;

  const openAdd = () => {
    setIsEditing(false);
    setCurrentStaff(EMPTY_STAFF);
    setShowModal(true);
  };

  const openEdit = (staff) => {
    setIsEditing(true);
    // Normalize academicYear back to label if it's a number
    const yearLabel = Object.entries(yearMap).find(([, v]) => v === String(staff.academicYear))?.[0] || staff.academicYear || '1st Year';
    setCurrentStaff({ ...staff, phone: staff.phone || '', academicYear: yearLabel });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentStaff.name || !currentStaff.email) {
      alert('Name and email are required');
      return;
    }
    const numericYear = yearMap[currentStaff.academicYear] || currentStaff.academicYear;
    const assignedClass = `${currentStaff.branch}-${numericYear}`;

    const existingStaff = staffList.find(s => {
      const sYear = yearMap[s.academicYear] || s.academicYear;
      return `${s.branch}-${sYear}` === assignedClass && s.id !== currentStaff.id;
    });
    if (existingStaff && !window.confirm(`${existingStaff.name} is already assigned to ${assignedClass}. Override?`)) return;

    const staffData = { ...currentStaff, assignedClass, academicYear: numericYear };
    try {
      if (isEditing) {
        await onUpdateStaff(currentStaff.id, staffData);
      } else {
        await onAddStaff({ ...staffData, role: 'lecturer' });
      }
      setShowModal(false);
    } catch (err) { /* error alerted in App.jsx */ }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this staff member?')) {
      try { await onDeleteStaff(id); } catch (err) { /* */ }
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || staff.academicYear === yearFilter || yearMap[yearFilter] === String(staff.academicYear);
    const matchesBranch = branchFilter === 'all' || staff.branch === branchFilter;
    return matchesSearch && matchesYear && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage class in-charge assignments</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
        >
          <Plus size={18} /> Add New Staff
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="all">All Years</option>
            {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>
          <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-medium text-sm flex items-center gap-2">
            <Filter size={16} />{filteredStaff.length} Staff
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Staff Name</th>
              <th className="px-6 py-4">Email / Phone</th>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4">Assigned Class</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.map(staff => (
              <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {staff.name?.charAt(0) || 'S'}
                    </div>
                    <span className="font-medium text-slate-800">{staff.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 text-sm">{staff.email}</div>
                  {staff.phone && <div className="text-slate-400 text-xs mt-0.5">{staff.phone}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                    {staff.academicYear ? `Year ${staff.academicYear}` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {staff.assignedClass || getAssignedClass(staff.branch || 'CSE', staff.academicYear || '1')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {staff.verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(staff)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors" title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(staff.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No staff members found</p>
            <p className="text-sm">Try adjusting your filters or add a new staff member</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{isEditing ? 'Edit Staff Details' : 'Add New Staff Member'}</h3>
                  <p className="text-slate-300 text-xs">{isEditing ? 'Update staff information' : 'Staff will receive an email to set their password'}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Enter staff full name"
                      value={currentStaff.name}
                      onChange={e => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="staff@college.edu"
                      value={currentStaff.email}
                      onChange={e => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="e.g. 9876543210"
                      value={currentStaff.phone}
                      onChange={e => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={currentStaff.branch}
                    onChange={e => setCurrentStaff({ ...currentStaff, branch: e.target.value })}
                  >
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={currentStaff.academicYear}
                    onChange={e => setCurrentStaff({ ...currentStaff, academicYear: e.target.value })}
                  >
                    {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Assigned Class Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-blue-700">Assigned Class</span>
                <span className="font-bold text-blue-800">{getAssignedClass(currentStaff.branch, currentStaff.academicYear)}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm shadow"
              >
                {isEditing ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffManager;

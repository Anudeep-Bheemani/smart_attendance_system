import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Filter, User, Mail, Lock, GraduationCap, Users } from 'lucide-react';

const AdminStaffManager = ({ staffList, setStaffList, branches }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    branch: 'CSE',
    academicYear: '1st Year'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');


  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // Generate assigned class from branch + year
  const getAssignedClass = (branch, year) => {
    const yearMap = { '1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4' };
    return `${branch}-${yearMap[year]}`;
  };

  const handleSave = () => {
    if (!currentStaff.name || !currentStaff.email || !currentStaff.password) {
      alert('Please fill all required fields');
      return;
    }

    const assignedClass = getAssignedClass(currentStaff.branch, currentStaff.academicYear);

    // Check if class already assigned (unless editing same staff)
    const existingStaff = staffList.find(s => {
      const existingClass = getAssignedClass(s.branch || 'CSE', s.academicYear || '1st Year');
      return existingClass === assignedClass && s.id !== currentStaff.id;
    });
    
    if (existingStaff && !window.confirm(`${existingStaff.name} is already assigned to ${assignedClass}. Override?`)) {
      return;
    }

    const staffData = { ...currentStaff, assignedClass };

    if (isEditing) {
      setStaffList(prev => prev.map(s => s.id === currentStaff.id ? staffData : s));
      alert('Staff updated successfully!');
    } else {
      setStaffList(prev => [...prev, { 
        ...staffData, 
        id: Date.now(), 
        role: 'lecturer'
      }]);
      alert('Staff account created successfully!');
    }
    
    setIsEditing(false);
    setCurrentStaff({ name: '', email: '', password: '', branch: 'CSE', academicYear: '1st Year' });
  };

  const handleEdit = (staff) => {
    setIsEditing(true);
    setCurrentStaff(staff);
  };

  const handleDelete = (id) => {
    if(window.confirm('Delete this staff member?')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      alert('Staff deleted successfully!');
    }
  };

  // Filter staff
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         staff.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || staff.academicYear === yearFilter;
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
          onClick={() => { 
            setIsEditing(false); 
            setCurrentStaff({ name: '', email: '', password: '', branch: 'CSE', academicYear: '1st Year' }); 
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
        >
          <Plus size={18} /> Add New Staff
        </button>
      </div>

      {/* Staff Creation Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User size={18} className="text-blue-500" />
          {isEditing ? 'Edit Staff Details' : 'Add New Staff Member'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Staff Name</label>
            <input 
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Enter staff name" 
              value={currentStaff.name} 
              onChange={e => setCurrentStaff({...currentStaff, name: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Enter email address" 
              value={currentStaff.email} 
              onChange={e => setCurrentStaff({...currentStaff, email: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Create password" 
              value={currentStaff.password} 
              onChange={e => setCurrentStaff({...currentStaff, password: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={currentStaff.branch}
              onChange={e => setCurrentStaff({...currentStaff, branch: e.target.value})}
            >
              {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={currentStaff.academicYear}
              onChange={e => setCurrentStaff({...currentStaff, academicYear: e.target.value})}
            >
              {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Assigned Class: </span>
            <span className="font-bold">{getAssignedClass(currentStaff.branch, currentStaff.academicYear)}</span>
          </p>
        </div>
        
        <button 
          onClick={handleSave} 
          className="w-full bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 font-medium transition-colors"
        >
          {isEditing ? 'Update Staff Details' : 'Create Staff Account'}
        </button>
        
        <p className="text-xs text-slate-500 mt-2 text-center">
          Staff manage attendance for their assigned class across all subjects
        </p>
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

          <select
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>

          <select
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>

          <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-medium text-sm flex items-center gap-2">
            <Filter size={16} />
            {filteredStaff.length} Staff
          </div>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Staff Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Academic Year</th>
              <th className="px-6 py-4">Assigned Class</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.map(staff => (
              <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {staff.name?.charAt(0) || 'S'}
                    </div>
                    <span className="font-medium text-slate-800">{staff.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{staff.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                    {staff.academicYear || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {staff.assignedClass || getAssignedClass(staff.branch || 'CSE', staff.academicYear || '1st Year')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    Class In-Charge
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => handleEdit(staff)} 
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(staff.id)} 
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Delete"
                  >
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
    </div>
  );
};

export default AdminStaffManager;

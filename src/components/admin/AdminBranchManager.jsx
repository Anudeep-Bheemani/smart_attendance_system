import React, { useState } from 'react';
import { Plus, Trash2, Layers, X, Save } from 'lucide-react';

const AdminBranchManager = ({ branches, setBranches }) => {
  const [showModal, setShowModal] = useState(false);
  const [branchName, setBranchName] = useState('');

  const handleAdd = () => {
    setBranchName('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (branchName && !branches.includes(branchName.trim())) {
      setBranches(prev => [...prev, branchName.trim()]);
      alert('Branch added successfully!');
      setShowModal(false);
    } else {
      alert('Branch already exists or invalid name!');
    }
  };

  const handleDelete = (branch) => {
    if (window.confirm(`Are you sure you want to delete ${branch} branch?`)) {
      setBranches(prev => prev.filter(b => b !== branch));
      alert('Branch deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Branch Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage academic branches and departments</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md transition-colors"
        >
          <Plus size={18} />
          Add Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Layers size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{branch}</h3>
                  <p className="text-slate-500 text-sm">Department</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(branch)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Add New Branch</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Layers size={14} /> Branch Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g., IT, AIDS, CSE-DS"
              />
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Save size={16} />
                Add Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBranchManager;

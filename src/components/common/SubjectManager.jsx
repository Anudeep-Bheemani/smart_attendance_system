import React, { useState } from 'react';
import { Plus, Edit3, Trash2, BookOpen, Layers, Calendar, Save, X } from 'lucide-react';

const SubjectManager = ({ subjects, setSubjects, branches }) => {
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedYear, setSelectedYear] = useState('1');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const years = ['1', '2', '3', '4'];
  const classSubjects = subjects[selectedBranch]?.[selectedYear] || [];
  const classKey = `${selectedBranch} Year ${selectedYear}`;

  const handleAdd = () => {
    setEditMode(false);
    setCurrentSubject('');
    setShowModal(true);
  };

  const handleEdit = (subject, index) => {
    setEditMode(true);
    setCurrentSubject(subject);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!currentSubject.trim()) {
      alert('Please enter a subject name');
      return;
    }

    setSubjects(prev => {
      const updated = { ...prev };
      if (!updated[selectedBranch]) {
        updated[selectedBranch] = {};
      }
      if (!updated[selectedBranch][selectedYear]) {
        updated[selectedBranch][selectedYear] = [];
      }

      if (editMode) {
        updated[selectedBranch][selectedYear][editIndex] = currentSubject.trim();
      } else {
        if (updated[selectedBranch][selectedYear].includes(currentSubject.trim())) {
          alert('Subject already exists for this class');
          return prev;
        }
        updated[selectedBranch][selectedYear] = [...updated[selectedBranch][selectedYear], currentSubject.trim()];
      }

      return updated;
    });

    setShowModal(false);
    setCurrentSubject('');
    alert(editMode ? 'Subject updated successfully!' : 'Subject added successfully!');
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(prev => {
        const updated = { ...prev };
        updated[selectedBranch][selectedYear] = updated[selectedBranch][selectedYear].filter((_, i) => i !== index);
        return updated;
      });
      alert('Subject deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Subject Management</h2>
        <p className="text-slate-500 text-sm">Manage subjects for each class (Branch + Year)</p>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-500" />
          Select Class
        </h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(y => (
                <option key={y} value={y}>
                  {y === '1' ? '1st' : y === '2' ? '2nd' : y === '3' ? '3rd' : '4th'} Year
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Selected Class: </span>
            <span className="font-bold">{classKey}</span>
          </p>
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              Subjects for {selectedBranch} Year {selectedYear}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{classSubjects.length} subjects</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            <Plus size={18} />
            Add Subject
          </button>
        </div>

        <div className="p-6">
          {classSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classSubjects.map((subject, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{subject}</h4>
                        <p className="text-xs text-slate-500">{selectedBranch} Year {selectedYear}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(subject, index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No subjects added for {selectedBranch} Year {selectedYear}</p>
              <p className="text-sm">Click "Add Subject" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {editMode ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                placeholder="e.g., Data Structures, Operating Systems"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                For class: <span className="font-bold text-blue-600">{selectedBranch} Year {selectedYear}</span>
              </p>
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
                {editMode ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;

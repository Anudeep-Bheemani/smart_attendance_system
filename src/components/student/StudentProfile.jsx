import React from 'react';
import { User, CalendarDays, Mail, Phone, GraduationCap, FileText, Layers, Calendar, Users } from 'lucide-react';

const StudentProfile = ({ student }) => {
  const ProfileField = ({ label, value, icon: Icon }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <div className="text-slate-900 font-medium text-base truncate" title={value}>
        {value || "N/A"}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
            {student.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm justify-center md:justify-start mt-1">
              <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">{student.rollNo}</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">Student Profile</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wide border border-blue-100">
          Read Only
        </div>
      </div>
      
      <div className="p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-blue-500" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ProfileField label="Full Name" value={student.name} icon={User} />
          <ProfileField label="Date of Birth" value={student.dob} icon={CalendarDays} />
          <ProfileField label="Gmail Address" value={student.email} icon={Mail} />
          <ProfileField label="Student Phone" value={student.phone} icon={Phone} />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap size={20} className="text-blue-500" /> Academic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           <ProfileField label="Roll Number" value={student.rollNo} icon={FileText} />
           <ProfileField label="Branch" value={student.branch} icon={Layers} />
           <ProfileField label="Year" value={`Year ${student.year}`} icon={Calendar} />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-500" /> Guardian Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <ProfileField label="Parent's Name" value={student.guardianName} icon={User} />
           <ProfileField label="Parent's Phone" value={student.guardianPhone} icon={Phone} />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

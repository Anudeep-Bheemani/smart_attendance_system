import React from 'react';
import { User, CalendarDays, Mail, Phone, GraduationCap, FileText, Layers, Calendar, Users, Camera } from 'lucide-react';

const StudentProfile = ({ student }) => {
  const ProfileField = ({ label, value, icon: Icon }) => (
    <div className="group bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
        {Icon && <Icon size={14} className="group-hover:text-blue-500 transition-colors" />}
        {label}
      </div>
      <div className="text-slate-900 font-semibold text-base truncate" title={value}>
        {value || "N/A"}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200 max-w-5xl mx-auto overflow-hidden">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 pb-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex justify-between items-start">
          <div className="text-white">
            <h1 className="text-3xl font-black mb-2">Student Profile</h1>
            <p className="text-blue-100 text-sm">Personal & Academic Information</p>
          </div>
          <div className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase rounded-full border border-white/30">
            Read Only
          </div>
        </div>
      </div>

      {/* Profile Card - Overlapping header */}
      <div className="relative -mt-16 mx-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4 border-white">
                {student.name.charAt(0)}
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Camera size={18} className="text-blue-600" />
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 mb-2">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-4">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                  {student.rollNo}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                  {student.branch}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                  Year {student.year}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-500" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-blue-500" />
                  <span>{student.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8 pt-6 space-y-8">
        {/* Personal Details */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfileField label="Full Name" value={student.name} icon={User} />
            <ProfileField label="Date of Birth" value={student.dob} icon={CalendarDays} />
            <ProfileField label="Gmail Address" value={student.email} icon={Mail} />
            <ProfileField label="Student Phone" value={student.phone} icon={Phone} />
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Academic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfileField label="Roll Number" value={student.rollNo} icon={FileText} />
            <ProfileField label="Branch" value={student.branch} icon={Layers} />
            <ProfileField label="Year" value={`Year ${student.year}`} icon={Calendar} />
          </div>
        </div>

        {/* Guardian Details */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Guardian Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfileField label="Parent's Name" value={student.guardianName} icon={User} />
            <ProfileField label="Parent's Phone" value={student.guardianPhone} icon={Phone} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

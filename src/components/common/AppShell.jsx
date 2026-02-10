import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, Edit3, Settings, Activity, User, LogOut, GraduationCap, Menu, X, Layers, Moon, Sun, BookOpen } from 'lucide-react';

const AppShell = ({ user, onLogout, children, activeView, setActiveView, darkMode, setDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'student-management', label: 'Student Management', icon: Users },
      { id: 'staff-management', label: 'Staff Management', icon: Users },
      { id: 'branch-management', label: 'Branch Management', icon: Layers },
      { id: 'subject-management', label: 'Subject Management', icon: BookOpen },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    lecturer: [
      { id: 'dashboard', label: 'Class Analytics', icon: LayoutDashboard },
      { id: 'entry', label: 'Attendance Entry', icon: Edit3 },
      { id: 'manage-records', label: 'Manage Records', icon: Settings },
      { id: 'subject-management', label: 'Subject Management', icon: BookOpen },
      { id: 'settings', label: 'Account Settings', icon: User },
    ],
    student: [
      { id: 'dashboard', label: 'My Attendance', icon: Activity },
      { id: 'classmates', label: 'Class Attendance', icon: Users },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
    parent: [
      { id: 'dashboard', label: 'Child Progress', icon: Activity },
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-white text-xl">
            <GraduationCap className="text-blue-500" />
            <span>SmartAttd.</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-500">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={20} className="text-slate-600" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppShell;

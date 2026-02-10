import React, { useState } from 'react';
import { User, Lock, GraduationCap, Activity, TrendingUp, AlertTriangle, Mail, X, Link as LinkIcon, Brain, Sparkles, BarChart3, Shield, Moon, Sun } from 'lucide-react';

const LandingPage = ({ onLogin, onVerify, darkMode, setDarkMode, students }) => {
  const [activeTab, setActiveTab] = useState('student');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyRollNo, setVerifyRollNo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(activeTab, formData);
  };
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (verifyStep === 1) {
      const student = students.find(s => s.rollNo === verifyRollNo && s.email === verifyEmail);
      if (!student) {
        alert('Student not found. Please contact admin to add you first.');
        return;
      }
      if (student.verified) {
        alert('Account already verified. Please login.');
        return;
      }
      setVerifyStep(2);
    } else if (verifyStep === 3) {
      onVerify(verifyEmail, newPassword);
      setIsVerifying(false);
      setVerifyStep(1);
      setVerifyEmail('');
      setVerifyRollNo('');
      setNewPassword('');
      alert("Account verified! You can now login.");
    }
  };
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative">
          <button onClick={() => setIsVerifying(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {verifyStep === 1 ? <Mail size={32} /> : verifyStep === 2 ? <LinkIcon size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Account Verification</h2>
            <p className="text-slate-500 text-sm mt-2">
              {verifyStep === 1 ? "Enter your details to receive a verification link." :
                verifyStep === 2 ? "We've sent a simulated link to your email." :
                  "Create a secure password for your account."}
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            {verifyStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={verifyRollNo}
                    onChange={(e) => setVerifyRollNo(e.target.value)}
                    placeholder="24CSE101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    placeholder="student@college.edu"
                  />
                </div>
              </>
            )}

            {verifyStep === 2 && (
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                  <p className="font-bold">Simulated Email Inbox</p>
                  <p>Subject: Verify your SmartAttd Account</p>
                  <button
                    type="button"
                    onClick={() => setVerifyStep(3)}
                    className="mt-2 text-blue-600 underline font-bold"
                  >
                    [Click here to Verify]
                  </button>
                </div>
                <p className="text-xs text-slate-400">In a real app, this link would be in your Gmail.</p>
              </div>
            )}

            {verifyStep === 3 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Set New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {verifyStep !== 2 && (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg"
              >
                {verifyStep === 1 ? "Send Link" : "Activate Account"}
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col md:flex-row relative overflow-hidden">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all shadow-lg border border-white/20"
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode ? <Sun size={24} className="text-white" /> : <Moon size={24} className="text-white" />}
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Left Panel - Hero Section */}
      <div className="w-full md:w-2/5 p-8 md:p-12 text-white flex flex-col justify-center relative z-10 min-h-[50vh] md:min-h-screen">
        <div className="max-w-xl">
          {/* Logo & Title */}
          <div className="flex items-center gap-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                <GraduationCap size={36} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                SmartAttd
              </h1>
              <p className="text-blue-300 text-sm font-semibold tracking-wider">AI-POWERED SYSTEM</p>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
            Intelligent Attendance
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
              Management Platform
            </span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Experience next-generation attendance tracking with real-time analytics,
            AI-powered predictions, and intelligent risk management.
          </p>
          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="group bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <Brain size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">AI Predictions</h3>
              <p className="text-blue-300 text-sm">Smart forecasting</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Live Analytics</h3>
              <p className="text-blue-300 text-sm">Real-time insights</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Risk Alerts</h3>
              <p className="text-blue-300 text-sm">Instant warnings</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Secure Access</h3>
              <p className="text-blue-300 text-sm">Protected data</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-blue-300">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-blue-300">Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">AI</div>
              <div className="text-blue-300">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-4 md:p-8 relative z-10 min-h-[50vh] md:min-h-screen bg-slate-50 md:bg-transparent rounded-t-3xl md:rounded-none -mt-6 md:mt-0">
        <div className="w-full max-w-xl">
          <div className="bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Access your intelligent dashboard</p>
            </div>

            {/* Role Selector */}
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
              {['student', 'parent', 'lecturer', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`capitalize text-xs py-2.5 rounded-lg font-bold transition-all ${activeTab === role
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {activeTab === 'student' || activeTab === 'parent' ? 'Roll No / ID' : 'Email Address'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <User className="absolute left-4 top-3.5 text-slate-400 z-10" size={20} />
                  <input
                    type="text"
                    required
                    className="relative w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    placeholder={activeTab === 'student' ? '24CSE101' : 'user@college.edu'}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <Lock className="absolute left-4 top-3.5 text-slate-400 z-10" size={20} />
                  <input
                    type="password"
                    required
                    className="relative w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 bg-[length:200%_100%] hover:bg-right"
              >
                Access Dashboard →
              </button>
            </form>

            {activeTab === 'student' && (
              <div className="mt-6 text-center pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-3">New Student?</p>
                <button
                  onClick={() => setIsVerifying(true)}
                  className="text-blue-600 font-bold hover:text-purple-600 text-sm transition-colors"
                >
                  Verify Account & Set Password →
                </button>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>Student: 24CSE100/pass | Staff: alan@college.edu/pass | Admin: admin@college.edu/admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;

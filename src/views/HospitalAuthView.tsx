import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital } from '../types';
import {
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
} from 'lucide-react';

interface HospitalAuthViewProps {
  setCurrentView: (view: string) => void;
}

export const HospitalAuthView: React.FC<HospitalAuthViewProps> = ({ setCurrentView }) => {
  const { loginHospital, hospitals } = useApp();
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Login state
  const [staffName, setStaffName] = useState<string>('Dr. Michael Hayes');
  const [hospitalIdOrEmail, setHospitalIdOrEmail] = useState<string>('HOSP-METRO-01');
  const [password, setPassword] = useState<string>('password123');

  // Registration state
  const [hospitalName, setHospitalName] = useState<string>('');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('San Francisco');
  const [area, setArea] = useState<string>('Medical District');
  const [pincode, setPincode] = useState<string>('94102');
  const [type, setType] = useState<Hospital['type']>('Trauma Center');
  const [is24x7, setIs24x7] = useState<boolean>(true);

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const ok = loginHospital(hospitalIdOrEmail, staffName);
    if (ok) {
      setCurrentView('hospital-portal');
    } else {
      setErrorMsg('Hospital not found. Please try one of the demo hospitals.');
    }
  };

  const handleQuickDemoHospital = (id: string) => {
    loginHospital(id, staffName);
    setCurrentView('hospital-portal');
  };

  return (
    <div className="bg-slate-900 min-h-screen py-12 flex items-center justify-center px-4 text-white">
      <div className="max-w-xl w-full bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500 text-blue-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isLogin ? 'Hospital Transfusion Portal Login' : 'Hospital Facility Onboarding'}
          </h1>
          <p className="text-xs text-slate-400">
            {isLogin
              ? 'Authorized access for blood bank supervisors, transfusion teams, and trauma units.'
              : 'Register your hospital or blood bank to receive live emergency requests.'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-slate-900 p-1 rounded-xl text-xs font-bold border border-slate-800">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              isLogin ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hospital Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              !isLogin ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Facility
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-300">
                  Doctor / Transfusion Officer Name
                </label>
                <span className="text-[10px] text-blue-400 font-semibold">User-customizable</span>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Dr. Michael Hayes or Your Name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Hospital ID or Registered Email
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={hospitalIdOrEmail}
                  onChange={(e) => setHospitalIdOrEmail(e.target.value)}
                  placeholder="e.g. HOSP-METRO-01 or bloodbank@citycare.org"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition"
            >
              Sign In to Hospital Portal
            </button>

            {/* Quick Demo Hospitals */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                1-Click Quick Demo Hospital Profiles:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hospitals.slice(0, 4).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleQuickDemoHospital(h.hospitalId)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 transition text-[11px]"
                  >
                    <span className="font-bold text-white block truncate">{h.name}</span>
                    <span className="text-slate-400 text-[10px]">{h.hospitalId} • {h.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginHospital('HOSP-METRO-01');
              setCurrentView('hospital-portal');
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. St. Jude Memorial"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Assigned Hospital ID</label>
                <input
                  type="text"
                  required
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  placeholder="e.g. HOSP-METRO-07"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bloodbank@hospital.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Emergency Blood Line</label>
                <input
                  type="tel"
                  required
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+1 (555) 911-0099"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Facility Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm font-semibold"
                >
                  <option value="Trauma Center">Trauma Center (Level 1/2)</option>
                  <option value="Super Specialty">Super Specialty</option>
                  <option value="Blood Bank & Transfusion">Blood Bank & Transfusion Center</option>
                  <option value="General Hospital">General Hospital</option>
                  <option value="Government Medical Center">Government Medical Center</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is24x7}
                    onChange={(e) => setIs24x7(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-700 focus:ring-blue-500"
                  />
                  <span>24/7 Emergency Transfusion Desk</span>
                </label>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              Note: New hospital registrations enter <strong className="text-amber-400">PENDING</strong> verification status until state health licensing credentials are verified by an administrator.
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition mt-2"
            >
              Submit Facility Registration (Pending Review)
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-400">
          <span>Are you an individual blood donor or patient? </span>
          <button
            onClick={() => setCurrentView('user-auth')}
            className="text-rose-400 hover:text-rose-300 font-bold underline ml-1"
          >
            Public User Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

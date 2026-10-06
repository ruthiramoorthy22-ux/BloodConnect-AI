import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS } from '../services/bloodCompatibility';
import { BloodGroup } from '../types';
import {
  Heart,
  Droplet,
  User,
  Lock,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';

interface UserAuthViewProps {
  setCurrentView: (view: string) => void;
  initialRole?: 'user' | 'hospital';
}

export const UserAuthView: React.FC<UserAuthViewProps> = ({
  setCurrentView,
  initialRole = 'user',
}) => {
  const { loginUser, loginHospital, registerDonor, donors, hospitals } = useApp();

  // Selected Portal: 'user' (Public / Donor) vs 'hospital' (Hospital / Blood Bank)
  const [selectedRole, setSelectedRole] = useState<'user' | 'hospital'>(initialRole);
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Public User Login state - allows user to type their custom name and email
  const [userName, setUserName] = useState<string>('Ruthiramoorthy');
  const [userEmail, setUserEmail] = useState<string>('ruthiramoorthy22@gmail.com');
  const [userBloodGroup, setUserBloodGroup] = useState<BloodGroup>('O+');
  const [userPassword, setUserPassword] = useState<string>('password123');

  // Hospital Login state
  const [hospitalStaffName, setHospitalStaffName] = useState<string>('Dr. Michael Hayes');
  const [hospitalIdOrEmail, setHospitalIdOrEmail] = useState<string>('HOSP-METRO-01');
  const [hospitalPassword, setHospitalPassword] = useState<string>('password123');

  // Public User Register state
  const [fullName, setFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [dob, setDob] = useState<string>('1995-01-01');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [city, setCity] = useState<string>('San Francisco');
  const [area, setArea] = useState<string>('Civic Center');
  const [address, setAddress] = useState<string>('100 Van Ness Ave');

  // Hospital Register state
  const [hospitalName, setHospitalName] = useState<string>('');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [hospEmail, setHospEmail] = useState<string>('');
  const [hospPhone, setHospPhone] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [hospCity, setHospCity] = useState<string>('San Francisco');
  const [hospArea, setHospArea] = useState<string>('Medical District');
  const [hospType, setHospType] = useState<string>('Trauma Center');

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginUser(userEmail, userName, userBloodGroup);
    if (success) {
      setCurrentView('dashboard');
    } else {
      setErrorMsg('Login failed. Please check your credentials.');
    }
  };

  const handleHospitalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginHospital(hospitalIdOrEmail, hospitalStaffName);
    if (success) {
      setCurrentView('hospital-portal');
    } else {
      setErrorMsg('Hospital not found. Try one of the quick demo hospitals.');
    }
  };

  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    registerDonor({
      name: fullName,
      email: regEmail,
      phone,
      role: 'user',
      bloodGroup,
      gender,
      dob,
      city,
      area,
      address,
      donationCount: 0,
      availability: 'Available',
    });

    setCurrentView('dashboard');
  };

  const handleHospitalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    loginHospital('HOSP-METRO-01');
    setCurrentView('hospital-portal');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Role Switcher Tabs */}
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block text-center mb-2">
            Select Your Login Portal:
          </span>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('user');
                setErrorMsg('');
              }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 ${
                selectedRole === 'user'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${selectedRole === 'user' ? 'fill-white' : ''}`} />
              <span>Public User / Donor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('hospital');
                setErrorMsg('');
              }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 ${
                selectedRole === 'hospital'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Transfusion Portal</span>
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {selectedRole === 'user'
              ? isLogin
                ? 'Public User & Donor Sign In'
                : 'Create Donor Account'
              : isLogin
              ? 'Hospital Portal Sign In'
              : 'Register New Hospital Facility'}
          </h1>
          <p className="text-xs text-slate-500">
            {selectedRole === 'user'
              ? 'Request blood, track emergency requests, or register as a lifesaver.'
              : 'Manage blood stock inventory, patient requests, and Gemini AI donor matching.'}
          </p>
        </div>

        {/* Toggle Login vs Register */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold max-w-xs mx-auto">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* SECTION 1: PUBLIC USER AUTH */}
        {selectedRole === 'user' && (
          <>
            {isLogin ? (
              <form onSubmit={handleUserLogin} className="space-y-4 text-xs">
                {/* User-given Login Name field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Your Name / Display Name <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">User-customizable</span>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Ruthiramoorthy or Your Name"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-semibold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="e.g. ruthiramoorthy22@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={userBloodGroup}
                      onChange={(e) => setUserBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-900"
                    >
                      {ALL_BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          Group {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In as {userName || 'Public User'}</span>
                </button>

                {/* 1-Click Fast Demo Public Logins */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">
                    ⚡ 1-Click Instant Demo User Sign-In (Or Click to Auto-fill):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {donors.slice(0, 4).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setUserName(d.name);
                          setUserEmail(d.email);
                          setUserBloodGroup(d.bloodGroup);
                          loginUser(d.email, d.name, d.bloodGroup);
                          setCurrentView('dashboard');
                        }}
                        className="p-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-100/80 text-left border border-rose-200 transition text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{d.name}</span>
                          <span className="text-slate-500 text-[10px]">{d.email}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-xs shrink-0">
                          {d.bloodGroup}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUserRegister} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50"
                    >
                      {ALL_BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Area / Neighborhood</label>
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/30 transition mt-2"
                >
                  Register Account & Become Donor
                </button>
              </form>
            )}
          </>
        )}

        {/* SECTION 2: HOSPITAL AUTH */}
        {selectedRole === 'hospital' && (
          <>
            {isLogin ? (
              <form onSubmit={handleHospitalLogin} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Doctor / Officer Name (Login User)
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Customizable</span>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={hospitalStaffName}
                      onChange={(e) => setHospitalStaffName(e.target.value)}
                      placeholder="e.g. Dr. Michael Hayes or Your Name"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hospital ID or Official Email
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={hospitalIdOrEmail}
                      onChange={(e) => setHospitalIdOrEmail(e.target.value)}
                      placeholder="e.g. HOSP-METRO-01 or bloodbank@citycare.org"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={hospitalPassword}
                      onChange={(e) => setHospitalPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Sign In to Hospital Portal</span>
                </button>

                {/* 1-Click Fast Demo Hospital Logins */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">
                    ⚡ 1-Click Instant Demo Hospital Sign-In:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hospitals.slice(0, 4).map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          loginHospital(h.hospitalId);
                          setCurrentView('hospital-portal');
                        }}
                        className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/90 text-left border border-blue-200 transition text-xs flex items-center justify-between"
                      >
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-900 block truncate">{h.name}</span>
                          <span className="text-slate-500 text-[10px]">{h.hospitalId} • {h.type}</span>
                        </div>
                        <span className="text-blue-700 font-bold text-xs shrink-0 ml-2">
                          Sign In &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleHospitalRegister} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. St. Jude Memorial"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facility Hospital ID</label>
                    <input
                      type="text"
                      required
                      value={hospitalId}
                      onChange={(e) => setHospitalId(e.target.value)}
                      placeholder="e.g. HOSP-METRO-07"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      value={hospEmail}
                      onChange={(e) => setHospEmail(e.target.value)}
                      placeholder="bloodbank@hospital.org"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Blood Line</label>
                    <input
                      type="tel"
                      required
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="+1 (555) 911-0099"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={hospCity}
                      onChange={(e) => setHospCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facility Type</label>
                    <select
                      value={hospType}
                      onChange={(e) => setHospType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                    >
                      <option value="Trauma Center">Trauma Center (Level 1/2)</option>
                      <option value="Super Specialty">Super Specialty</option>
                      <option value="Blood Bank & Transfusion">Dedicated Blood Bank</option>
                      <option value="General Hospital">General Hospital</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 transition mt-2"
                >
                  Submit Hospital Onboarding (Pending Verification)
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

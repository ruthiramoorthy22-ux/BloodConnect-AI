import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_BLOOD_GROUPS } from '../../services/bloodCompatibility';
import { BloodGroup } from '../../types';
import {
  Heart,
  Droplet,
  Search,
  ShieldAlert,
  MapPin,
  ArrowRight,
  Activity,
  Building2,
  Users,
  Sparkles,
  Clock,
} from 'lucide-react';

interface HeroSectionProps {
  onSearchBlood: (group: BloodGroup, city: string) => void;
  setCurrentView: (view: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearchBlood, setCurrentView }) => {
  const { bloodStock, hospitals, donors } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [selectedCity, setSelectedCity] = useState<string>('San Francisco');

  // Compute live platform stats
  const totalUnits = bloodStock.reduce((acc, curr) => acc + curr.units, 0);
  const criticalUnitsCount = bloodStock.filter((s) => s.units <= s.criticalLevel).length;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchBlood(selectedGroup, selectedCity);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>AI-POWERED EMERGENCY BLOOD MANAGEMENT & HOSPITAL LOCATOR</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Connecting Blood. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-400 via-red-400 to-amber-300 bg-clip-text text-transparent">
              Saving Lives in Real-Time.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bridging patients, verified voluntary blood donors, and hospitals through real-time inventory tracking, Google Maps precision locating, and Gemini AI decision support.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('emergency')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 transition active:scale-95 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              EMERGENCY REQUEST (CRITICAL)
            </button>

            <button
              onClick={() => setCurrentView('donor')}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md flex items-center gap-2 transition"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/40" />
              Become a Donor
            </button>
          </div>

          {/* Quick 1-Click Login Access Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Quick Login Portals:
              </span>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setCurrentView('user-auth')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Public Login</span>
                </button>

                <button
                  onClick={() => setCurrentView('hospital-auth')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Hospital Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Card */}
        <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200/50 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span className="font-extrabold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-2">
              <Search className="w-4 h-4" /> Quick Blood Availability Finder
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Live Stock: <strong className="text-slate-900">{totalUnits} units</strong> available
            </span>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Blood Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value as BloodGroup)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
              >
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg} ({bg === 'O-' ? 'Universal Donor' : bg === 'AB+' ? 'Universal Recipient' : 'Blood Group'})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g. San Francisco"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 transition shadow-md shadow-rose-600/30"
              >
                <Search className="w-4 h-4" /> Find Stock
              </button>
            </div>
          </form>

          {/* Blood group quick pills */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold text-[10px] uppercase mr-1">Fast Select:</span>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => {
                  setSelectedGroup(bg);
                  onSearchBlood(bg, selectedCity);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  selectedGroup === bg
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Active Donors</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{donors.length * 120}+</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">● Ready to respond</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Connected Hospitals</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{hospitals.length}</p>
            <p className="text-[10px] text-blue-400 font-semibold mt-0.5">24/7 Verified Blood Banks</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Units In Reserve</span>
              <Droplet className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalUnits}</p>
            <p className="text-[10px] text-rose-400 font-semibold mt-0.5">{criticalUnitsCount} groups in critical demand</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Emergency Triage</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">~18 mins</p>
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Average dispatch time</p>
          </div>
        </div>
      </div>
    </section>
  );
};

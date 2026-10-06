import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Heart,
  Droplet,
  Building2,
  ShieldAlert,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface UserDashboardViewProps {
  setCurrentView: (view: string) => void;
  onTrackRequest?: (id: string) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  setCurrentView,
  onTrackRequest,
}) => {
  const { currentUser, bloodRequests, emergencyRequests, hospitals, notifications } = useApp();

  const myRequests = bloodRequests.filter(
    (r) => r.patientName.toLowerCase() === (currentUser?.name || '').toLowerCase()
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                User & Donor Portal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                {currentUser?.availability || 'Active Citizen'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {currentUser?.name || 'Lifesaver'}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Blood Group: <strong className="text-rose-400 font-bold">{currentUser?.bloodGroup || 'O+'}</strong> • City: {currentUser?.city || 'San Francisco'} • Lifetime Donations: {currentUser?.donationCount || 0}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentView('request')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
            >
              <Droplet className="w-4 h-4" /> Request Blood
            </button>
            <button
              onClick={() => setCurrentView('emergency')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition flex items-center gap-1.5 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" /> Emergency
            </button>
          </div>
        </div>

        {/* 4 Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Blood Requests</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{myRequests.length || bloodRequests.length}</p>
              <span className="text-[11px] text-slate-500">Active tracking pipeline</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Droplet className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nearby Hospitals</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{hospitals.length}</p>
              <span className="text-[11px] text-blue-600 font-semibold">Ready for transfusion</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donor Readiness</span>
              <p className="text-lg font-black text-emerald-600 mt-1">
                {currentUser?.availability === 'Available' ? 'Available' : 'Cooldown'}
              </p>
              <span className="text-[11px] text-slate-500">Ready to donate</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-emerald-600/30" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Emergencies</span>
              <p className="text-2xl font-black text-red-600 mt-1">{emergencyRequests.length}</p>
              <span className="text-[11px] text-red-500 font-semibold">Priority Trauma Alert</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Quick Actions:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <button
              onClick={() => setCurrentView('availability')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-800 font-bold flex flex-col items-center gap-1.5 transition"
            >
              <Search className="w-4 h-4 text-rose-600" />
              <span>Find Blood</span>
            </button>

            <button
              onClick={() => setCurrentView('hospitals')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-800 font-bold flex flex-col items-center gap-1.5 transition"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Find Hospitals</span>
            </button>

            <button
              onClick={() => setCurrentView('donor')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-800 font-bold flex flex-col items-center gap-1.5 transition"
            >
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Donor Status</span>
            </button>

            <button
              onClick={() => setCurrentView('emergency')}
              className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex flex-col items-center gap-1.5 transition"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Emergency</span>
            </button>

            <button
              onClick={() => setCurrentView('hospitals')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 text-slate-800 font-bold flex flex-col items-center gap-1.5 transition col-span-2 sm:col-span-1"
            >
              <Activity className="w-4 h-4 text-purple-600" />
              <span>View Map</span>
            </button>
          </div>
        </div>

        {/* Recent Blood Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Recent Blood Requests ({bloodRequests.length})
            </span>
            <button
              onClick={() => setCurrentView('request')}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold"
            >
              + Create Request
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {bloodRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.patientName}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-xs">
                      {req.bloodGroup}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">({req.id})</span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {req.units} unit(s) • {req.preferredHospitalName || 'Hospital Network'} • {req.location}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      req.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {req.status}
                  </span>
                  <button
                    onClick={() => {
                      if (onTrackRequest) onTrackRequest(req.id);
                      setCurrentView('tracking');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

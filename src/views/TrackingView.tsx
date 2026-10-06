import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BloodRequest, RequestStatus } from '../types';
import {
  Activity,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  Droplet,
  MapPin,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface TrackingViewProps {
  setCurrentView: (view: string) => void;
  initialRequestId?: string | null;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  setCurrentView,
  initialRequestId,
}) => {
  const { bloodRequests, emergencyRequests, updateRequestStatus } = useApp();
  const [searchInput, setSearchInput] = useState<string>(initialRequestId || '');
  const [selectedReqId, setSelectedReqId] = useState<string>(
    initialRequestId || bloodRequests[0]?.id || ''
  );

  const selectedRequest =
    bloodRequests.find((r) => r.id === selectedReqId) ||
    emergencyRequests.find((r) => r.id === selectedReqId);

  const milestones: { status: RequestStatus | 'ACTIVE'; label: string; desc: string }[] = [
    {
      status: 'REQUESTED',
      label: 'Request Created',
      desc: 'Transfusion requirement received and recorded in system queue.',
    },
    {
      status: 'MATCHING',
      label: 'Searching & AI Matching',
      desc: 'Gemini AI searching compatible donors and nearest hospital reserves.',
    },
    {
      status: 'DONOR FOUND',
      label: 'Potential Donor / Stock Located',
      desc: 'Compatible units identified and flagged for reservation.',
    },
    {
      status: 'HOSPITAL CONFIRMED',
      label: 'Hospital Confirmed & In Transit',
      desc: 'Hospital transfusion department verified unit readiness.',
    },
    {
      status: 'COMPLETED',
      label: 'Transfusion Completed',
      desc: 'Blood delivered and successfully administered to patient.',
    },
  ];

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case 'REQUESTED':
      case 'ACTIVE':
        return 0;
      case 'MATCHING':
      case 'TRIAGED':
        return 1;
      case 'DONOR FOUND':
        return 2;
      case 'HOSPITAL CONFIRMED':
      case 'DISPATCHED':
        return 3;
      case 'COMPLETED':
      case 'RESOLVED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = selectedRequest ? getMilestoneIndex(selectedRequest.status) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedReqId(searchInput.trim());
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>End-to-End Transfusion Pipeline</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Request Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time milestone tracking for blood and emergency transfusion requests across network hospitals and volunteer donor responses.
          </p>
        </div>

        {/* Search by Request ID */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter unique Request ID (e.g. BLD-REQ-2026-8812 or EMG-2026-901)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Track Request
            </button>
          </form>

          {/* Quick select pills */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Recent Requests:</span>
            {bloodRequests.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedReqId(r.id);
                  setSearchInput(r.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  selectedReqId === r.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {r.id} ({r.bloodGroup})
              </button>
            ))}
          </div>
        </div>

        {selectedRequest ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">
                    {'patientName' in selectedRequest ? selectedRequest.patientName : 'Emergency Patient'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-black">
                    {selectedRequest.bloodGroup}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: <strong className="text-slate-800">{selectedRequest.id}</strong> • Created:{' '}
                  {new Date(selectedRequest.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase ${
                    selectedRequest.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-900 border border-purple-200 animate-pulse'
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Visual Milestone Stepper */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Milestone Progress Timeline:
              </span>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {milestones.map((m, idx) => {
                  const isPast = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  const isFuture = idx > currentStep;

                  return (
                    <div key={m.label} className="relative flex items-start gap-4">
                      {/* Step Circle */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs ${
                          isPast
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-purple-600 text-white ring-4 ring-purple-100 animate-bounce'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                      >
                        {isPast ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              isCurrent ? 'text-purple-700' : isPast ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {m.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Units Required</span>
                <span className="text-base font-black text-slate-900">{selectedRequest.units} unit(s)</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination Facility</span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {'preferredHospitalName' in selectedRequest
                    ? selectedRequest.preferredHospitalName
                    : 'hospital' in selectedRequest
                    ? selectedRequest.hospital
                    : 'Designated Medical Center'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Location / Ward</span>
                <span className="text-xs font-semibold text-slate-700 block truncate">
                  {selectedRequest.location}
                </span>
              </div>
            </div>

            {/* Quick Simulation Control (for demo review) */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-purple-900 font-semibold">
                Demo Action: Simulate status advancement for this request
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateRequestStatus(selectedRequest.id, 'DONOR FOUND')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-purple-200 text-purple-900 font-bold"
                >
                  Mark Donor Found
                </button>
                <button
                  onClick={() => updateRequestStatus(selectedRequest.id, 'HOSPITAL CONFIRMED')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-purple-200 text-purple-900 font-bold"
                >
                  Confirm Hospital
                </button>
                <button
                  onClick={() => updateRequestStatus(selectedRequest.id, 'COMPLETED')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <Clock className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No request selected</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please enter a valid Request ID above or select from your recent blood requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

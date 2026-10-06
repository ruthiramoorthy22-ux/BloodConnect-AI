import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS } from '../services/bloodCompatibility';
import { BloodGroup } from '../types';
import {
  Droplet,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface RequestBloodViewProps {
  setCurrentView: (view: string) => void;
  preselectedHospitalId?: string;
  preselectedBloodGroup?: BloodGroup;
  onSetTrackedRequestId?: (id: string) => void;
}

export const RequestBloodView: React.FC<RequestBloodViewProps> = ({
  setCurrentView,
  preselectedHospitalId,
  preselectedBloodGroup,
  onSetTrackedRequestId,
}) => {
  const { hospitals, addBloodRequest, currentUser } = useApp();

  const [patientName, setPatientName] = useState<string>(currentUser?.name || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(preselectedBloodGroup || 'O+');
  const [units, setUnits] = useState<number>(2);
  const [location, setLocation] = useState<string>(currentUser?.area ? `${currentUser.area}, ${currentUser.city}` : 'Downtown, San Francisco');
  const [city, setCity] = useState<string>(currentUser?.city || 'San Francisco');
  const [preferredHospitalId, setPreferredHospitalId] = useState<string>(preselectedHospitalId || hospitals[0]?.id || '');
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL');
  const [contactNumber, setContactNumber] = useState<string>(currentUser?.phone || '+1 (555) 234-5678');
  const [requiredDate, setRequiredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hospital = hospitals.find((h) => h.id === preferredHospitalId);

    const newReq = addBloodRequest({
      patientName,
      bloodGroup,
      units: Number(units),
      location,
      city,
      preferredHospitalId,
      preferredHospitalName: hospital?.name || 'Any Available Hospital',
      urgency,
      contactNumber,
      requiredDate,
      additionalNotes,
    });

    setSubmittedRequestId(newReq.id);
    if (onSetTrackedRequestId) {
      onSetTrackedRequestId(newReq.id);
    }
  };

  if (submittedRequestId) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                Request Dispatched Successfully
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                Blood Request Received
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Your request has been broadcasted to the designated hospital transfusion unit and queued in the Gemini AI donor matcher.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Unique Request ID:</span>
                <span className="font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {submittedRequestId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-800">{patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Blood Group & Units:</span>
                <span className="font-bold text-slate-800">{units} unit(s) of {bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Urgency Level:</span>
                <span className={`font-bold uppercase ${urgency === 'CRITICAL' ? 'text-red-600' : urgency === 'URGENT' ? 'text-amber-600' : 'text-slate-700'}`}>
                  {urgency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Initial Status:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                  REQUESTED (AI MATCHING)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setCurrentView('tracking')}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition"
              >
                <span>Track Request in Real-Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSubmittedRequestId(null);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
            <Droplet className="w-3.5 h-3.5 fill-rose-600" />
            <span>Patient Transfusion Coordination</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Request Blood
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Submit a standardized request for planned surgical procedures or clinical treatments. For life-threatening emergencies, switch to the Emergency Request channel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Patient Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              1. Patient & Transfusion Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Emma Watson"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group Required <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                >
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      Blood Group {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Units Required (Bags) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              2. Hospital Destination & Urgency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Hospital / Blood Center <span className="text-rose-500">*</span>
                </label>
                <select
                  value={preferredHospitalId}
                  onChange={(e) => setPreferredHospitalId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required By Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Location / Ward / Area
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ward 4B, 1200 Market St"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urgency Level <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NORMAL', 'URGENT', 'CRITICAL'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition uppercase ${
                        urgency === level
                          ? level === 'CRITICAL'
                            ? 'bg-red-600 text-white shadow-xs'
                            : level === 'URGENT'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Referral Notes / Doctor Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Patient scheduled for elective orthopedic surgery. Requires cross-matched whole blood."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Droplet className="w-4 h-4" />
              <span>Submit Blood Request</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Auto-generates unique tracking identifier and initiates hospital cross-match pipeline.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

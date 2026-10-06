import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS } from '../services/bloodCompatibility';
import { requestEmergencyAssistant } from '../services/geminiClient';
import { BloodGroup } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  Clock,
  Sparkles,
  Droplet,
  CheckCircle2,
  Building2,
  Navigation,
  ArrowRight,
  Activity,
} from 'lucide-react';

interface EmergencyViewProps {
  setCurrentView: (view: string) => void;
  onSetTrackedRequestId?: (id: string) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  setCurrentView,
  onSetTrackedRequestId,
}) => {
  const { hospitals, addEmergencyRequest, currentUser } = useApp();

  const [patientName, setPatientName] = useState<string>('Trauma Code Red Patient');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [units, setUnits] = useState<number>(3);
  const [hospital, setHospital] = useState<string>(hospitals[0]?.name || 'City Care Trauma Hospital');
  const [location, setLocation] = useState<string>('Emergency Bay 2, Medical District, SF');
  const [emergencyLevel, setEmergencyLevel] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('CRITICAL');
  const [contact, setContact] = useState<string>('+1 (555) 911-0021');
  const [additionalNotes, setAdditionalNotes] = useState<string>('Severe trauma patient requiring immediate universal uncrossmatched or crossmatched red blood cells.');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    triageSummary?: string;
    immediateActions?: string[];
    compatibleDonorGroups?: string[];
    estimatedResponseTime?: string;
    disclaimer?: string;
  } | null>(null);

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Call Gemini AI Emergency Assistant for automated triage
      const aiResult = await requestEmergencyAssistant({
        patientName,
        bloodGroup,
        units: Number(units),
        hospital,
        location,
        emergencyLevel,
        notes: additionalNotes,
      });

      // 2. Persist to system emergency queue
      const created = addEmergencyRequest({
        patientName,
        bloodGroup,
        units: Number(units),
        hospital,
        location,
        emergencyLevel,
        contact,
        additionalNotes,
      });

      setSubmittedData({
        id: created.id,
        triageSummary: aiResult.triageSummary,
        immediateActions: aiResult.immediateActions,
        compatibleDonorGroups: aiResult.compatibleDonorGroups,
        estimatedResponseTime: aiResult.estimatedResponseTime,
        disclaimer: aiResult.disclaimer,
      });

      if (onSetTrackedRequestId) {
        onSetTrackedRequestId(created.id);
      }
    } catch (err) {
      console.error('Emergency submission error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen py-10 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Emergency Header Strip */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border border-red-700/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldAlert className="w-48 h-48 text-red-500" />
          </div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>RAPID EMERGENCY PROTOCOL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Emergency Blood Request Channel
            </h1>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
              Instantly activates regional hospital blood banks, dispatches Gemini AI donor cross-match notifications, and queues high-priority transport logistics.
            </p>
          </div>
        </div>

        {/* Confirmation & AI Triage Output */}
        {submittedData ? (
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Emergency Alert Broadcast Active
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Incident ID: <strong className="text-red-400">{submittedData.id}</strong>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse">
                LEVEL 1 DISPATCH
              </span>
            </div>

            {/* Gemini AI Emergency Assistant Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Gemini AI Emergency Triage Summary
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Est. Response: <strong className="text-emerald-400">{submittedData.estimatedResponseTime}</strong>
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {submittedData.triageSummary}
              </p>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Automated Next System Actions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {submittedData.immediateActions?.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-md bg-purple-900/60 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 text-[11px] leading-tight">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900 text-xs">
                <span className="text-slate-400 text-[11px]">Compatible Donor Types:</span>
                {submittedData.compatibleDonorGroups?.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Mandatory Medical Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {submittedData.disclaimer ||
                    'AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals.'}
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setCurrentView('tracking')}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition"
              >
                <Activity className="w-4 h-4" />
                <span>Track Emergency Transit in Real-Time</span>
              </button>
              <button
                onClick={() => setSubmittedData(null)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
              >
                New Emergency Request
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form
            onSubmit={handleEmergencySubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Emergency Transfusion Specification
                </h3>
                <span className="text-[11px] text-slate-400">
                  Priority Dispatch Queue
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Patient Identifier / Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe / Trauma Bed 3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Blood Group Required <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm font-black focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg} {bg === 'O-' ? '(Universal Donor - High Priority)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Units Needed Immediately <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm font-black focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Emergency Severity Level <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['NORMAL', 'URGENT', 'CRITICAL'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEmergencyLevel(lvl)}
                        className={`py-2 px-1 rounded-xl text-xs font-extrabold uppercase transition ${
                          emergencyLevel === lvl
                            ? lvl === 'CRITICAL'
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse'
                              : lvl === 'URGENT'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Hospital Facility / Trauma Center <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Direct Emergency Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. +1 (555) 911-0021"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Location / Ward / ICU Room Details
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. ICU Bay 4, 742 Evergreen Terrace, Medical District"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Clinical Diagnosis / Incident Overview
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Severe internal hemorrhaging following acute vehicular trauma. Immediate transfusion authorization."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm shadow-xl shadow-red-600/50 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>{isSubmitting ? 'ANALYZING & BROADCASTING...' : 'DISPATCH CRITICAL EMERGENCY REQUEST'}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-3 text-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  Triggers Gemini AI emergency triage, queries nearest inventory, and alerts on-duty medical staff.
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

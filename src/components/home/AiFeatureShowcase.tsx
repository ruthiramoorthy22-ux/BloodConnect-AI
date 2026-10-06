import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  UserCheck,
} from 'lucide-react';

interface AiFeatureShowcaseProps {
  setCurrentView: (view: string) => void;
}

export const AiFeatureShowcase: React.FC<AiFeatureShowcaseProps> = ({ setCurrentView }) => {
  const [activeTab, setActiveTab] = useState<'matching' | 'demand' | 'emergency' | 'eligibility'>('matching');

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>GEMINI AI DECISION SUPPORT ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Intelligent Decision Support for Transfusion Logistics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Harnessing Google Gemini AI to assist blood bank officers, donors, and trauma coordinators with intelligent ranking, demand analytics, and automated emergency triage.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'matching'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" /> AI Donor Matching
          </button>

          <button
            onClick={() => setActiveTab('demand')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'demand'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Blood Demand Analysis
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'emergency'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" /> Emergency Assistant
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'eligibility'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Donor Eligibility
          </button>
        </div>

        {/* Active Tab Preview Card */}
        <div className="max-w-4xl mx-auto bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {activeTab === 'matching' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-rose-400" />
                    Multi-Factor Candidate Donor Ranking
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzes compatibility, distance, rest interval, and donation history
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('hospital-auth')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/40 transition flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Launch in Hospital Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sample output mockup */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Alex Rivera</span>
                      <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 text-[10px] font-extrabold">
                        O- Donor (Universal)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-bold">
                        Available
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Proximity: <strong>2.4 km</strong> • Safe rest interval: <strong>5.8 months</strong> • Lifetime donations: <strong>8</strong>
                    </p>
                    <p className="text-xs text-rose-200/90 font-medium">
                      Rationale: Compatible universal blood group with excellent donation cooldown and immediate radius proximity.
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Match Score</span>
                    <span className="text-3xl font-black text-emerald-400">96%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Robert Washington</span>
                      <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 text-[10px] font-extrabold">
                        O- Donor
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-bold">
                        Available
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Proximity: <strong>5.1 km</strong> • Safe rest interval: <strong>6.7 months</strong> • Lifetime donations: <strong>22</strong>
                    </p>
                    <p className="text-xs text-rose-200/90 font-medium">
                      Rationale: Veteran donor with consistent donation history and safe cooldown.
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Match Score</span>
                    <span className="text-3xl font-black text-emerald-400">91%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demand' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Predictive Inventory & Demand Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuously correlates request velocities with hospital reserve thresholds
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> High-Demand Inventory Warning
                </span>
                <p className="text-slate-200">
                  "Blood group O+ and O- currently have high request activity compared with available stock across the Civic Center medical corridor."
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-200 font-semibold">
                    Suggested Action: Trigger targeted notifications to 12 nearby O+ donors
                  </span>
                  <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-200 font-semibold">
                    Suggested Action: Reserve emergency units for Trauma Bay 1
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-400" />
                  Automated Emergency Triage Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Converts critical patient inputs into instant operational next steps
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-extrabold text-red-400 block mb-1">STEP 1</span>
                  <p className="font-bold text-white">Stock Locating</p>
                  <p className="text-slate-400 text-[11px] mt-1">Queries nearest hospitals holding verified reserve units</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-extrabold text-purple-400 block mb-1">STEP 2</span>
                  <p className="font-bold text-white">Donor Matching</p>
                  <p className="text-slate-400 text-[11px] mt-1">Filters compatible active voluntary donors within 10 km</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-extrabold text-blue-400 block mb-1">STEP 3</span>
                  <p className="font-bold text-white">Hospital Direct</p>
                  <p className="text-slate-400 text-[11px] mt-1">Alerts transfusion supervisor desk and ICU staff</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-extrabold text-emerald-400 block mb-1">STEP 4</span>
                  <p className="font-bold text-white">Live Tracking</p>
                  <p className="text-slate-400 text-[11px] mt-1">Real-time status updates from request to completion</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Preliminary Donor Health & Rest Interval Screening
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Helps prospective donors verify readiness before traveling to a donation center
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Safe Rest Interval Calculator
                </span>
                <p className="text-slate-200">
                  Whole blood donation requires a minimum 90-day (3-month) interval between donations. The AI assistant validates health conditions, weight (&gt;50kg), and preparation advice.
                </p>
                <button
                  onClick={() => setCurrentView('donor')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 transition"
                >
                  <span>Test Your Eligibility in Donor Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Mandatory Medical Disclaimer Banner */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical Decision Support Notice:</strong> "AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

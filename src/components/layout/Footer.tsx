import React from 'react';
import { Droplet, Heart, PhoneCall, ShieldCheck, MapPin, Sparkles, AlertTriangle } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Emergency Helpline Strip */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-b border-red-800/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            <span>24/7 NATIONAL EMERGENCY BLOOD HELPLINES:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-rose-100">
            <a href="tel:911" className="flex items-center gap-1 hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency: <strong>911 / 108</strong>
            </a>
            <span className="hidden sm:inline opacity-40">•</span>
            <a href="tel:104" className="flex items-center gap-1 hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5" /> Blood Bank Directory: <strong>104 / 1910</strong>
            </a>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="text-rose-200">Red Cross Dispatch: <strong>1-800-RED-CROSS</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  BLOOD<span className="text-rose-500">CONNECT</span> <span className="text-xs text-rose-400 font-mono">AI</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Connecting Blood. Saving Lives.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered smart donor matching, live hospital blood inventory locator, and rapid emergency transfusion management platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Compliant Privacy Standards</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('availability')}
                  className="hover:text-rose-400 transition"
                >
                  Blood Stock Availability
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('hospitals')}
                  className="hover:text-rose-400 transition"
                >
                  Nearby Hospitals on Google Maps
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('request')}
                  className="hover:text-rose-400 transition"
                >
                  Submit Blood Request
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('emergency')}
                  className="text-red-400 font-semibold hover:text-red-300 transition"
                >
                  Emergency Blood Alert
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('donors-list')}
                  className="text-rose-400 font-semibold hover:text-rose-300 transition"
                >
                  Donor Registry & Lab Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('donor')}
                  className="hover:text-rose-400 transition"
                >
                  Become a Blood Donor
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('user-auth')}
                  className="hover:text-rose-400 transition"
                >
                  Public User Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('tracking')}
                  className="hover:text-rose-400 transition"
                >
                  Track Request Status
                </button>
              </li>
            </ul>
          </div>

          {/* AI Decision Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Gemini Multi-Factor Donor Compatibility</li>
              <li>• Automated Hospital Demand Analysis</li>
              <li>• Emergency Triage Action Recommender</li>
              <li>• Preliminary Donor Health Screening</li>
              <li>• Distance-Weighted Geospatial Dispatch</li>
            </ul>
          </div>

          {/* Hospital & Institutional */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hospitals & Centers</h4>
            <p className="text-xs text-slate-400">
              Authorized hospitals and certified blood banks can access stock management and live AI matching via the institutional portal.
            </p>
            <button
              onClick={() => setCurrentView('hospital-auth')}
              className="mt-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition"
            >
              Hospital Portal Login
            </button>
          </div>
        </div>

        {/* Mandatory Medical Disclaimer */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-start gap-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical Decision Support Disclaimer:</strong> "AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals."
              BloodConnect AI facilitates connection and decision support. Actual compatibility, cross-matching, and donor qualification require certified clinical laboratory testing.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} BloodConnect AI. College PBL Production Project. Built with Google AI Studio & Google Maps Platform.</p>
            <p className="text-slate-400">Donor Location Safety: Exact GPS coordinates protected.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

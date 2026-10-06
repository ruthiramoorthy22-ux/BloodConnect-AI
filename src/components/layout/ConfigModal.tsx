import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Key, MapPin, Database, Cpu, ExternalLink, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConfigStatus {
  hasGeminiKey: boolean;
  geminiModel: string;
  hasGoogleMapsKey: boolean;
  isDemoKey: boolean;
  firebaseConfigured: boolean;
}

export const ConfigModal: React.FC = () => {
  const { isConfigModalOpen, setConfigModalOpen, isDemoMode, toggleDemoMode } = useApp();
  const [status, setStatus] = useState<ConfigStatus>({
    hasGeminiKey: true,
    geminiModel: 'gemini-3.8-flash',
    hasGoogleMapsKey: true,
    isDemoKey: true,
    firebaseConfigured: false,
  });
  const [activeTab, setActiveTab] = useState<'status' | 'gemini' | 'maps' | 'firebase'>('status');

  useEffect(() => {
    if (isConfigModalOpen) {
      fetch('/api/config-status')
        .then((res) => res.json())
        .then((data) => setStatus(data))
        .catch(() => {});
    }
  }, [isConfigModalOpen]);

  if (!isConfigModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">System Architecture & API Setup Guide</h2>
              <p className="text-xs text-rose-200/80">Configure Google Cloud, Gemini AI, Google Maps & Firebase</p>
            </div>
          </div>
          <button
            onClick={() => setConfigModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 border-b-2 rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-rose-600 text-rose-600 bg-white font-semibold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" /> Live Status
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-4 py-2.5 border-b-2 rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'gemini'
                ? 'border-rose-600 text-rose-600 bg-white font-semibold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" /> Gemini AI
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`px-4 py-2.5 border-b-2 rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'maps'
                ? 'border-rose-600 text-rose-600 bg-white font-semibold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" /> Google Maps
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-2.5 border-b-2 rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'firebase'
                ? 'border-rose-600 text-rose-600 bg-white font-semibold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" /> Firebase
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-purple-600" /> Gemini API
                    </span>
                    {status.hasGeminiKey ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Fallback Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Model: {status.geminiModel}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Powers donor matching, demand analysis, emergency assistant & screening.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" /> Google Maps
                    </span>
                    {status.hasGoogleMapsKey ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
                        Missing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Status: {status.isDemoKey ? 'Starter Demo Tier' : 'Production Key'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Interactive hospital map, marker navigation, and distance matrix.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-amber-600" /> Storage Engine
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                      Active (Synced)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Mode: {isDemoMode ? 'Interactive Demo Dataset' : 'Production Live Mode'}
                  </p>
                  <button
                    onClick={toggleDemoMode}
                    className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 underline text-left"
                  >
                    Toggle {isDemoMode ? 'to Live Mode' : 'to Demo Mode'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-rose-700">Medical Decision Support Notice</h4>
                <p className="text-xs leading-relaxed">
                  "AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals."
                  BloodConnect AI is engineered strictly for decision support and emergency coordination, without making independent medical diagnosis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Donor Privacy Protection</h4>
                <p className="text-xs text-slate-600">
                  Exact donor GPS coordinates and residential street addresses are strictly hidden from public views. Only approximate regional areas and calculated distance radii are exposed to protect citizen safety.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Configuring Google Gemini AI API</h3>
              <ol className="list-decimal pl-5 space-y-2.5 text-xs text-slate-600">
                <li>
                  Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline font-semibold">Google AI Studio (aistudio.google.com)</a>.
                </li>
                <li>Sign in with your Google Account and click <strong>Create API Key</strong>.</li>
                <li>Copy your key and configure it in your environment:</li>
              </ol>

              <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto">
                <p className="text-slate-400"># In .env or AI Studio Secrets</p>
                <p className="text-rose-400">GEMINI_API_KEY="AIzaSyYourGeneratedSecretKey"</p>
                <p className="text-rose-400">GEMINI_MODEL="gemini-3.8-flash"</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <strong>Zero-Exposure Architecture:</strong> All Gemini calls are executed through server-side endpoints (<code className="bg-amber-100 px-1 py-0.5 rounded">/api/gemini/*</code>) using the official <code className="bg-amber-100 px-1 py-0.5 rounded">@google/genai</code> SDK. Your API key is NEVER bundled into client-side javascript!
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Configuring Google Maps Platform</h3>
              <ol className="list-decimal pl-5 space-y-2.5 text-xs text-slate-600">
                <li>
                  Open <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline font-semibold">Google Cloud Console</a> and select or create a Project.
                </li>
                <li>
                  Navigate to <strong>APIs & Services &gt; Library</strong> and enable:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Maps JavaScript API</strong> (Required for interactive map & markers)</li>
                    <li><strong>Places API (New)</strong> (Required for hospital and blood bank search)</li>
                    <li><strong>Routes API</strong> (Turn-by-turn routing and emergency distance calculation)</li>
                    <li><strong>Geocoding API</strong> (Address to coordinates lookup)</li>
                  </ul>
                </li>
                <li>
                  Go to <strong>Credentials</strong>, click <strong>Create Credentials &gt; API Key</strong>.
                </li>
                <li>
                  <strong>Restrict your API key</strong> for security:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Set Application Restrictions to <em>HTTP referrers (web sites)</em> and add your domain.</li>
                    <li>Set API Restrictions to designate only Maps JavaScript API, Places API, and Routes API.</li>
                  </ul>
                </li>
              </ol>

              <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto">
                <p className="text-slate-400"># In .env</p>
                <p className="text-blue-400">VITE_GOOGLE_MAPS_API_KEY="YOUR_RESTRICTED_GOOGLE_MAPS_KEY"</p>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Configuring Firebase Firestore & Auth</h3>
              <p className="text-xs text-slate-600">
                The application features an intelligent dual-mode engine: it automatically boots with an active, realistic mock dataset with local persistence, and seamlessly synchronizes with Firebase when project credentials are provided.
              </p>

              <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600">
                <li>Create a project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline font-semibold">Firebase Console</a>.</li>
                <li>Enable <strong>Firebase Authentication</strong> (Email/Password provider).</li>
                <li>Create a <strong>Cloud Firestore</strong> database in production mode.</li>
                <li>Register a Web App in Firebase Project Settings and paste the keys into your <code className="bg-slate-100 px-1">.env</code>:</li>
              </ol>

              <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto space-y-1">
                <p className="text-slate-400"># Firebase Config in .env</p>
                <p className="text-amber-400">VITE_FIREBASE_API_KEY="AIzaSy..."</p>
                <p className="text-amber-400">VITE_FIREBASE_AUTH_DOMAIN="my-project.firebaseapp.com"</p>
                <p className="text-amber-400">VITE_FIREBASE_PROJECT_ID="my-project"</p>
                <p className="text-amber-400">VITE_FIREBASE_STORAGE_BUCKET="my-project.appspot.com"</p>
              </div>

              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                <strong>Collections Structured:</strong> <code className="text-rose-600 font-medium">users</code>, <code className="text-rose-600 font-medium">hospitals</code>, <code className="text-rose-600 font-medium">bloodStock</code>, <code className="text-rose-600 font-medium">bloodRequests</code>, <code className="text-rose-600 font-medium">emergencyRequests</code>, <code className="text-rose-600 font-medium">notifications</code>.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            BloodConnect AI • Decision Support & Healthcare Logistics
          </span>
          <button
            onClick={() => setConfigModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

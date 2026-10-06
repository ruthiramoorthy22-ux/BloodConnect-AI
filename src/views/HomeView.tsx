import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorks } from '../components/home/HowItWorks';
import { BloodQuickLookup } from '../components/home/BloodQuickLookup';
import { AiFeatureShowcase } from '../components/home/AiFeatureShowcase';
import { EmergencyCallout } from '../components/home/EmergencyCallout';
import { FaqSection } from '../components/home/FaqSection';
import { HospitalMap } from '../components/maps/HospitalMap';
import { useApp } from '../context/AppContext';
import { BloodGroup } from '../types';
import { MapPin, ArrowRight, Users, FileText, AlertTriangle, Clock, ShieldCheck, Heart, Building2 } from 'lucide-react';

interface HomeViewProps {
  setCurrentView: (view: string) => void;
  setSelectedBloodFilter?: (group: BloodGroup) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setCurrentView,
  setSelectedBloodFilter,
}) => {
  const { hospitals, donors } = useApp();

  const handleSearchBlood = (group: BloodGroup, city: string) => {
    if (setSelectedBloodFilter) {
      setSelectedBloodFilter(group);
    }
    setCurrentView('availability');
  };

  return (
    <div className="space-y-0">
      <HeroSection
        onSearchBlood={handleSearchBlood}
        setCurrentView={setCurrentView}
      />

      <BloodQuickLookup
        onSelectGroup={(g) => handleSearchBlood(g, '')}
        setCurrentView={setCurrentView}
      />

      {/* Featured Blood Donor Directory & Clinical Safety Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5 text-rose-600" />
                <span>Verified Lifesavers & Clinical Reports</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Blood Donor Registry & Eligibility Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Browse verified voluntary donors with statutory age limit criteria (18–65 yrs), disqualified health conditions, and certified 5-panel clinical lab screening reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setCurrentView('donors-list')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/30 transition"
              >
                <Users className="w-4 h-4" />
                <span>View All Donors & Reports ({donors.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('donor')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Become a Donor</span>
              </button>
            </div>
          </div>

          {/* 3 Interactive Highlight Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: Age Limit */}
            <div
              onClick={() => setCurrentView('donors-list')}
              className="p-6 rounded-3xl bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 transition cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                  Statutory Regulations
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-rose-600 transition">
                  Age Limits (18 to 65 Years)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Minors under 18 years are legally non-eligible. Donors aged 18 to 65 years with weight &ge; 50 kg qualify for standard voluntary whole blood collection.
              </p>
              <span className="inline-flex items-center text-xs font-bold text-blue-700 group-hover:underline gap-1">
                View Age-Filtered Donors &rarr;
              </span>
            </div>

            {/* Pillar 2: Diseases Not Eligible */}
            <div
              onClick={() => setCurrentView('donors-list')}
              className="p-6 rounded-3xl bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 transition cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">
                  Safety Protocols
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-rose-600 transition">
                  Diseases Not Eligible
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permanent deferrals include HIV, Hepatitis B/C, cardiac disease, and severe asthma. Temporary deferrals cover tattoos (6 mo), surgery, pregnancy, and active infections.
              </p>
              <span className="inline-flex items-center text-xs font-bold text-red-700 group-hover:underline gap-1">
                View Medical Exclusion Guide &rarr;
              </span>
            </div>

            {/* Pillar 3: Clinical Test Reports */}
            <div
              onClick={() => setCurrentView('donors-list')}
              className="p-6 rounded-3xl bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 transition cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                  Pathologist Certified
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-rose-600 transition">
                  Clinical Laboratory Test Reports
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each registered donor profile features complete hemodynamic stats (Hemoglobin &ge; 12.5 g/dL, BP, Pulse) and mandatory 5-panel infectious disease serology screenings.
              </p>
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 group-hover:underline gap-1">
                Inspect Official Test Reports &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Map Preview Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">
                Live Geospatial Network
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                Find Nearby Hospital Blood Banks
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Explore connected medical facilities on Google Maps with real-time stock and routing.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('hospitals')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition self-start md:self-auto"
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Full Screen Hospital Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <HospitalMap
            hospitals={hospitals}
            onRequestBloodFromHospital={(h) => {
              setCurrentView('request');
            }}
          />
        </div>
      </section>

      <HowItWorks />

      <AiFeatureShowcase setCurrentView={setCurrentView} />

      <EmergencyCallout
        onTriggerEmergency={() => setCurrentView('emergency')}
        onBecomeDonor={() => setCurrentView('donor')}
      />

      <FaqSection />
    </div>
  );
};

import React from 'react';
import { Search, Sparkles, Building2, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit Blood Request',
      desc: 'Patients or medical attendants submit normal or emergency blood requirements with units and hospital destination.',
      icon: Search,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      num: '02',
      title: 'Gemini AI Smart Matching',
      desc: 'Gemini AI evaluates compatible donors, proximity, rest intervals, and live hospital stock to score prospective lifesavers.',
      icon: Sparkles,
      color: 'from-purple-600 to-rose-700',
    },
    {
      num: '03',
      title: 'Hospital Verification',
      desc: 'Designated hospital transfusion center verifies inventory or alerts matched voluntary donors for immediate cross-match.',
      icon: Building2,
      color: 'from-amber-600 to-orange-700',
    },
    {
      num: '04',
      title: 'Tracked Rapid Transfusion',
      desc: 'Blood units or donor dispatch are tracked milestone-by-milestone until transfusion is completed safely.',
      icon: CheckCircle,
      color: 'from-emerald-600 to-teal-700',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">
            System Workflow
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            How BloodConnect AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A reliable 4-step pipeline combining clinical standards with intelligent decision support and precision Google Maps navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200">{s.num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

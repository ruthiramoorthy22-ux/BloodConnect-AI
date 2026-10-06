import React from 'react';
import { ShieldAlert, PhoneCall, Clock, ArrowRight, Heart } from 'lucide-react';

interface EmergencyCalloutProps {
  onTriggerEmergency: () => void;
  onBecomeDonor: () => void;
}

export const EmergencyCallout: React.FC<EmergencyCalloutProps> = ({
  onTriggerEmergency,
  onBecomeDonor,
}) => {
  return (
    <section className="py-12 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Priority Response Channel</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Facing an Immediate Transfusion Emergency?
            </h2>
            <p className="text-sm text-rose-100 max-w-xl leading-relaxed">
              Our automated emergency dispatch broadcasts instant alerts to all regional hospital blood banks and nearby verified voluntary donors within seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onTriggerEmergency}
              className="px-6 py-3.5 rounded-2xl bg-white text-red-700 hover:bg-rose-50 font-black text-sm shadow-xl flex items-center gap-2 transition active:scale-95"
            >
              <ShieldAlert className="w-5 h-5 text-red-600" />
              CREATE EMERGENCY REQUEST
            </button>

            <button
              onClick={onBecomeDonor}
              className="px-6 py-3.5 rounded-2xl bg-red-950/40 hover:bg-red-950/60 text-white font-bold text-sm border border-white/25 flex items-center gap-2 transition"
            >
              <Heart className="w-5 h-5 text-rose-300" />
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

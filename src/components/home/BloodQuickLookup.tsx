import React from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_BLOOD_GROUPS, COMPATIBLE_DONORS_MAP } from '../../services/bloodCompatibility';
import { BloodGroup } from '../../types';
import { Droplet, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface BloodQuickLookupProps {
  onSelectGroup: (group: BloodGroup) => void;
  setCurrentView: (view: string) => void;
}

export const BloodQuickLookup: React.FC<BloodQuickLookupProps> = ({
  onSelectGroup,
  setCurrentView,
}) => {
  const { bloodStock } = useApp();

  const getGroupStats = (group: BloodGroup) => {
    const matching = bloodStock.filter((s) => s.bloodGroup === group);
    const units = matching.reduce((sum, item) => sum + item.units, 0);
    const hospitalCount = matching.filter((s) => s.units > 0).length;
    const criticalThreshold = matching.reduce((sum, item) => sum + item.criticalLevel, 0);

    let status: 'AVAILABLE' | 'LOW STOCK' | 'CRITICAL' | 'NOT AVAILABLE' = 'AVAILABLE';
    if (units === 0) status = 'NOT AVAILABLE';
    else if (units <= criticalThreshold * 0.5) status = 'CRITICAL';
    else if (units <= criticalThreshold) status = 'LOW STOCK';

    return { units, hospitalCount, status };
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">
              Live Network Inventory
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Current Blood Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Real-time stock counts across 24/7 verified hospital blood banks.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('availability')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition self-start md:self-auto"
          >
            <span>View Full Inventory Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 8 Blood Groups Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {ALL_BLOOD_GROUPS.map((group) => {
            const { units, hospitalCount, status } = getGroupStats(group);

            const isCritical = status === 'CRITICAL' || status === 'NOT AVAILABLE';
            const isLow = status === 'LOW STOCK';

            return (
              <div
                key={group}
                onClick={() => onSelectGroup(group)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-xs ${
                  isCritical
                    ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                    : isLow
                    ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-rose-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black text-slate-900">{group}</span>
                    <Droplet
                      className={`w-4 h-4 ${
                        isCritical
                          ? 'text-red-600 fill-red-600'
                          : isLow
                          ? 'text-amber-600 fill-amber-600'
                          : 'text-rose-600 fill-rose-600'
                      }`}
                    />
                  </div>

                  <p className="text-lg font-black text-slate-900 leading-tight">
                    {units} <span className="text-xs font-normal text-slate-500">units</span>
                  </p>

                  <p className="text-[10px] text-slate-500 mt-0.5">
                    in {hospitalCount} hospital{hospitalCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60">
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isCritical
                        ? 'bg-red-600 text-white'
                        : isLow
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>O- (Universal Donor) & B-</strong> inventories are experiencing high surgical demand in regional trauma centers.
            </span>
          </div>
          <button
            onClick={() => setCurrentView('request')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 transition"
          >
            Create Request Now
          </button>
        </div>
      </div>
    </section>
  );
};

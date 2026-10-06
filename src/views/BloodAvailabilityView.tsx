import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS, COMPATIBLE_DONORS_MAP, CAN_DONATE_TO_MAP } from '../services/bloodCompatibility';
import { BloodGroup, BloodStockItem } from '../types';
import {
  Droplet,
  Search,
  Filter,
  Building2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface BloodAvailabilityViewProps {
  setCurrentView: (view: string) => void;
  initialBloodFilter?: BloodGroup | null;
  onSelectHospitalForRequest?: (hospitalId: string, bloodGroup: BloodGroup) => void;
}

export const BloodAvailabilityView: React.FC<BloodAvailabilityViewProps> = ({
  setCurrentView,
  initialBloodFilter,
  onSelectHospitalForRequest,
}) => {
  const { bloodStock, hospitals } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>(initialBloodFilter || 'ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Unique cities from hospitals
  const cities = useMemo(() => {
    const set = new Set(hospitals.map((h) => h.city));
    return Array.from(set);
  }, [hospitals]);

  // Group summary metrics
  const groupMetrics = useMemo(() => {
    return ALL_BLOOD_GROUPS.map((bg) => {
      const items = bloodStock.filter((s) => s.bloodGroup === bg);
      const units = items.reduce((sum, s) => sum + s.units, 0);
      const reserved = items.reduce((sum, s) => sum + s.reservedUnits, 0);
      const criticalThreshold = items.reduce((sum, s) => sum + s.criticalLevel, 0);
      const hospitalCount = items.filter((s) => s.units > 0).length;

      let status: 'AVAILABLE' | 'LOW STOCK' | 'CRITICAL' | 'NOT AVAILABLE' = 'AVAILABLE';
      if (units === 0) status = 'NOT AVAILABLE';
      else if (units <= criticalThreshold * 0.5) status = 'CRITICAL';
      else if (units <= criticalThreshold) status = 'LOW STOCK';

      let demand: 'NORMAL' | 'HIGH' | 'EXTREME' = 'NORMAL';
      if (bg === 'O-' || bg === 'O+' || status === 'CRITICAL') demand = 'EXTREME';
      else if (status === 'LOW STOCK' || bg === 'B-') demand = 'HIGH';

      return {
        bloodGroup: bg,
        units,
        reserved,
        hospitalCount,
        status,
        demand,
      };
    });
  }, [bloodStock]);

  // Filtered detailed items
  const filteredStock = useMemo(() => {
    return bloodStock.filter((item) => {
      if (selectedGroup !== 'ALL' && item.bloodGroup !== selectedGroup) return false;

      const hospital = hospitals.find((h) => h.id === item.hospitalId);
      if (selectedCity !== 'ALL' && hospital?.city !== selectedCity) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesHospital = item.hospitalName.toLowerCase().includes(query);
        const matchesGroup = item.bloodGroup.toLowerCase().includes(query);
        const matchesCity = hospital?.city.toLowerCase().includes(query);
        if (!matchesHospital && !matchesGroup && !matchesCity) return false;
      }

      if (statusFilter !== 'ALL') {
        const itemStatus =
          item.units === 0
            ? 'NOT AVAILABLE'
            : item.units <= item.criticalLevel * 0.5
            ? 'CRITICAL'
            : item.units <= item.criticalLevel
            ? 'LOW STOCK'
            : 'AVAILABLE';
        if (itemStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [bloodStock, hospitals, selectedGroup, selectedCity, searchQuery, statusFilter]);

  const handleRequestClick = (item: BloodStockItem) => {
    if (onSelectHospitalForRequest) {
      onSelectHospitalForRequest(item.hospitalId, item.bloodGroup);
    }
    setCurrentView('request');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
              <Droplet className="w-3.5 h-3.5 fill-rose-600" />
              <span>Real-Time Transfusion Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Blood Stock Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Live database of verified whole blood and red blood cell reserves across connected hospitals and regional blood centers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('request')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 transition"
            >
              <Droplet className="w-4 h-4" />
              Request Blood
            </button>
            <button
              onClick={() => setCurrentView('emergency')}
              className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs shadow-md shadow-red-700/30 transition animate-pulse"
            >
              Emergency Mode
            </button>
          </div>
        </div>

        {/* 8 Blood Groups Status Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {groupMetrics.map((g) => {
            const isSelected = selectedGroup === g.bloodGroup;
            const isCritical = g.status === 'CRITICAL' || g.status === 'NOT AVAILABLE';
            const isLow = g.status === 'LOW STOCK';

            return (
              <div
                key={g.bloodGroup}
                onClick={() => setSelectedGroup(isSelected ? 'ALL' : g.bloodGroup)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-rose-600 border-rose-600 bg-rose-50/70 shadow-md'
                    : isCritical
                    ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                    : isLow
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{g.bloodGroup}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        g.demand === 'EXTREME'
                          ? 'bg-red-600 text-white'
                          : g.demand === 'HIGH'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {g.demand}
                    </span>
                  </div>

                  <p className="text-lg font-black text-slate-900 mt-2">
                    {g.units} <span className="text-[10px] font-normal text-slate-500">units</span>
                  </p>
                  <p className="text-[10px] text-slate-500">{g.hospitalCount} hospitals</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-bold ${
                      isCritical
                        ? 'text-red-700'
                        : isLow
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {g.status}
                  </span>
                  {isSelected && <span className="text-[9px] text-rose-600 font-bold">Filtered</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Filter className="w-4 h-4 text-rose-600" />
              <span>Filters & Inventory Search</span>
            </div>

            {(selectedGroup !== 'ALL' || selectedCity !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGroup('ALL');
                  setSelectedCity('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospital or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            {/* Blood group dropdown */}
            <div>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-semibold text-slate-800"
              >
                <option value="ALL">All Blood Groups</option>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    Blood Group {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* City dropdown */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-semibold text-slate-800"
              >
                <option value="ALL">All Cities ({cities.length})</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status dropdown */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-semibold text-slate-800"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="LOW STOCK">Low Stock</option>
                <option value="CRITICAL">Critical Reserve</option>
                <option value="NOT AVAILABLE">Not Available (0 units)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hospital Inventory Detailed Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Hospital Inventory Records ({filteredStock.length} items found)
            </span>
            <span className="text-[11px] text-slate-500">
              Auto-refreshed with real-time Firestore sync
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-6">Hospital & Center</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4 text-center">Available Units</th>
                  <th className="py-3.5 px-4 text-center">Reserved Units</th>
                  <th className="py-3.5 px-4">Threshold & Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No blood stock records match your selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((item) => {
                    const hospital = hospitals.find((h) => h.id === item.hospitalId);
                    const isCritical = item.units <= item.criticalLevel * 0.5 || item.units === 0;
                    const isLow = item.units <= item.criticalLevel && !isCritical;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {item.hospitalName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {hospital?.address}, {hospital?.city}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-xs inline-block">
                            {item.bloodGroup}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="text-base font-black text-slate-900">
                            {item.units}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                            {item.reservedUnits}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                              item.units === 0
                                ? 'bg-slate-200 text-slate-700'
                                : isCritical
                                ? 'bg-red-600 text-white'
                                : isLow
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.units === 0
                              ? 'Out of Stock'
                              : isCritical
                              ? 'Critical'
                              : isLow
                              ? 'Low Reserve'
                              : 'Available'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Safe limit: &gt;{item.criticalLevel}u
                          </span>
                        </td>

                        <td className="py-4 px-4 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleRequestClick(item)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition inline-flex items-center gap-1"
                          >
                            <Droplet className="w-3 h-3" />
                            <span>Request</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compatibility Reference Drawer */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Standard Red Blood Cell Transfusion Compatibility Reference
          </h3>
          <p className="text-xs text-slate-600">
            Whole blood & packed red blood cells compatibility rules enforced by BloodConnect AI during donor matching and request routing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {ALL_BLOOD_GROUPS.map((bg) => (
              <div key={bg} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">{bg} Recipient:</span>
                <div className="mt-1 text-[11px] text-slate-600">
                  <span className="text-slate-400">Can receive from: </span>
                  <strong className="text-rose-700">{COMPATIBLE_DONORS_MAP[bg].join(', ')}</strong>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600">
                  <span className="text-slate-400">Can donate to: </span>
                  <strong className="text-blue-700">{CAN_DONATE_TO_MAP[bg].join(', ')}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

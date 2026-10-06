import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HospitalMap } from '../components/maps/HospitalMap';
import { calculateDistanceKm, formatDistance } from '../services/distance';
import { Hospital } from '../types';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Compass,
  Search,
  CheckCircle2,
  Navigation,
  Droplet,
  ExternalLink,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface NearbyHospitalsViewProps {
  setCurrentView: (view: string) => void;
  onRequestBloodFromHospital?: (hospital: Hospital) => void;
}

export const NearbyHospitalsView: React.FC<NearbyHospitalsViewProps> = ({
  setCurrentView,
  onRequestBloodFromHospital,
}) => {
  const { hospitals, userLocation, requestUserLocation, bloodStock } = useApp();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(hospitals[0] || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [is24x7Only, setIs24x7Only] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const handleLocate = async () => {
    setIsLocating(true);
    await requestUserLocation();
    setIsLocating(false);
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (typeFilter !== 'ALL' && h.type !== typeFilter) return false;
      if (is24x7Only && !h.is24x7) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesArea = h.area.toLowerCase().includes(q);
        const matchesCity = h.city.toLowerCase().includes(q);
        const matchesType = h.type.toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesCity && !matchesType) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!userLocation) return 0;
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distA - distB;
    });
  }, [hospitals, typeFilter, is24x7Only, searchQuery, userLocation]);

  const selectedHospitalStock = useMemo(() => {
    if (!selectedHospital) return [];
    return bloodStock.filter((s) => s.hospitalId === selectedHospital.id && s.units > 0);
  }, [selectedHospital, bloodStock]);

  const handleDirections = (h: Hospital) => {
    const dest = encodeURIComponent(`${h.name}, ${h.address}, ${h.city}`);
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Maps Platform Integration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hospital & Blood Bank Locator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Locate authorized hospital transfusion departments, 24/7 blood banks, and trauma centers with turn-by-turn driving directions and live unit availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLocate}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <Compass className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Update My Location'}</span>
            </button>
            <button
              onClick={() => setCurrentView('request')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 transition"
            >
              <Droplet className="w-4 h-4" />
              Request Blood
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital name, type (e.g., Trauma Center), or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none"
          >
            <option value="ALL">All Hospital Types</option>
            <option value="Trauma Center">Trauma Centers</option>
            <option value="Super Specialty">Super Specialty Hospitals</option>
            <option value="Blood Bank & Transfusion">Dedicated Blood Banks</option>
            <option value="General Hospital">General Hospitals</option>
            <option value="Government Medical Center">Government Medical Centers</option>
          </select>

          <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer px-2">
            <input
              type="checkbox"
              checked={is24x7Only}
              onChange={(e) => setIs24x7Only(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <span>24/7 Transfusion Only</span>
          </label>
        </div>

        {/* Main Split Layout: Map on top/left, Hospital Cards on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          <div className="lg:col-span-7 space-y-4">
            <HospitalMap
              hospitals={filteredHospitals}
              selectedHospitalId={selectedHospital?.id}
              onSelectHospital={(h) => setSelectedHospital(h)}
              onRequestBloodFromHospital={(h) => {
                if (onRequestBloodFromHospital) onRequestBloodFromHospital(h);
                setCurrentView('request');
              }}
            />

            {/* Selected Hospital Detailed Card */}
            {selectedHospital && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">
                        {selectedHospital.name}
                      </h2>
                      {selectedHospital.verified && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {selectedHospital.address}, {selectedHospital.area}, {selectedHospital.city} - {selectedHospital.pincode}
                    </p>
                  </div>

                  {userLocation && (
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance From You</span>
                      <span className="text-xl font-black text-rose-600">
                        {formatDistance(
                          calculateDistanceKm(
                            userLocation.lat,
                            userLocation.lng,
                            selectedHospital.latitude,
                            selectedHospital.longitude
                          )
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">General Desk</span>
                      <a href={`tel:${selectedHospital.phone}`} className="font-bold hover:text-rose-600">
                        {selectedHospital.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Emergency Blood Line</span>
                      <a href={`tel:${selectedHospital.emergencyContact}`} className="font-bold text-red-600 hover:text-red-700">
                        {selectedHospital.emergencyContact}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Operating Hours</span>
                      <span className="font-semibold">{selectedHospital.operatingHours || '24/7 Emergency Transfusion'}</span>
                    </div>
                  </div>
                </div>

                {/* Available Blood in this Hospital */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Available Blood Units at This Facility:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedHospitalStock.length > 0 ? (
                      selectedHospitalStock.map((s) => (
                        <div
                          key={s.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2"
                        >
                          <span className="text-xs font-black text-rose-800">{s.bloodGroup}</span>
                          <span className="text-xs font-bold text-slate-700">{s.units} units</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No active stock reported for this center. Contact desk for immediate cross-match.
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleDirections(selectedHospital)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Navigation className="w-4 h-4 text-blue-400" />
                    <span>Get Google Maps Directions</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onRequestBloodFromHospital) onRequestBloodFromHospital(selectedHospital);
                      setCurrentView('request');
                    }}
                    className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-rose-600/30"
                  >
                    <Droplet className="w-4 h-4" />
                    <span>Request Blood Here</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hospitals List Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hospital Facilities ({filteredHospitals.length})
              </span>
              <span className="text-[11px] text-slate-400">Sorted by distance</span>
            </div>

            <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
              {filteredHospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id;
                const dist = userLocation
                  ? calculateDistanceKm(userLocation.lat, userLocation.lng, h.latitude, h.longitude)
                  : null;

                const stockCount = bloodStock
                  .filter((s) => s.hospitalId === h.id)
                  .reduce((sum, s) => sum + s.units, 0);

                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHospital(h)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-white shadow-md ring-2 ring-rose-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{h.name}</span>
                          {h.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{h.area}, {h.city}</p>
                      </div>

                      {dist !== null && (
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg shrink-0">
                          {formatDistance(dist)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-rose-500" />
                        <strong>{stockCount} units</strong> in stock
                      </span>

                      <div className="flex items-center gap-2">
                        {h.is24x7 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            24/7
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Regular</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirections(h);
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-blue-600" /> Directions
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

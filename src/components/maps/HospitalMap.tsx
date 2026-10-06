// Source: Google Maps Platform Code Assist
import React, { useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Hospital, BloodStockItem, BloodGroup } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateDistanceKm, formatDistance } from '../../services/distance';
import { MapPin, Phone, AlertCircle, Compass, ExternalLink, Navigation, Building2, Droplet, Clock, CheckCircle2 } from 'lucide-react';

interface HospitalMapProps {
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  onRequestBloodFromHospital?: (hospital: Hospital) => void;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  onRequestBloodFromHospital,
}) => {
  const { mapsApiKey, userLocation, requestUserLocation, bloodStock } = useApp();
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);

  // Filter hospitals by radius and search query
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (userLocation) {
        const dist = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          h.latitude,
          h.longitude
        );
        return dist <= radiusKm;
      }

      return true;
    });
  }, [hospitals, searchQuery, userLocation, radiusKm]);

  // Compute available blood groups for active hospital from blood stock
  const activeHospitalStock = useMemo(() => {
    if (!activeHospital) return [];
    return bloodStock.filter(
      (s) => s.hospitalId === activeHospital.id && s.units > 0
    );
  }, [activeHospital, bloodStock]);

  const handleLocateMe = async () => {
    setIsLocating(true);
    await requestUserLocation();
    setIsLocating(false);
  };

  const openGoogleMapsDirections = (h: Hospital) => {
    const dest = encodeURIComponent(`${h.name}, ${h.address}, ${h.city}`);
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (mapError || !mapsApiKey) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Map service unavailable</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Please check your Google Maps Platform configuration or review the API Setup Guide in the top bar.
        </p>
      </div>
    );
  }

  const defaultCenter = userLocation || { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="relative w-full h-[550px] lg:h-[620px] rounded-2xl overflow-hidden border border-slate-200 shadow-md flex flex-col">
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-2 flex items-center gap-2 pointer-events-auto flex-1 max-w-sm">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Search hospitals or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Radius filter buttons */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-1 flex items-center gap-1 pointer-events-auto text-xs font-semibold text-slate-600">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Radius:</span>
          {[5, 10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-2.5 py-1 rounded-lg transition ${
                radiusKm === r
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>

        {/* Locate Me button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-800 px-3 py-2 rounded-xl shadow-lg border border-slate-200 pointer-events-auto text-xs font-bold flex items-center gap-1.5 transition ml-auto"
        >
          <Compass className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'My Location'}</span>
        </button>
      </div>

      {/* Google Maps Container */}
      <div className="w-full flex-1 relative">
        <APIProvider apiKey={mapsApiKey} onError={() => setMapError(true)}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={defaultCenter}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {/* User Current Location Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Your Current Location">
                <div className="relative flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="absolute -bottom-5 bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                    You
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Hospital Markers */}
            {filteredHospitals.map((h) => {
              const isSelected = selectedHospitalId === h.id || activeHospital?.id === h.id;
              const dist = userLocation
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, h.latitude, h.longitude)
                : null;

              return (
                <AdvancedMarker
                  key={h.id}
                  position={{ lat: h.latitude, lng: h.longitude }}
                  title={h.name}
                  onClick={() => {
                    setActiveHospital(h);
                    if (onSelectHospital) onSelectHospital(h);
                  }}
                >
                  <Pin
                    background={h.is24x7 ? '#e11d48' : '#2563eb'}
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.25 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Hospital InfoWindow */}
            {activeHospital && (
              <InfoWindow
                position={{ lat: activeHospital.latitude, lng: activeHospital.longitude }}
                onCloseClick={() => setActiveHospital(null)}
                pixelOffset={[0, -35]}
              >
                <div className="p-1 max-w-xs sm:max-w-sm text-slate-800">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {activeHospital.name}
                        </span>
                        {activeHospital.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{activeHospital.address}, {activeHospital.area}</p>
                    </div>
                  </div>

                  <div className="py-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {activeHospital.is24x7 ? (
                          <span className="text-emerald-700 font-bold">24/7 Emergency Blood Bank</span>
                        ) : (
                          <span>Regular Hours</span>
                        )}
                      </span>
                      {userLocation && (
                        <span className="font-bold text-rose-600">
                          {formatDistance(
                            calculateDistanceKm(
                              userLocation.lat,
                              userLocation.lng,
                              activeHospital.latitude,
                              activeHospital.longitude
                            )
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{activeHospital.phone}</span>
                    </div>

                    {/* Available Blood Stock in this Hospital */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Available Blood Groups:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {activeHospitalStock.length > 0 ? (
                          activeHospitalStock.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold border border-rose-200"
                            >
                              {s.bloodGroup} ({s.units}u)
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No inventory recorded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openGoogleMapsDirections(activeHospital)}
                      className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Navigation className="w-3 h-3" /> Get Directions
                    </button>
                    {onRequestBloodFromHospital && (
                      <button
                        onClick={() => onRequestBloodFromHospital(activeHospital)}
                        className="py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Droplet className="w-3 h-3" /> Request
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium">
          <Building2 className="w-3.5 h-3.5 text-rose-400" />
          Showing {filteredHospitals.length} hospitals within {radiusKm} km
        </span>
        <span className="text-[10px] text-slate-400">
          Powered by Google Maps Platform • Advanced Markers
        </span>
      </div>
    </div>
  );
};

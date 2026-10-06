import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS, isBloodCompatible, COMPATIBLE_DONORS_MAP } from '../services/bloodCompatibility';
import { calculateDistanceKm, formatDistance } from '../services/distance';
import { requestDonorMatching, requestBloodDemandAnalysis } from '../services/geminiClient';
import { BloodGroup, BloodStockItem, BloodRequest, EmergencyRequest, DonorRecommendation, DemandAnalysisReport } from '../types';
import { HospitalMap } from '../components/maps/HospitalMap';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  LayoutDashboard,
  Building2,
  Droplet,
  Search,
  ShieldAlert,
  Users,
  Sparkles,
  MapPin,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Phone,
  Filter,
} from 'lucide-react';

interface HospitalPortalViewProps {
  setCurrentView: (view: string) => void;
}

export const HospitalPortalView: React.FC<HospitalPortalViewProps> = ({ setCurrentView }) => {
  const {
    currentHospital,
    hospitals,
    bloodStock,
    bloodRequests,
    emergencyRequests,
    donors,
    updateBloodStock,
    addHospitalStock,
    updateRequestStatus,
    logout,
  } = useApp();

  const hospital = currentHospital || hospitals[0];
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'stock' | 'requests' | 'emergency' | 'ai-matching' | 'donors' | 'reports' | 'map'
  >('dashboard');

  // Stock management state
  const hospitalStock = useMemo(() => {
    return bloodStock.filter((s) => s.hospitalId === hospital.id);
  }, [bloodStock, hospital.id]);

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editUnits, setEditUnits] = useState<number>(0);
  const [editReserved, setEditReserved] = useState<number>(0);
  const [editCritical, setEditCritical] = useState<number>(10);

  // New stock item modal/state
  const [showAddStockModal, setShowAddStockModal] = useState<boolean>(false);
  const [newGroup, setNewGroup] = useState<BloodGroup>('O+');
  const [newUnits, setNewUnits] = useState<number>(15);
  const [newCritical, setNewCritical] = useState<number>(10);

  // AI Matching State
  const [matchBloodGroup, setMatchBloodGroup] = useState<BloodGroup>('O-');
  const [matchUnits, setMatchUnits] = useState<number>(2);
  const [matchUrgency, setMatchUrgency] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('CRITICAL');
  const [matchRadiusKm, setMatchRadiusKm] = useState<number>(25);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchingResults, setMatchingResults] = useState<{
    recommendations: DonorRecommendation[];
    explanation: string;
    disclaimer: string;
    isFallback?: boolean;
  } | null>(null);

  // AI Demand Analysis State
  const [isAnalyzingDemand, setIsAnalyzingDemand] = useState<boolean>(false);
  const [demandReport, setDemandReport] = useState<DemandAnalysisReport | null>(null);

  // Overall statistics for dashboard cards
  const totalUnits = hospitalStock.reduce((acc, curr) => acc + curr.units, 0);
  const criticalStockItems = hospitalStock.filter((s) => s.units <= s.criticalLevel);
  const pendingRequests = bloodRequests.filter((r) => r.status === 'REQUESTED' || r.status === 'MATCHING');
  const activeEmergencies = emergencyRequests.filter((e) => e.status === 'ACTIVE' || e.status === 'TRIAGED');
  const availableDonors = donors.filter((d) => d.availability === 'Available');

  // Handle stock update
  const handleSaveStock = (stockId: string) => {
    updateBloodStock(stockId, editUnits, editReserved, editCritical);
    setEditingStockId(null);
  };

  const handleCreateStock = (e: React.FormEvent) => {
    e.preventDefault();
    addHospitalStock({
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      bloodGroup: newGroup,
      units: newUnits,
      reservedUnits: 0,
      criticalLevel: newCritical,
    });
    setShowAddStockModal(false);
  };

  // Run Gemini AI Donor Matcher
  const handleExecuteAiMatch = async () => {
    setIsMatching(true);
    try {
      // 1. Filter candidates compatible with required blood group
      const candidates = donors
        .filter((d) => isBloodCompatible(d.bloodGroup, matchBloodGroup))
        .map((d) => {
          // Approximate distance based on hospital coordinates and dummy variation for donor
          const distanceKm = calculateDistanceKm(
            hospital.latitude,
            hospital.longitude,
            hospital.latitude + (Math.random() - 0.5) * 0.08,
            hospital.longitude + (Math.random() - 0.5) * 0.08
          );

          // Calculate months since last donation
          const lastDate = d.lastDonationDate ? new Date(d.lastDonationDate) : new Date(2025, 0, 1);
          const monthsAgo = Math.max(
            1,
            Math.round((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
          );

          return {
            id: d.id,
            bloodGroup: d.bloodGroup,
            distanceKm,
            availability: d.availability,
            lastDonationMonthsAgo: monthsAgo,
            donationCount: d.donationCount,
            age: 30, // privacy protected non-sensitive
            donorName: d.name,
            city: d.city,
          };
        })
        .filter((c) => c.distanceKm <= matchRadiusKm);

      // 2. Call Gemini AI via server-side service
      const res = await requestDonorMatching({
        bloodGroup: matchBloodGroup,
        location: `${hospital.area}, ${hospital.city}`,
        units: matchUnits,
        urgency: matchUrgency,
        candidateDonors: candidates,
      });

      // Augment donor metadata for display
      const augmented = res.recommendations.map((rec) => {
        const original = candidates.find((c) => c.id === rec.donorId);
        return {
          ...rec,
          donorName: original?.donorName || 'Voluntary Donor',
          bloodGroup: original?.bloodGroup,
          distanceKm: original?.distanceKm,
          availability: original?.availability,
          city: original?.city,
        };
      });

      setMatchingResults({
        recommendations: augmented,
        explanation: res.explanation,
        disclaimer: res.disclaimer,
        isFallback: res.isFallback,
      });
    } catch (err) {
      console.error('AI match error', err);
    } finally {
      setIsMatching(false);
    }
  };

  // Run Gemini AI Demand Analysis
  const handleRunDemandAnalysis = async () => {
    setIsAnalyzingDemand(true);
    try {
      const summary = hospitalStock.map((s) => ({
        bloodGroup: s.bloodGroup,
        units: s.units,
        criticalLevel: s.criticalLevel,
      }));

      const res = await requestBloodDemandAnalysis({
        stockSummary: summary,
        recentRequestsCount: bloodRequests.length,
        emergencyRequestsCount: emergencyRequests.length,
        hospitalName: hospital.name,
      });

      setDemandReport(res);
    } catch (err) {
      console.error('Demand analysis error', err);
    } finally {
      setIsAnalyzingDemand(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Blood Group', 'Available Units', 'Reserved Units', 'Critical Threshold', 'Last Updated'];
    const rows = hospitalStock.map((s) => [
      s.bloodGroup,
      s.units,
      s.reservedUnits,
      s.criticalLevel,
      s.updatedAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${hospital.hospitalId}_Blood_Stock_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data
  const stockChartData = useMemo(() => {
    return hospitalStock.map((s) => ({
      name: s.bloodGroup,
      available: s.units,
      critical: s.criticalLevel,
      reserved: s.reservedUnits,
    }));
  }, [hospitalStock]);

  const pieColors = ['#e11d48', '#f43f5e', '#fb7185', '#be123c', '#9f1239', '#881337', '#e11d48', '#f59e0b'];

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Hospital Profile Mini Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-white text-xs truncate">{hospital.name}</h3>
                <span className="text-[10px] text-blue-400 font-mono">{hospital.hospitalId}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{hospital.city} • {hospital.type}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'stock'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Droplet className="w-4 h-4 text-rose-500" /> Blood Stock
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                {totalUnits}u
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4" /> Blood Requests
              </span>
              {pendingRequests.length > 0 && (
                <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'emergency'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-950/30'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4" /> Emergency Triage
              </span>
              <span className="text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-bold animate-pulse">
                {activeEmergencies.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ai-matching')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'ai-matching'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/30'
              }`}
            >
              <Sparkles className="w-4 h-4" /> AI Donor Matching
            </button>

            <button
              onClick={() => setActiveTab('donors')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'donors'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Donors Directory
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Reports & Analytics
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" /> Geospatial Network
            </button>
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <button
            onClick={() => setCurrentView('home')}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Return to Public Portal
          </button>
          <button
            onClick={() => {
              logout();
              setCurrentView('home');
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Top bar header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Hospital Transfusion Center</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-extrabold uppercase">
                Verified 24/7
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-0.5">{hospital.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stock')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" /> Update Stock
            </button>
            <button
              onClick={() => setActiveTab('ai-matching')}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Donor Match
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 5 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Blood Units</span>
                <p className="text-2xl font-black text-white mt-1">{totalUnits}</p>
                <span className="text-[10px] text-slate-500">In hospital reserve</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Critical Thresholds</span>
                <p className="text-2xl font-black text-red-400 mt-1">{criticalStockItems.length}</p>
                <span className="text-[10px] text-red-300">Groups below safety limit</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Requests</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{pendingRequests.length}</p>
                <span className="text-[10px] text-amber-300">Requires review</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Emergency Triage</span>
                <p className="text-2xl font-black text-red-500 mt-1">{activeEmergencies.length}</p>
                <span className="text-[10px] text-red-400">Level 1 alerts</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Nearby Donors</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{availableDonors.length * 10}+</p>
                <span className="text-[10px] text-emerald-300">Within 15 km radius</span>
              </div>
            </div>

            {/* Quick Stock Summary & Alert Banner */}
            {criticalStockItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>
                    <strong>Inventory Alert:</strong> Blood groups{' '}
                    <strong className="text-red-300">
                      {criticalStockItems.map((s) => s.bloodGroup).join(', ')}
                    </strong>{' '}
                    are at or below safety reserve thresholds.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('ai-matching')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shrink-0 transition"
                >
                  Match Donors Now
                </button>
              </div>
            )}

            {/* Main Stock Table Overview */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-rose-500" /> Current Blood Stock Overview
                </h3>
                <button
                  onClick={() => setActiveTab('stock')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Manage inventory &rarr;
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {hospitalStock.map((s) => {
                  const isCrit = s.units <= s.criticalLevel * 0.5;
                  const isLow = s.units <= s.criticalLevel && !isCrit;

                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-xl border text-center ${
                        isCrit
                          ? 'bg-red-950/40 border-red-500/40'
                          : isLow
                          ? 'bg-amber-950/40 border-amber-500/40'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <span className="text-lg font-black text-white">{s.bloodGroup}</span>
                      <p className="text-xl font-black mt-1 leading-tight text-white">{s.units}</p>
                      <span className="text-[10px] text-slate-400">units</span>
                      <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-500">
                        Reserved: {s.reservedUnits}u
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Requests Queue */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" /> Patient Request Triage Queue
                </h3>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View all ({bloodRequests.length}) &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-850 text-xs">
                {bloodRequests.slice(0, 4).map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{r.patientName}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-black text-[10px]">
                          {r.bloodGroup}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">{r.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {r.units} unit(s) • {r.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {r.status}
                      </span>
                      <button
                        onClick={() => updateRequestStatus(r.id, 'HOSPITAL CONFIRMED')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BLOOD STOCK MANAGEMENT */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Hospital Blood Stock Inventory</h2>
                <p className="text-xs text-slate-400">
                  Manage real-time inventory units, reserved pre-surgical units, and threshold alarms.
                </p>
              </div>

              <button
                onClick={() => setShowAddStockModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Blood Group
              </button>
            </div>

            {/* Stock Management Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Available Units</th>
                    <th className="py-3 px-4">Reserved Units</th>
                    <th className="py-3 px-4">Critical Threshold</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {hospitalStock.map((s) => {
                    const isEditing = editingStockId === s.id;
                    const isCrit = s.units <= s.criticalLevel * 0.5 || s.units === 0;
                    const isLow = s.units <= s.criticalLevel && !isCrit;

                    return (
                      <tr key={s.id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-black text-xs">
                            {s.bloodGroup}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editUnits}
                              onChange={(e) => setEditUnits(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                            />
                          ) : (
                            <span className="text-base font-black text-white">{s.units}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editReserved}
                              onChange={(e) => setEditReserved(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                            />
                          ) : (
                            <span className="font-mono text-slate-300">{s.reservedUnits}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={editCritical}
                              onChange={(e) => setEditCritical(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
                            />
                          ) : (
                            <span className="text-slate-400 font-mono">&lt; {s.criticalLevel}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              s.units === 0
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : isCrit
                                ? 'bg-red-900/60 text-red-200 border border-red-700'
                                : isLow
                                ? 'bg-amber-950 text-amber-200 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {s.units === 0 ? 'Empty' : isCrit ? 'Critical' : isLow ? 'Low' : 'Normal'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveStock(s.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStockId(null)}
                                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStockId(s.id);
                                setEditUnits(s.units);
                                setEditReserved(s.reservedUnits);
                                setEditCritical(s.criticalLevel);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 ml-auto"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Add Stock Modal */}
            {showAddStockModal && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-4">
                <h4 className="font-bold text-sm text-white">Add New Blood Inventory Entry</h4>
                <form onSubmit={handleCreateStock} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Blood Group</label>
                    <select
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                    >
                      {ALL_BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Available Units</label>
                    <input
                      type="number"
                      min="1"
                      value={newUnits}
                      onChange={(e) => setNewUnits(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Critical Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={newCritical}
                      onChange={(e) => setNewCritical(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Add Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddStockModal(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BLOOD REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Patient Blood Requests</h2>
                <p className="text-xs text-slate-400">
                  Accept, review, and confirm incoming patient transfusion requests.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {bloodRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{req.patientName}</span>
                      <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 font-black text-xs border border-rose-800">
                        {req.bloodGroup}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">ID: {req.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                          req.urgency === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : req.urgency === 'URGENT'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {req.urgency}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs">
                    Required: <strong>{req.units} units</strong> • Location: {req.location} • Contact: {req.contactNumber}
                  </p>
                  {req.additionalNotes && (
                    <p className="text-slate-400 text-[11px] italic bg-slate-900/60 p-2 rounded-lg">
                      "{req.additionalNotes}"
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850">
                    <span className="text-[11px] text-slate-500">
                      Created: {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'DONOR FOUND')}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-semibold"
                      >
                        Donor Found
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'HOSPITAL CONFIRMED')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Accept & Confirm
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        Complete Transfusion
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'CANCELLED')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EMERGENCY TRIAGE */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-red-200">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                <span>
                  <strong>CRITICAL EMERGENCY TRIAGE QUEUE:</strong> High priority incidents prioritized for rapid universal RBC delivery.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {emergencyRequests.map((emg) => (
                <div
                  key={emg.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-red-500/40 space-y-4 text-xs shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">{emg.patientName}</span>
                        <span className="px-2.5 py-1 rounded-md bg-red-600 text-white font-black text-xs">
                          {emg.bloodGroup}
                        </span>
                        <span className="text-red-400 font-mono text-[11px]">({emg.id})</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Facility: <strong>{emg.hospital}</strong> • Location: {emg.location}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase animate-pulse">
                      {emg.emergencyLevel}
                    </span>
                  </div>

                  {emg.aiTriageSummary && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Gemini Emergency Recommendation:
                      </span>
                      <p className="text-slate-200">{emg.aiTriageSummary}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                    <span className="text-slate-500">Contact: {emg.contact}</span>
                    <button
                      onClick={() => {
                        setMatchBloodGroup(emg.bloodGroup);
                        setMatchUnits(emg.units);
                        setMatchUrgency('CRITICAL');
                        setActiveTab('ai-matching');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run AI Donor Match for This Patient</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AI DONOR MATCHING (Section 23) */}
        {activeTab === 'ai-matching' && (
          <div className="space-y-6">
            <div className="bg-slate-950 rounded-3xl p-6 border border-purple-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-bold text-white">Gemini AI Smart Donor Matcher</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Queries compatible voluntary donors, calculates proximity, safe cooldown, and evaluates rank orders.
                  </p>
                </div>

                <span className="text-xs font-bold text-purple-300 bg-purple-950/60 border border-purple-800 px-3 py-1 rounded-full self-start sm:self-auto">
                  Decision Support Engine
                </span>
              </div>

              {/* Match input form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Required Blood Group</label>
                  <select
                    value={matchBloodGroup}
                    onChange={(e) => setMatchBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={matchUnits}
                    onChange={(e) => setMatchUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Urgency</label>
                  <select
                    value={matchUrgency}
                    onChange={(e) => setMatchUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="NORMAL">Normal (Elective)</option>
                    <option value="URGENT">Urgent (Within 6 hrs)</option>
                    <option value="CRITICAL">Critical (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Search Radius</label>
                  <select
                    value={matchRadiusKm}
                    onChange={(e) => setMatchRadiusKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km</option>
                    <option value={50}>Within 50 km</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExecuteAiMatch}
                disabled={isMatching}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isMatching ? 'Processing with Gemini AI...' : 'Run Gemini Smart Donor Match'}</span>
              </button>

              {/* Matching Output */}
              {matchingResults && (
                <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      Evaluation Findings: {matchingResults.explanation}
                    </span>
                    <span className="text-purple-400 font-semibold text-[11px]">
                      {matchingResults.recommendations.length} Candidates Ranked
                    </span>
                  </div>

                  <div className="space-y-3">
                    {matchingResults.recommendations.map((rec) => (
                      <div
                        key={rec.donorId}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{rec.donorName}</span>
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                              {rec.bloodGroup}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ~{rec.distanceKm ? formatDistance(rec.distanceKm) : 'Nearby'}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold uppercase">
                              {rec.availability || 'Available'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{rec.reason}</p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-800 sm:pl-6">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">
                              AI Match Score
                            </span>
                            <span className="text-2xl font-black text-emerald-400">
                              {rec.matchScore}%
                            </span>
                          </div>

                          <button
                            onClick={() => alert(`Dispatch alert sent to ${rec.donorName}. Notification recorded in system history.`)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                          >
                            Dispatch Alert
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Medical Disclaimer */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2 text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      {matchingResults.disclaimer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: DONORS DIRECTORY */}
        {activeTab === 'donors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Verified Voluntary Donors Directory</h2>
                <p className="text-xs text-slate-400">
                  Approximate proximity information. Exact coordinates protected under privacy rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {donors.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{d.name}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-black text-xs border border-rose-800">
                      {d.bloodGroup}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Area: <strong>{d.area}</strong>, {d.city}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Last Donated: {d.lastDonationDate || 'First time donor'} • Total: {d.donationCount}
                  </p>
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold uppercase">
                      {d.availability}
                    </span>
                    <button
                      onClick={() => {
                        setMatchBloodGroup(d.bloodGroup);
                        setActiveTab('ai-matching');
                      }}
                      className="text-purple-400 hover:text-purple-300 font-bold"
                    >
                      AI Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS & ANALYTICS (Section 29) */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Header with Export & Print */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Transfusion Reports & AI Demand Analytics</h2>
                <p className="text-xs text-slate-400">
                  Inventory distribution, request velocity, and AI predictive demand attention areas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Report
                </button>
                <button
                  onClick={handleRunDemandAnalysis}
                  disabled={isAnalyzingDemand}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Run AI Demand Analysis
                </button>
              </div>
            </div>

            {/* AI Demand Analysis Output Banner */}
            {demandReport && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 text-xs animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Gemini AI Demand Analysis Result
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Real-Time Inventory Correlation</span>
                </div>

                <p className="text-slate-200 leading-relaxed font-medium">
                  {demandReport.demandSummary}
                </p>

                {demandReport.lowStockWarnings?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Inventory Warnings:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {demandReport.lowStockWarnings.map((w, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">
                          ⚠️ {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-850 flex items-start gap-2 text-slate-400 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p>{demandReport.disclaimer}</p>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blood Stock Levels vs Threshold Bar Chart */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Blood Group Stock Levels vs. Critical Threshold
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend />
                      <Bar dataKey="available" name="Available Units" fill="#e11d48" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="critical" name="Safety Threshold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Donut Chart */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Inventory Blood Group Distribution
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockChartData}
                        dataKey="available"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        label={(entry: any) => `${entry.name}: ${entry.value}`}
                      >
                        {stockChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MAP VIEW */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Regional Hospital Network Map</h2>
              <p className="text-xs text-slate-400">
                Live Google Maps Platform view of connected medical centers and blood centers.
              </p>
            </div>
            <HospitalMap hospitals={hospitals} selectedHospitalId={hospital.id} />
          </div>
        )}
      </main>
    </div>
  );
};

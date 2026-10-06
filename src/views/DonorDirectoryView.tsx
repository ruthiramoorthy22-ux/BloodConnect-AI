import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS } from '../services/bloodCompatibility';
import { DISEASE_INELIGIBILITY_GUIDELINES } from '../data/mockData';
import { BloodGroup, User, MedicalTestReport, DonorAvailability } from '../types';
import {
  Users,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Droplet,
  Info,
  Download,
  Printer,
  X,
  Sparkles,
  Calendar,
  Building2,
  Activity,
  UserPlus,
  Plus,
} from 'lucide-react';

interface DonorDirectoryViewProps {
  setCurrentView: (view: string) => void;
}

export const DonorDirectoryView: React.FC<DonorDirectoryViewProps> = ({ setCurrentView }) => {
  const { donors, registerDonor } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [ageLimitFilter, setAgeLimitFilter] = useState<'ALL' | 'ELIGIBLE' | 'UNDERAGE' | 'SENIOR'>('ALL');
  const [testReportFilter, setTestReportFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');

  // Active modal for viewing full medical test report
  const [selectedDonorReport, setSelectedDonorReport] = useState<User | null>(null);

  // Active tab in guidelines section
  const [guidelineCategory, setGuidelineCategory] = useState<'ALL' | 'Permanent' | 'Temporary'>('ALL');

  // Add Donor Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newDonorName, setNewDonorName] = useState<string>('');
  const [newDonorBloodGroup, setNewDonorBloodGroup] = useState<BloodGroup>('O+');
  const [newDonorAge, setNewDonorAge] = useState<number>(26);
  const [newDonorGender, setNewDonorGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [newDonorCity, setNewDonorCity] = useState<string>('San Francisco');
  const [newDonorArea, setNewDonorArea] = useState<string>('Mission District');
  const [newDonorPhone, setNewDonorPhone] = useState<string>('+1 (555) 392-1084');
  const [newDonorEmail, setNewDonorEmail] = useState<string>('');
  const [newDonorWeight, setNewDonorWeight] = useState<number>(68);
  const [newDonorHemoglobin, setNewDonorHemoglobin] = useState<number>(14.5);
  const [newDonorBp, setNewDonorBp] = useState<string>('120/80');
  const [newDonorPulse, setNewDonorPulse] = useState<number>(72);
  const [newDonorAvailability, setNewDonorAvailability] = useState<DonorAvailability>('Available');
  const [newDonorDiseasesCleared, setNewDonorDiseasesCleared] = useState<boolean>(true);
  const [newDonorCertifiedBy, setNewDonorCertifiedBy] = useState<string>('Dr. Michael Hayes, MD - Blood Bank Pathologist');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleAddNewDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName.trim()) return;

    const email = newDonorEmail.trim() || `${newDonorName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`;
    const ageNum = Number(newDonorAge);
    const weightNum = Number(newDonorWeight);
    const hbNum = Number(newDonorHemoglobin);
    const isAgeValid = ageNum >= 18 && ageNum <= 65;
    const isWeightValid = weightNum >= 50;
    const isHbValid = hbNum >= 12.5;
    const isEligible = newDonorDiseasesCleared && isAgeValid && isWeightValid && isHbValid;

    const created = registerDonor({
      name: newDonorName.trim(),
      email,
      phone: newDonorPhone.trim() || '+1 (555) 019-2834',
      role: 'user',
      bloodGroup: newDonorBloodGroup,
      gender: newDonorGender,
      dob: `${new Date().getFullYear() - ageNum}-05-20`,
      age: ageNum,
      city: newDonorCity.trim() || 'San Francisco',
      area: newDonorArea.trim() || 'Downtown',
      donationCount: 1,
      availability: newDonorAvailability,
      medicalReport: {
        reportId: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        testDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        hemoglobin: hbNum,
        bloodPressure: newDonorBp,
        pulseRate: Number(newDonorPulse),
        weightKg: weightNum,
        bodyTemperature: '98.4 °F',
        infectiousDiseases: {
          hiv: 'Negative',
          hepatitisB: 'Negative',
          hepatitisC: 'Negative',
          syphilis: 'Negative',
          malaria: 'Negative',
        },
        overallStatus: isEligible ? 'PASSED' : 'DEFERRED',
        physicianNotes: isEligible
          ? 'Comprehensive clinical laboratory immunohematology clearance complete. Donor cleared for phlebotomy.'
          : 'Donor currently deferred due to laboratory/statutory screening limits.',
        certifiedBy: newDonorCertifiedBy,
      },
    });

    setRecentlyAddedId(created.id);
    setSuccessMessage(`✨ Success! Blood donor "${created.name}" (${created.bloodGroup}, Age: ${created.age}) has been added and saved in the database!`);
    setIsAddModalOpen(false);

    // Reset form fields
    setNewDonorName('');
    setNewDonorEmail('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 9000);
  };

  // Filtered donors
  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      // Blood Group filter
      if (selectedGroup !== 'ALL' && d.bloodGroup !== selectedGroup) return false;

      // Age Limit filter (Standard whole blood age limit: 18 to 65 years)
      const age = d.age || 30;
      if (ageLimitFilter === 'ELIGIBLE' && (age < 18 || age > 65)) return false;
      if (ageLimitFilter === 'UNDERAGE' && age >= 18) return false;
      if (ageLimitFilter === 'SENIOR' && age <= 65) return false;

      // Test Report status filter
      if (testReportFilter !== 'ALL') {
        const reportStatus = d.medicalReport?.overallStatus || 'PENDING';
        if (reportStatus !== testReportFilter) return false;
      }

      // Availability filter
      if (availabilityFilter !== 'ALL' && d.availability !== availabilityFilter) return false;

      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesArea = d.area.toLowerCase().includes(q);
        const matchesCity = d.city.toLowerCase().includes(q);
        const matchesGroup = d.bloodGroup.toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesCity && !matchesGroup) return false;
      }

      return true;
    });
  }, [donors, selectedGroup, ageLimitFilter, testReportFilter, availabilityFilter, searchQuery]);

  const filteredGuidelines = useMemo(() => {
    if (guidelineCategory === 'Permanent') {
      return DISEASE_INELIGIBILITY_GUIDELINES.filter((g) => g.category === 'Permanent Deferral');
    }
    if (guidelineCategory === 'Temporary') {
      return DISEASE_INELIGIBILITY_GUIDELINES.filter((g) => g.category === 'Temporary Deferral');
    }
    return DISEASE_INELIGIBILITY_GUIDELINES;
  }, [guidelineCategory]);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5 text-rose-600" />
              <span>Certified Lifesaver Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Blood Donor Registry & Clinical Test Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Explore verified voluntary donors, statutory age limit compliance (18–65 years), clinical laboratory screening reports, and disqualifying medical conditions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Blood Donor</span>
            </button>
            <button
              onClick={() => setCurrentView('donor')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 transition"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Register as New Donor</span>
            </button>
            <button
              onClick={() => setCurrentView('request')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2"
            >
              <Droplet className="w-4 h-4 text-rose-400" />
              <span>Request Blood</span>
            </button>
          </div>
        </div>

        {/* Real-time Storage & Registration Confirmation Toast */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3 Overview Info Cards: Age Limit, Diseases Not Eligible, Test Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Statutory Age Limit */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" /> Statutory Age Regulations
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                18 - 65 Years
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              Legal Whole Blood Donor Age Limit
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Under 18:</strong> Ineligible (Minor statutory restriction)</li>
              <li>• <strong>18 to 65:</strong> Standard legal qualification window</li>
              <li>• <strong>Over 65:</strong> Requires physician clearance</li>
              <li>• <strong>Weight Minimum:</strong> &ge; 50 kg (110 lbs)</li>
            </ul>
          </div>

          {/* Card 2: Diseases Not Eligible */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Medical Exclusions
              </span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-[10px]">
                Safety Rules
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              Disqualifying Conditions & Deferrals
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Permanent:</strong> HIV, Hepatitis B/C, Heart Disease</li>
              <li>• <strong>6-12 Months:</strong> Tattoos, Piercings, Major Surgery</li>
              <li>• <strong>Temporary:</strong> Pregnancy, Malaria, Acute Infection</li>
              <li>• <strong>Hemoglobin:</strong> &ge;12.5 g/dL (F) / &ge;13.0 g/dL (M)</li>
            </ul>
          </div>

          {/* Card 3: Clinical Test Reports */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Lab Screening Reports
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                5-Panel Tested
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              Mandatory Serology & Hemodynamics
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• HIV 1 & 2 ELISA / NAT Screening</li>
              <li>• HBsAg (Hep B) & Anti-HCV (Hep C)</li>
              <li>• Syphilis VDRL / RPR Serology</li>
              <li>• Complete Hemoglobin & BP Verification</li>
            </ul>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Filter className="w-4 h-4 text-rose-600" />
              <span>Search & Filter Donors</span>
            </div>
            <span className="text-slate-500 font-medium">
              Showing <strong>{filteredDonors.length}</strong> of {donors.length} registered donors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search donor name, area, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-800"
              />
            </div>

            {/* Blood Group Filter */}
            <div>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Blood Groups</option>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    Group {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Limit Filter */}
            <div>
              <select
                value={ageLimitFilter}
                onChange={(e) => setAgeLimitFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Ages</option>
                <option value="ELIGIBLE">Eligible Age (18 - 65 yrs)</option>
                <option value="UNDERAGE">Underage (&lt;18 yrs - Ineligible)</option>
                <option value="SENIOR">Senior (&gt;65 yrs - Special Review)</option>
              </select>
            </div>

            {/* Test Report Filter */}
            <div>
              <select
                value={testReportFilter}
                onChange={(e) => setTestReportFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Report Statuses</option>
                <option value="PASSED">Passed / Certified</option>
                <option value="DEFERRED">Deferred / Below Standard</option>
                <option value="PENDING">Pending Lab Tests</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donors List Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((d) => {
            const age = d.age || 30;
            const isAgeEligible = age >= 18 && age <= 65;
            const isUnderage = age < 18;
            const isSenior = age > 65;

            const report = d.medicalReport;
            const isPassed = report?.overallStatus === 'PASSED';
            const isDeferred = report?.overallStatus === 'DEFERRED';

            return (
              <div
                key={d.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Blood Group & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                          {d.name}
                        </h3>
                        {d.id === recentlyAddedId && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Newly Added & Stored
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {d.area}, {d.city}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-sm">
                        {d.bloodGroup}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          d.availability === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.availability === 'On Cooldown'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {d.availability}
                      </span>
                    </div>
                  </div>

                  {/* Age & Legal Eligibility Pill */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Age: <strong>{age} years</strong>
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isAgeEligible
                            ? 'bg-emerald-100 text-emerald-800'
                            : isUnderage
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAgeEligible
                          ? '✓ Legal Age (18-65)'
                          : isUnderage
                          ? '✗ Underage (<18)'
                          : '⚠️ Senior (>65)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Donations: <strong>{d.donationCount}</strong></span>
                      <span>
                        Last:{' '}
                        <strong>
                          {d.lastDonationDate
                            ? new Date(d.lastDonationDate).toLocaleDateString([], {
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'First-time'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Medical Test Report Mini Summary */}
                  {report ? (
                    <div
                      className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                        isPassed
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : isDeferred
                          ? 'bg-red-50/50 border-red-200 text-red-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          Lab Test Report #{report.reportId}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isDeferred
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {report.overallStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span>Hemoglobin: <strong>{report.hemoglobin} g/dL</strong></span>
                        <span>BP: <strong>{report.bloodPressure}</strong></span>
                        <span>Weight: <strong>{report.weightKg} kg</strong></span>
                        <span>Pulse: <strong>{report.pulseRate} bpm</strong></span>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/40">
                        Infectious Panel: HIV, HBV, HCV, Syphilis, Malaria:{' '}
                        <strong className="text-emerald-700">All Non-Reactive</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      Laboratory test report pending on-site screening
                    </div>
                  )}
                </div>

                {/* Bottom Action: View Official Clinical Report */}
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedDonorReport(d)}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>View Official Medical Report</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Test Report Interactive Modal */}
        {selectedDonorReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Clinical Laboratory Immunohematology Report</h3>
                    <p className="text-xs text-slate-400">
                      Standard Transfusion Screening & Verification Certificate
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDonorReport(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
                {/* Certificate Meta Strip */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Identification</span>
                    <span className="font-mono font-black text-rose-700 text-sm">
                      {selectedDonorReport.medicalReport?.reportId || 'LAB-2026-8800'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Verification Date</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {selectedDonorReport.medicalReport?.testDate || 'Current Session'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        selectedDonorReport.medicalReport?.overallStatus === 'PASSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedDonorReport.medicalReport?.overallStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Donor Demographics & Statutory Age */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
                    1. Donor Physiological Demographics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Donor Name</span>
                      <strong className="text-slate-900 text-xs">{selectedDonorReport.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Blood Phenotype</span>
                      <strong className="text-rose-700 text-xs font-black">{selectedDonorReport.bloodGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Age (Statutory Limit: 18-65)</span>
                      <strong className={`text-xs font-bold ${(selectedDonorReport.age || 30) >= 18 && (selectedDonorReport.age || 30) <= 65 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {selectedDonorReport.age || 30} Years
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Gender & Weight</span>
                      <strong className="text-slate-900 text-xs">{selectedDonorReport.gender} • {selectedDonorReport.medicalReport?.weightKg || 65} kg</strong>
                    </div>
                  </div>
                </div>

                {/* Hemodynamic Physical Parameters */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
                    2. Physical & Hematological Examination
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-400 text-[10px] block">Hemoglobin Level</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">
                        {selectedDonorReport.medicalReport?.hemoglobin || 14.5} <span className="text-xs font-normal">g/dL</span>
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Standard: &ge;12.5 g/dL</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-400 text-[10px] block">Blood Pressure</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">
                        {selectedDonorReport.medicalReport?.bloodPressure || '120/80'}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">Normotensive</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-400 text-[10px] block">Pulse Rate</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">
                        {selectedDonorReport.medicalReport?.pulseRate || 72} <span className="text-xs font-normal">bpm</span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">Standard: 60 - 100</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-slate-400 text-[10px] block">Body Temperature</span>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {selectedDonorReport.medicalReport?.bodyTemperature || '98.4 °F'}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Afebrile</span>
                    </div>
                  </div>
                </div>

                {/* 5-Panel Infectious Disease Serology */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
                    3. Mandatory 5-Panel Transfusion Transmitted Infection (TTI) Screen
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">HIV 1 & 2 (Antibodies & p24 Antigen)</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Negative (Non-Reactive)
                      </span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Hepatitis B Surface Antigen (HBsAg)</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Negative (Non-Reactive)
                      </span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Hepatitis C Virus (HCV Antibodies)</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Negative (Non-Reactive)
                      </span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Treponema Pallidum (Syphilis / VDRL)</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Negative (Non-Reactive)
                      </span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Malaria Antigen Test</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Negative (Non-Reactive)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pathologist Verification Notes */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Transfusion Officer Clinical Remarks
                  </span>
                  <p className="text-xs text-slate-700">
                    {selectedDonorReport.medicalReport?.physicianNotes ||
                      'Donor cleared for whole blood phlebotomy according to national transfusion regulatory standards.'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold pt-1">
                    Certified by: {selectedDonorReport.medicalReport?.certifiedBy || 'Dr. Michael Hayes, MD - Blood Bank Pathologist'}
                  </p>
                </div>
              </div>

              {/* Modal Footer with Actions */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Certificate
                </button>
                <button
                  onClick={() => setSelectedDonorReport(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Blood Donor to Database */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Register & Store New Blood Donor</h3>
                    <p className="text-xs text-slate-400">
                      Save to local & persistent donor database with clinical lab screening
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddNewDonor} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
                {/* Section 1: Demographics */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    1. Donor Demographics & Identity
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newDonorName}
                        onChange={(e) => setNewDonorName(e.target.value)}
                        placeholder="e.g. Ruthiramoorthy or Alex Rivera"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Blood Phenotype <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={newDonorBloodGroup}
                        onChange={(e) => setNewDonorBloodGroup(e.target.value as BloodGroup)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
                      >
                        {ALL_BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            Group {bg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">
                          Age (Years) <span className="text-rose-600">*</span>
                        </label>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                            newDonorAge >= 18 && newDonorAge <= 65
                              ? 'bg-emerald-100 text-emerald-800'
                              : newDonorAge < 18
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {newDonorAge >= 18 && newDonorAge <= 65
                            ? '✓ Legal (18-65)'
                            : newDonorAge < 18
                            ? '✗ Underage (<18)'
                            : '⚠️ Senior (>65)'}
                        </span>
                      </div>
                      <input
                        type="number"
                        required
                        min="16"
                        max="85"
                        value={newDonorAge}
                        onChange={(e) => setNewDonorAge(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gender</label>
                      <select
                        value={newDonorGender}
                        onChange={(e) => setNewDonorGender(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={newDonorPhone}
                        onChange={(e) => setNewDonorPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={newDonorEmail}
                        onChange={(e) => setNewDonorEmail(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newDonorCity}
                        onChange={(e) => setNewDonorCity(e.target.value)}
                        placeholder="e.g. San Francisco"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Area / Neighborhood</label>
                      <input
                        type="text"
                        value={newDonorArea}
                        onChange={(e) => setNewDonorArea(e.target.value)}
                        placeholder="e.g. Mission District"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Clinical Screening & Laboratory Parameters */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    2. Mandatory Clinical Screening & Vitals
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Weight (kg) <span className="text-slate-400 font-normal">(&ge;50)</span>
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="160"
                        value={newDonorWeight}
                        onChange={(e) => setNewDonorWeight(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Hemoglobin (g/dL) <span className="text-slate-400 font-normal">(&ge;12.5)</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="8"
                        max="20"
                        value={newDonorHemoglobin}
                        onChange={(e) => setNewDonorHemoglobin(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        value={newDonorBp}
                        onChange={(e) => setNewDonorBp(e.target.value)}
                        placeholder="120/80"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pulse Rate (bpm)</label>
                      <input
                        type="number"
                        min="50"
                        max="120"
                        value={newDonorPulse}
                        onChange={(e) => setNewDonorPulse(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Disease Ineligibility Confirmation Check */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDonorDiseasesCleared}
                        onChange={(e) => setNewDonorDiseasesCleared(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5"
                      />
                      <span className="text-slate-700 leading-relaxed">
                        <strong>Transfusion Disease Ineligibility Confirmation:</strong> The donor has no history of HIV, Hepatitis B or C, coronary cardiac disease, syphilis, recent tattoo or piercing (&lt;6 months), or active systemic infection. 5-panel serology will be certified non-reactive.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Availability & Pathologist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Availability Status</label>
                    <select
                      value={newDonorAvailability}
                      onChange={(e) => setNewDonorAvailability(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50"
                    >
                      <option value="Available">Available for Phlebotomy</option>
                      <option value="On Cooldown">On Cooldown (Recent Donation)</option>
                      <option value="Unavailable">Temporarily Unavailable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Certifying Pathologist / Officer</label>
                    <input
                      type="text"
                      value={newDonorCertifiedBy}
                      onChange={(e) => setNewDonorCertifiedBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Store Donor in Database</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECTION: DISEASES NOT ELIGIBLE & DEFERRAL REFERENCE GUIDE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-black text-slate-900">
                  Diseases & Medical Conditions Not Eligible for Donation
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official transfusion safety deferral criteria based on WHO and National Blood Transfusion Standards.
              </p>
            </div>

            {/* Filter Category */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setGuidelineCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  guidelineCategory === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Exclusions
              </button>
              <button
                onClick={() => setGuidelineCategory('Permanent')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  guidelineCategory === 'Permanent' ? 'bg-white text-red-700 shadow-xs font-extrabold' : 'text-slate-600'
                }`}
              >
                Permanent Deferral
              </button>
              <button
                onClick={() => setGuidelineCategory('Temporary')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  guidelineCategory === 'Temporary' ? 'bg-white text-amber-700 shadow-xs font-extrabold' : 'text-slate-600'
                }`}
              >
                Temporary Deferral
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuidelines.map((g, idx) => {
              const isPermanent = g.category === 'Permanent Deferral';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition space-y-1.5 ${
                    isPermanent
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {g.name}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                        isPermanent ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {g.category}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-700">
                    Deferral Duration: <span className={isPermanent ? 'text-red-700' : 'text-amber-800'}>{g.deferralPeriod}</span>
                  </p>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {g.medicalReason}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Clinical Assessment Notice:</strong> The eligibility and disease exclusion guidelines provided are for educational reference and decision support. Prior to collection, certified blood bank medical officers perform mandatory confidential medical questionnaire screening, hemoglobin testing, and vitals check.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_BLOOD_GROUPS } from '../services/bloodCompatibility';
import { requestDonorEligibilityCheck } from '../services/geminiClient';
import { BloodGroup, DonorAvailability, EligibilityResult } from '../types';
import {
  Heart,
  Droplet,
  UserPlus,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Info,
  Users,
} from 'lucide-react';

interface BecomeDonorViewProps {
  setCurrentView: (view: string) => void;
}

export const BecomeDonorView: React.FC<BecomeDonorViewProps> = ({ setCurrentView }) => {
  const { registerDonor, currentUser, updateDonorProfile } = useApp();

  // Registration Form State
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(currentUser?.bloodGroup || 'O+');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(currentUser?.gender || 'Male');
  const [dob, setDob] = useState<string>(currentUser?.dob || '1996-05-15');
  const [city, setCity] = useState<string>(currentUser?.city || 'San Francisco');
  const [area, setArea] = useState<string>(currentUser?.area || 'Mission District');
  const [address, setAddress] = useState<string>(currentUser?.address || '789 Valencia St');
  const [lastDonationDate, setLastDonationDate] = useState<string>(currentUser?.lastDonationDate || '2026-03-01');
  const [availability, setAvailability] = useState<DonorAvailability>(currentUser?.availability || 'Available');

  // AI Eligibility Tool State
  const [screeningAge, setScreeningAge] = useState<number>(28);
  const [screeningWeight, setScreeningWeight] = useState<number>(68);
  const [screeningIntervalMonths, setScreeningIntervalMonths] = useState<number>(4);
  const [hasChronicConditions, setHasChronicConditions] = useState<boolean>(false);
  const [hasRecentTattooOrSurgery, setHasRecentTattooOrSurgery] = useState<boolean>(false);
  const [screeningNotes, setScreeningNotes] = useState<string>('');

  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [screeningResult, setScreeningResult] = useState<EligibilityResult | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const handleRunAiEligibility = async () => {
    setIsScreening(true);
    try {
      const res = await requestDonorEligibilityCheck({
        age: screeningAge,
        weightKg: screeningWeight,
        lastDonationMonthsAgo: screeningIntervalMonths,
        hasChronicConditions,
        hasRecentTattooOrSurgery,
        notes: screeningNotes,
      });
      setScreeningResult(res);
    } catch (err) {
      console.error('Eligibility check error', err);
    } finally {
      setIsScreening(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser) {
      updateDonorProfile(currentUser.id, {
        name,
        email,
        phone,
        bloodGroup,
        gender,
        dob,
        city,
        area,
        address,
        lastDonationDate,
        availability,
      });
    } else {
      registerDonor({
        name,
        email,
        phone,
        role: 'user',
        bloodGroup,
        gender,
        dob,
        city,
        area,
        address,
        lastDonationDate,
        donationCount: 1,
        availability,
      });
    }

    setIsRegistered(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-rose-600" />
            <span>Voluntary Blood Donor Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {currentUser ? 'Manage Your Donor Profile' : 'Become a Lifesaver Today'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every whole blood donation can save up to 3 lives. Register to be matched with emergency requests in your area. Your personal contact details and exact location are kept completely secure and private.
          </p>
        </div>

        {/* AI Eligibility Screening Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Preliminary Eligibility Screening
                </h3>
                <p className="text-xs text-slate-500">
                  Check if you meet standard whole blood donation criteria before visiting a center
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 self-start sm:self-auto">
              Decision Support Aid
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Age (Years)</label>
              <input
                type="number"
                min="16"
                max="80"
                value={screeningAge}
                onChange={(e) => setScreeningAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Standard: 18 - 65 yrs</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="40"
                max="160"
                value={screeningWeight}
                onChange={(e) => setScreeningWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Minimum required: 50 kg</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Months Since Last Donation</label>
              <input
                type="number"
                min="0"
                max="48"
                value={screeningIntervalMonths}
                onChange={(e) => setScreeningIntervalMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Safe interval: &ge; 3 mos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={hasRecentTattooOrSurgery}
                onChange={(e) => setHasRecentTattooOrSurgery(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">Recent Tattoo, Piercing or Major Surgery</span>
                <span className="text-[10px] text-slate-500">Within the past 6 to 12 months</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={hasChronicConditions}
                onChange={(e) => setHasChronicConditions(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">Chronic Conditions or Daily Medications</span>
                <span className="text-[10px] text-slate-500">e.g. Hypertension, blood thinners</span>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={handleRunAiEligibility}
            disabled={isScreening}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isScreening ? 'Evaluating Criteria...' : 'Evaluate Preliminary Eligibility with Gemini'}</span>
          </button>

          {/* Screening Output */}
          {screeningResult && (
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 ${screeningResult.eligible ? 'text-emerald-600' : 'text-amber-600'}`} />
                  AI Screening Assessment: <strong>{screeningResult.status}</strong>
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${screeningResult.eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {screeningResult.eligible ? 'Ready to Donate' : 'Screening Review Needed'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Clinical Guidelines:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                  {screeningResult.guidelines.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 pt-1 border-t border-purple-200/50">
                <span className="text-[10px] uppercase font-bold text-slate-500">Pre-Donation Advice:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {screeningResult.preparationTips.map((tip, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-900 text-[10px] font-medium">
                      ✓ {tip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mandatory Medical Disclaimer */}
              <div className="pt-2 border-t border-purple-200/60 flex items-start gap-2 text-slate-600 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  {screeningResult.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Registration Success Banner */}
        {isRegistered && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Profile saved and stored!</strong> You are active in the blood donor registry as an available {bloodGroup} donor.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('donors-list')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View in Donor List</span>
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold shrink-0 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Donor Profile Form */}
        <form onSubmit={handleRegister} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Donor Information
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your contact details are encrypted and only accessible to authorized hospital staff during active matched requests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.rivera@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 123-4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              >
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg} {bg === 'O-' ? '(Universal Donor)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Area / Neighborhood <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Mission District"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Last Blood Donation Date
              </label>
              <input
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Current Availability Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as DonorAvailability)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              >
                <option value="Available">Available (Ready to respond)</option>
                <option value="On Cooldown">On Cooldown (Recently Donated)</option>
                <option value="Unavailable">Temporarily Unavailable</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{currentUser ? 'Update Donor Profile' : 'Complete Donor Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

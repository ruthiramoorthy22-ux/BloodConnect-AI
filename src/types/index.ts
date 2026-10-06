export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'user' | 'hospital' | 'admin';

export type DonorAvailability = 'Available' | 'On Cooldown' | 'Unavailable' | 'Deferred / Ineligible';

export interface MedicalTestReport {
  reportId: string;
  testDate: string;
  hemoglobin: number; // g/dL
  bloodPressure: string; // mmHg
  pulseRate: number; // bpm
  weightKg: number; // kg
  bodyTemperature: string;
  infectiousDiseases: {
    hiv: 'Negative' | 'Positive';
    hepatitisB: 'Negative' | 'Positive';
    hepatitisC: 'Negative' | 'Positive';
    syphilis: 'Negative' | 'Positive';
    malaria: 'Negative' | 'Positive';
  };
  overallStatus: 'PASSED' | 'PENDING' | 'DEFERRED';
  physicianNotes?: string;
  certifiedBy?: string;
}

export interface DiseaseIneligibilityGuide {
  category: 'Permanent Deferral' | 'Temporary Deferral';
  name: string;
  deferralPeriod: string;
  medicalReason: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dob: string;
  age?: number;
  city: string;
  area: string;
  address?: string;
  lastDonationDate?: string;
  donationCount: number;
  availability: DonorAvailability;
  createdAt: string;
  medicalReport?: MedicalTestReport;
}

export interface Hospital {
  id: string;
  name: string;
  hospitalId: string; // e.g. HOSP-METRO-01
  email: string;
  phone: string;
  emergencyContact: string;
  address: string;
  city: string;
  area: string;
  pincode: string;
  type: 'General Hospital' | 'Trauma Center' | 'Super Specialty' | 'Blood Bank & Transfusion' | 'Government Medical Center';
  is24x7: boolean;
  latitude: number;
  longitude: number;
  verified: boolean;
  emergencySupport: boolean;
  rating?: number;
  operatingHours?: string;
}

export interface BloodStockItem {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  units: number;
  reservedUnits: number;
  criticalLevel: number; // threshold e.g. 10 units
  updatedAt: string;
}

export type RequestStatus =
  | 'REQUESTED'
  | 'MATCHING'
  | 'DONOR FOUND'
  | 'HOSPITAL CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  location: string;
  city: string;
  preferredHospitalId?: string;
  preferredHospitalName?: string;
  urgency: 'NORMAL' | 'URGENT' | 'CRITICAL';
  contactNumber: string;
  additionalNotes?: string;
  status: RequestStatus;
  createdAt: string;
  requiredDate?: string;
  assignedHospitalId?: string;
  donorMatches?: number;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  location: string;
  emergencyLevel: 'NORMAL' | 'URGENT' | 'CRITICAL';
  contact: string;
  additionalNotes?: string;
  status: 'ACTIVE' | 'TRIAGED' | 'DISPATCHED' | 'RESOLVED';
  createdAt: string;
  aiTriageSummary?: string;
  immediateActions?: string[];
}

export interface NotificationItem {
  id: string;
  type: 'Emergency Request' | 'Donor Match' | 'Blood Stock Alert' | 'Request Update' | 'Hospital Response';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  priority: 'normal' | 'urgent' | 'critical';
}

export interface DonorRecommendation {
  donorId: string;
  matchScore: number;
  reason: string;
  urgencyFit: string;
  donorName?: string;
  bloodGroup?: BloodGroup;
  distanceKm?: number;
  availability?: string;
  city?: string;
}

export interface DemandAnalysisReport {
  demandSummary: string;
  lowStockWarnings: string[];
  highDemandGroups: string[];
  suggestedActions: string[];
  disclaimer: string;
  isFallback?: boolean;
}

export interface EligibilityResult {
  status: string;
  eligible: boolean;
  guidelines: string[];
  preparationTips: string[];
  disclaimer: string;
  isFallback?: boolean;
}

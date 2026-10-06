import { BloodGroup } from '../types';

export const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Mapping of which donor groups can safely donate to a recipient
export const COMPATIBLE_DONORS_MAP: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

// Mapping of which recipients can receive from this donor
export const CAN_DONATE_TO_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'AB-': ['AB+', 'AB-'],
  'AB+': ['AB+'],
};

export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const allowed = COMPATIBLE_DONORS_MAP[recipientGroup] || [];
  return allowed.includes(donorGroup);
}

export function getCompatibleDonorGroups(recipientGroup: BloodGroup): BloodGroup[] {
  return COMPATIBLE_DONORS_MAP[recipientGroup] || [recipientGroup];
}

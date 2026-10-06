import {
  DonorRecommendation,
  DemandAnalysisReport,
  EligibilityResult,
  EmergencyRequest,
  BloodStockItem,
} from '../types';

export async function requestDonorMatching(params: {
  bloodGroup: string;
  location: string;
  units: number;
  urgency: string;
  candidateDonors: Array<{
    id: string;
    bloodGroup: string;
    distanceKm: number;
    availability: string;
    lastDonationMonthsAgo: number;
    donationCount: number;
    age: number;
  }>;
}): Promise<{
  recommendations: DonorRecommendation[];
  explanation: string;
  disclaimer: string;
  isFallback?: boolean;
}> {
  try {
    const res = await fetch('/api/gemini/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('Backend Gemini match endpoint unreachable, using client heuristic fallback', err);
    // Client fallback
    const ranked = params.candidateDonors.map((d) => {
      let score = 75;
      if (d.bloodGroup === params.bloodGroup) score += 15;
      if (d.availability === 'Available') score += 10;
      if (d.distanceKm < 5) score += 10;
      else if (d.distanceKm < 15) score += 5;
      score = Math.min(99, Math.max(50, score));

      return {
        donorId: d.id,
        matchScore: score,
        reason: `${d.bloodGroup} donor located ~${d.distanceKm.toFixed(1)} km away. Last donation ${d.lastDonationMonthsAgo} months ago.`,
        urgencyFit: params.urgency === 'CRITICAL' ? 'High Priority' : 'Standard Priority',
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
      recommendations: ranked,
      explanation: `Calculated compatibility for ${params.candidateDonors.length} prospective donors for ${params.bloodGroup} in ${params.location}.`,
      disclaimer:
        'AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals.',
      isFallback: true,
    };
  }
}

export async function requestBloodDemandAnalysis(params: {
  stockSummary: Array<{ bloodGroup: string; units: number; criticalLevel: number }>;
  recentRequestsCount: number;
  emergencyRequestsCount: number;
  hospitalName?: string;
}): Promise<DemandAnalysisReport> {
  try {
    const res = await fetch('/api/gemini/demand-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend Gemini demand analysis unreachable, using fallback', err);
    const lowStock = params.stockSummary
      .filter((s) => s.units <= s.criticalLevel)
      .map((s) => s.bloodGroup);

    return {
      demandSummary: `Demand Analysis for ${params.hospitalName || 'Hospital'}: Monitoring ${params.recentRequestsCount} total blood requests and ${params.emergencyRequestsCount} emergencies. ${lowStock.length > 0 ? `Critical replenishment recommended for: ${lowStock.join(', ')}.` : 'Inventory levels within normal variance.'}`,
      lowStockWarnings: lowStock.map((bg) => `Blood Group ${bg} inventory is near or below safety reserve.`),
      highDemandGroups: lowStock.length ? lowStock : ['O+', 'O-'],
      suggestedActions: [
        'Schedule targeted blood donation mobile camps for critical types',
        'Request stock equalization from regional network hospitals',
        'Reserve emergency O- negative units for trauma unit requests',
      ],
      disclaimer:
        'This analysis is an operational analytical aid and decision support tool, not a medical prediction.',
      isFallback: true,
    };
  }
}

export async function requestEmergencyAssistant(params: {
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  location: string;
  emergencyLevel: string;
  notes?: string;
}): Promise<{
  triageSummary: string;
  immediateActions: string[];
  compatibleDonorGroups: string[];
  estimatedResponseTime: string;
  disclaimer: string;
  isFallback?: boolean;
}> {
  try {
    const res = await fetch('/api/gemini/emergency-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Gemini emergency assistant unreachable, using fallback', err);
    return {
      triageSummary: `Emergency response protocol initiated for ${params.patientName} (${params.units} units of ${params.bloodGroup} at ${params.hospital}).`,
      immediateActions: [
        'Search nearby registered hospitals for live cross-matched inventory',
        'Dispatch instant donor matching notifications within 10 km',
        'Direct contact with hospital transfusion emergency supervisor',
        'Continuously track blood delivery milestones',
      ],
      compatibleDonorGroups: [params.bloodGroup, 'O-'],
      estimatedResponseTime: params.emergencyLevel === 'CRITICAL' ? '15-25 minutes' : '30-45 minutes',
      disclaimer:
        'AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals.',
      isFallback: true,
    };
  }
}

export async function requestDonorEligibilityCheck(params: {
  age: number;
  weightKg: number;
  lastDonationMonthsAgo: number;
  hasChronicConditions: boolean;
  hasRecentTattooOrSurgery: boolean;
  notes?: string;
}): Promise<EligibilityResult> {
  try {
    const res = await fetch('/api/gemini/eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Gemini eligibility unreachable, using fallback', err);
    const eligible =
      params.age >= 18 &&
      params.age <= 65 &&
      params.weightKg >= 50 &&
      params.lastDonationMonthsAgo >= 3 &&
      !params.hasRecentTattooOrSurgery;

    return {
      status: eligible ? 'Preliminary Eligible' : 'Screening Deferral Recommended',
      eligible,
      guidelines: eligible
        ? ['You meet standard age, weight, and donation interval requirements!']
        : [
            params.age < 18 || params.age > 65 ? 'Age must be between 18 and 65 years.' : '',
            params.weightKg < 50 ? 'Minimum donor weight is 50 kg.' : '',
            params.lastDonationMonthsAgo < 3 ? 'Whole blood donation requires at least a 3-month rest interval.' : '',
            params.hasRecentTattooOrSurgery ? 'Recent tattoo or major surgery requires a 6-month deferral.' : '',
          ].filter(Boolean),
      preparationTips: [
        'Drink plenty of fluids the day before and day of donation',
        'Avoid fatty foods immediately prior to donation',
        'Get at least 7-8 hours of sleep the night before',
      ],
      disclaimer:
        'This result is only a decision-support aid and does not replace professional medical screening.',
      isFallback: true,
    };
  }
}

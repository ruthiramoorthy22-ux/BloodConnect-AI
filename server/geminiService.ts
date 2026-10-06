import { GoogleGenAI, Type } from "@google/genai";

// Ensure server-side initialization with proper User-Agent header as required by skill
const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

let aiInstance: GoogleGenAI | null = null;
if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
  try {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
}

export function isGeminiConfigured(): boolean {
  return !!aiInstance;
}

export function getModelName(): string {
  return modelName;
}

// 1. AI Donor Matching
export async function matchDonorsWithGemini(params: {
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
}) {
  const disclaimer =
    "AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals.";

  if (!aiInstance) {
    // Algorithmic decision support fallback when API key is not yet set
    const ranked = params.candidateDonors.map((d) => {
      let score = 70;
      if (d.bloodGroup === params.bloodGroup) score += 15;
      if (d.availability === "Available") score += 10;
      if (d.distanceKm < 5) score += 10;
      else if (d.distanceKm < 15) score += 5;
      if (d.lastDonationMonthsAgo >= 3) score += 5;
      score = Math.min(99, Math.max(50, score));

      return {
        donorId: d.id,
        matchScore: score,
        reason: `${d.bloodGroup} donor located ~${d.distanceKm.toFixed(1)} km away. Last donated ${d.lastDonationMonthsAgo} months ago. Status: ${d.availability}.`,
        urgencyFit: params.urgency === "CRITICAL" ? "High Priority" : "Standard Priority",
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
      recommendations: ranked,
      explanation: `Analyzed ${params.candidateDonors.length} potential donors for ${params.units} unit(s) of ${params.bloodGroup} in ${params.location}. Ranked by compatibility, proximity, and donation interval.`,
      disclaimer,
      isFallback: true,
    };
  }

  try {
    const prompt = `
You are the BloodConnect AI Donor Matching Engine.
Task: Rank and score candidate donors for a blood transfusion request.

Request details:
- Required Blood Group: ${params.bloodGroup}
- Units Needed: ${params.units}
- Urgency: ${params.urgency}
- Patient Location: ${params.location}

Candidate Donors:
${JSON.stringify(params.candidateDonors, null, 2)}

Requirements:
1. Calculate a matchScore (integer 50-99) for each donor based on blood group compatibility, proximity (distanceKm), availability, age (18-65), and safe donation interval (at least 3 months / 90 days since last donation).
2. Provide a clinical rationale 'reason' for each donor without exposing private info.
3. Provide a high-level 'summary' of the matching findings.
4. Output strictly valid JSON matching the requested schema.
`;

    const response = await aiInstance.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert healthcare decision support engine for blood bank operations. Always include the required medical disclaimer. Do not make diagnostic or medical treatment assertions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  donorId: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  urgencyFit: { type: Type.STRING },
                },
                required: ["donorId", "matchScore", "reason", "urgencyFit"],
              },
            },
          },
          required: ["summary", "recommendations"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      recommendations: parsed.recommendations || [],
      explanation: parsed.summary || "Matching evaluation completed.",
      disclaimer,
      isFallback: false,
    };
  } catch (err: any) {
    console.error("Gemini matching error:", err);
    return {
      recommendations: [],
      explanation: "AI service temporarily unavailable. Please try again.",
      disclaimer,
      error: err.message,
      isFallback: true,
    };
  }
}

// 2. AI Blood Demand Analysis
export async function analyzeBloodDemandWithGemini(params: {
  stockSummary: Array<{ bloodGroup: string; units: number; criticalLevel: number }>;
  recentRequestsCount: number;
  emergencyRequestsCount: number;
  hospitalName?: string;
}) {
  const disclaimer =
    "This analysis is an operational analytical aid and decision support tool, not a medical prediction.";

  if (!aiInstance) {
    const lowStock = params.stockSummary
      .filter((s) => s.units <= s.criticalLevel)
      .map((s) => s.bloodGroup);

    return {
      demandSummary: `Analysis for ${params.hospitalName || "Hospital Network"}: ${params.recentRequestsCount} recent requests with ${params.emergencyRequestsCount} emergencies recorded. ${lowStock.length > 0 ? `Urgent replenishment recommended for: ${lowStock.join(", ")}.` : "Stock levels are currently within safe margins."}`,
      lowStockWarnings: lowStock.map(
        (bg) => `Blood group ${bg} is below or at its critical reserve threshold.`
      ),
      highDemandGroups: lowStock.length ? lowStock : ["O+", "O-"],
      suggestedActions: [
        "Issue localized targeted mobile donor alerts for low-stock types",
        "Coordinate inter-hospital transfer of surplus reserve units",
        "Prioritize critical request fulfillments in the emergency triage queue",
      ],
      disclaimer,
      isFallback: true,
    };
  }

  try {
    const prompt = `
Analyze current hospital blood stock levels and recent request velocity:
Hospital: ${params.hospitalName || "Regional Blood Bank"}
Current Inventory: ${JSON.stringify(params.stockSummary, null, 2)}
Recent Requests Total: ${params.recentRequestsCount}
Active Emergency Requests: ${params.emergencyRequestsCount}

Generate:
1. An operational demandSummary.
2. An array of lowStockWarnings.
3. An array of highDemandGroups.
4. Suggested inventory and donor drive actions.
`;

    const response = await aiInstance.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction:
          "You are an analytical assistant for blood banking logistics. Provide actionable, concise advice.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            demandSummary: { type: Type.STRING },
            lowStockWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            highDemandGroups: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "demandSummary",
            "lowStockWarnings",
            "highDemandGroups",
            "suggestedActions",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      ...parsed,
      disclaimer,
      isFallback: false,
    };
  } catch (err: any) {
    console.error("Gemini demand analysis error:", err);
    return {
      demandSummary: "AI analytics temporarily unavailable.",
      lowStockWarnings: [],
      highDemandGroups: [],
      suggestedActions: ["Maintain routine stock audits."],
      disclaimer,
      error: err.message,
      isFallback: true,
    };
  }
}

// 3. AI Emergency Assistant
export async function emergencyAssistantWithGemini(params: {
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  location: string;
  emergencyLevel: string;
  notes?: string;
}) {
  const disclaimer =
    "AI-generated recommendation. Final donor eligibility and medical decisions must be confirmed by qualified healthcare professionals.";

  if (!aiInstance) {
    return {
      triageSummary: `CRITICAL TRIAGE: ${params.emergencyLevel} request for ${params.units} unit(s) of ${params.bloodGroup} blood at ${params.hospital}, ${params.location}.`,
      immediateActions: [
        "Broadcast instant high-priority alert to nearest verified blood banks holding compatible stock.",
        "Filter and notify top available donors within a 10 km radius.",
        "Alert the emergency desk and transfusion coordinator at the target hospital.",
        "Monitor live dispatch via request tracking pipeline.",
      ],
      compatibleDonorGroups:
        params.bloodGroup === "O-"
          ? ["O-"]
          : params.bloodGroup === "O+"
          ? ["O+", "O-"]
          : params.bloodGroup === "A-"
          ? ["A-", "O-"]
          : params.bloodGroup === "A+"
          ? ["A+", "A-", "O+", "O-"]
          : params.bloodGroup === "B-"
          ? ["B-", "O-"]
          : params.bloodGroup === "B+"
          ? ["B+", "B-", "O+", "O-"]
          : params.bloodGroup === "AB-"
          ? ["AB-", "A-", "B-", "O-"]
          : ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
      estimatedResponseTime: params.emergencyLevel === "CRITICAL" ? "15-30 minutes" : "45-60 minutes",
      disclaimer,
      isFallback: true,
    };
  }

  try {
    const prompt = `
Emergency Blood Request Details:
Patient: ${params.patientName}
Blood Group: ${params.bloodGroup}
Units Needed: ${params.units}
Hospital: ${params.hospital}
Location: ${params.location}
Emergency Level: ${params.emergencyLevel}
Additional Notes: ${params.notes || "None"}

Please evaluate:
1. Immediate triage summary and priority assessment.
2. 4 concise sequential next system actions (hospitals search, stock reservation, donor match, dispatch tracking).
3. Compatible blood donor groups.
4. Estimated operational response time window.
`;

    const response = await aiInstance.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction:
          "You are the BloodConnect AI Emergency Response Assistant. Prioritize rapid triage and protocol adherence. Final decisions must be confirmed by qualified medical staff.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageSummary: { type: Type.STRING },
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            compatibleDonorGroups: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedResponseTime: { type: Type.STRING },
          },
          required: [
            "triageSummary",
            "immediateActions",
            "compatibleDonorGroups",
            "estimatedResponseTime",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      ...parsed,
      disclaimer,
      isFallback: false,
    };
  } catch (err: any) {
    console.error("Gemini emergency assistant error:", err);
    return {
      triageSummary: `Emergency alert for ${params.units} unit(s) of ${params.bloodGroup}.`,
      immediateActions: [
        "Notify nearby hospitals immediately.",
        "Check donor availability in area.",
      ],
      compatibleDonorGroups: [params.bloodGroup],
      estimatedResponseTime: "Pending contact",
      disclaimer,
      error: err.message,
      isFallback: true,
    };
  }
}

// 4. AI Donor Eligibility Screening Assistant
export async function checkDonorEligibilityWithGemini(params: {
  age: number;
  weightKg: number;
  lastDonationMonthsAgo: number;
  hasChronicConditions: boolean;
  hasRecentTattooOrSurgery: boolean;
  notes?: string;
}) {
  const disclaimer =
    "This result is only a decision-support aid and does not replace professional medical screening.";

  if (!aiInstance) {
    let eligible = true;
    const reasons: string[] = [];

    if (params.age < 18 || params.age > 65) {
      eligible = false;
      reasons.push("Standard blood donor age requirement is 18 to 65 years.");
    }
    if (params.weightKg < 50) {
      eligible = false;
      reasons.push("Donor weight must be at least 50 kg for whole blood donation.");
    }
    if (params.lastDonationMonthsAgo < 3) {
      eligible = false;
      reasons.push(
        `A safe interval of at least 3 months (90 days) is recommended between donations (last donated ${params.lastDonationMonthsAgo} months ago).`
      );
    }
    if (params.hasRecentTattooOrSurgery) {
      eligible = false;
      reasons.push(
        "A deferral period of 6 to 12 months is standard after tattoos, piercings, or major surgery."
      );
    }
    if (params.hasChronicConditions) {
      reasons.push("Requires in-person consultation with blood bank physician.");
    }

    return {
      status: eligible ? "Likely Eligible" : "Temporarily Deferred / Ineligible",
      eligible,
      guidelines: reasons.length
        ? reasons
        : ["Meets preliminary criteria for whole blood donation!"],
      preparationTips: [
        "Hydrate with 500ml water before donation",
        "Eat a healthy, iron-rich meal 2-3 hours prior",
        "Bring government-issued photo identification",
      ],
      disclaimer,
      isFallback: true,
    };
  }

  try {
    const prompt = `
Evaluate blood donor candidate preliminary criteria:
- Age: ${params.age}
- Weight: ${params.weightKg} kg
- Months since last donation: ${params.lastDonationMonthsAgo}
- Chronic conditions reported: ${params.hasChronicConditions}
- Recent tattoo or surgery (<6 mos): ${params.hasRecentTattooOrSurgery}
- Additional health notes: ${params.notes || "None"}

Requirements:
1. Provide a status ("Likely Eligible", "Temporarily Deferred", "Medical Screening Required").
2. Boolean eligible field.
3. List of guidelines or deferral reasons.
4. 3 practical preparation tips.
`;

    const response = await aiInstance.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction:
          "You are an educational and triage assistant for blood donation screening. Emphasize that actual eligibility is determined on-site by medical technicians via hemoglobin tests, blood pressure, and medical history.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            eligible: { type: Type.BOOLEAN },
            guidelines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            preparationTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["status", "eligible", "guidelines", "preparationTips"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      ...parsed,
      disclaimer,
      isFallback: false,
    };
  } catch (err: any) {
    console.error("Gemini eligibility check error:", err);
    return {
      status: "Medical Screening Required",
      eligible: false,
      guidelines: ["AI screening temporarily unavailable. Please consult on-site medical staff."],
      preparationTips: ["Consult hospital donation center directly."],
      disclaimer,
      error: err.message,
      isFallback: true,
    };
  }
}

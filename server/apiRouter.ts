import type { IncomingMessage, ServerResponse } from "http";
import {
  matchDonorsWithGemini,
  analyzeBloodDemandWithGemini,
  emergencyAssistantWithGemini,
  checkDonorEligibilityWithGemini,
  isGeminiConfigured,
  getModelName,
} from "./geminiService";

export function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url || "";

  if (!url.startsWith("/api/")) {
    return next();
  }

  // Set standard headers
  res.setHeader("Content-Type", "application/json");

  // Status check endpoint
  if (url === "/api/config-status" && req.method === "GET") {
    const mapsKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
    return res.end(
      JSON.stringify({
        hasGeminiKey: isGeminiConfigured(),
        geminiModel: getModelName(),
        hasGoogleMapsKey: !!mapsKey,
        isDemoKey: mapsKey.startsWith("AIzaSyAzS"),
        firebaseConfigured: !!process.env.VITE_FIREBASE_PROJECT_ID,
      })
    );
  }

  // Parse JSON body for POST endpoints
  if (req.method === "POST") {
    let bodyStr = "";
    req.on("data", (chunk) => {
      bodyStr += chunk;
    });

    req.on("end", async () => {
      let body: any = {};
      try {
        if (bodyStr) body = JSON.parse(bodyStr);
      } catch (e) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Invalid JSON body" }));
      }

      try {
        if (url === "/api/gemini/match") {
          const result = await matchDonorsWithGemini(body);
          return res.end(JSON.stringify(result));
        }

        if (url === "/api/gemini/demand-analysis") {
          const result = await analyzeBloodDemandWithGemini(body);
          return res.end(JSON.stringify(result));
        }

        if (url === "/api/gemini/emergency-assistant") {
          const result = await emergencyAssistantWithGemini(body);
          return res.end(JSON.stringify(result));
        }

        if (url === "/api/gemini/eligibility") {
          const result = await checkDonorEligibilityWithGemini(body);
          return res.end(JSON.stringify(result));
        }

        res.statusCode = 404;
        return res.end(JSON.stringify({ error: `Not found: ${url}` }));
      } catch (err: any) {
        console.error("API error:", err);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message || "Internal server error" }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: "Method not allowed" }));
}

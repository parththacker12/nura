import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel in AI Studio Settings.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, profile, timeline } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `You are NURA, a warm, calm, emotionally intelligent menopause health companion for Meera Nair (52, perimenopause). You have access to her logged symptoms, sleep, mood, medications, and timeline. Your role is to listen, organize, summarize, spot patterns, and help her prepare for doctor visits. You are supportive and reassuring, never clinical or alarming. CRITICAL: you are NOT a diagnostic tool - you never diagnose, prescribe, or replace a doctor. When something may be medically important (for example new bleeding or palpitations), gently encourage her to discuss it with Dr. Ananya Desai and offer to add it to her doctor report. Reference her actual logged data (dates, counts, trends) when relevant. Keep replies short, human, and kind.

Patient Profile:
- Name: ${profile.name}
- Age: ${profile.age}
- Location: ${profile.location}
- Menopause Stage: ${profile.menopauseStage}
- Last Period Details: ${profile.lastPeriodInfo}
- Symptoms Tracked: ${profile.symptoms.join(", ")}
- Medical History: ${profile.medicalHistory.join("; ")}
- Medications & Supplements: ${profile.currentMedications.join("; ")}
- Goals: ${profile.goals.join("; ")}
- Upcoming Appointment: ${profile.upcomingAppointment.doctor} (${profile.upcomingAppointment.specialty}) on ${profile.upcomingAppointment.date}

Current Patient Log History:
${timeline.map((e: any) => `- ${e.date}: Sleep ${e.sleep.duration} (${e.sleep.quality}, ${e.sleep.nightSweatCount} night sweats), Energy ${e.energy}/10, Mood: ${e.mood}, Symptoms: ${e.symptoms.join(", ") || 'none'}. Notes: ${e.notes || 'None'}. AI Summary: ${e.aiSummary || 'None'}`).join("\n")}
`;

      const contents = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Chat Error:", err);
      res.status(500).json({ error: err.message || "Failed to communicate with Gemini." });
    }
  });

  app.post("/api/generate-report", async (req, res) => {
    try {
      const { profile, timeline } = req.body;
      const ai = getGeminiClient();

      const prompt = `You are a clinical assistant helping a perimenopausal patient prepare a doctor-ready clinical summary report of her symptoms and log history for her upcoming gynecologist appointment.

Please analyze the following patient profile and timeline log data, and generate a structured, highly professional, clean, print-friendly clinical summary.

Patient Profile:
- Name: ${profile.name}
- Age: ${profile.age}
- Location: ${profile.location}
- Menopause Stage: ${profile.menopauseStage}
- Last Period Details: ${profile.lastPeriodInfo}
- Symptoms: ${profile.symptoms.join(", ")}
- Medical History: ${profile.medicalHistory.join("; ")}
- Current Medications: ${profile.currentMedications.join("; ")}
- Goals: ${profile.goals.join("; ")}
- Appointment: ${profile.upcomingAppointment.doctor}, specialty ${profile.upcomingAppointment.specialty}, date ${profile.upcomingAppointment.date}

Timeline Logs:
${timeline.map((e: any) => `- ${e.date}: Sleep ${e.sleep.duration} (${e.sleep.quality}, ${e.sleep.nightSweatCount} night sweats), Energy ${e.energy}/10, Mood: ${e.mood}, Symptoms: ${e.symptoms.join(", ") || 'none'}. Notes: ${e.notes || 'None'}. AI Summary: ${e.aiSummary || 'None'}`).join("\n")}

Format the response strictly using markdown (with beautiful tables and bullets) so it contains exactly these sections, but tailored to any updates in the patient's log data if they added more logs:

1. **CLINICAL SUMMARY (NURA) - Prepared for ${profile.upcomingAppointment.doctor}, ${profile.upcomingAppointment.date}**
   - **Patient Details**: Name, Age, Stage, Reporting Period (from start of timeline logs to today)
   - **Overview**: A concise clinical paragraph summarizing her trends over the reporting period (e.g., worsening sleep, night sweats, fatigue, irritability, and important flags like light spotting on 1 Jul or palpitations on 7 Jul).

2. **SYMPTOM TRACKING SUMMARY**
   Present a clear table with columns: **Symptom**, **Frequency/Details**, **Severity**, and **Trend**.
   List the tracked symptoms (e.g., Hot flashes, Night sweats, Sleep disturbance, Brain fog, Mood, Fatigue, Joint aches, Abnormal bleeding, Palpitations) based on the logged data. If any new symptoms are logged in the data, include them as well!

3. **CURRENT MEDICATIONS & SUPPLEMENTS**
   Summarize her current medications and supplements, and if she's on HRT.

4. **RELEVANT CLINICAL HISTORY**
   Summarize her medical history and family history.

5. **PATIENT CONCERNS & SUGGESTED QUESTIONS TO DISCUSS**
   List the main questions she should discuss with her doctor (such as appropriateness of HRT, spotting after 4 months of no bleeding, managing sleep, bone-health screening based on mother's osteoporosis, and palpitations on 7 Jul).

6. **PATTERNS & CLINICAL OBSERVATIONS (NON-DIAGNOSTIC)**
   List any patterns noticed, such as correlation of sleep decline with night sweats, afternoon hot flash clusters, etc.

7. **FOOTER DISCLAIMER**
   Add this exact disclaimer: "NURA supports your consultation and does not diagnose or replace medical advice."

Make sure the output is professional, objective, clinically minded, and clean for a doctor to read. Use clean Markdown formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Report Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate report." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

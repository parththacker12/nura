/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Heart,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Check,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Info,
  Mic,
  Smile,
  Shield,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { UserProfile, TimelineEntry, ChatMessage, ViewType } from './types';
import { SEEDED_USER, SEEDED_TIMELINE, SEEDED_WEEKLY_SUMMARIES } from './data';

export default function App() {
  // Navigation & Auth State
  const [currentView, setCurrentView] = useState<ViewType>('Landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User Profile & Timeline State (Single Source of Truth)
  const [profile, setProfile] = useState<UserProfile>(SEEDED_USER);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(SEEDED_TIMELINE);

  // Billing period state ('1month' | '3months' | '12months')
  const [billingPeriod, setBillingPeriod] = useState<'1month' | '3months' | '12months'>('1month');

  // Auth Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<UserProfile>({ ...SEEDED_USER });

  // Quick Add Sheet State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaSymptoms, setQaSymptoms] = useState<string[]>([]);
  const [qaMood, setQaMood] = useState('good');
  const [qaSleepDuration, setQaSleepDuration] = useState('6h 30m');
  const [qaSleepQuality, setQaSleepQuality] = useState<'good' | 'average' | 'poor' | 'restless'>('good');
  const [qaNightSweats, setQaNightSweats] = useState(0);
  const [qaEnergy, setQaEnergy] = useState(6);
  const [qaNotes, setQaNotes] = useState('');
  const [qaVoiceRecording, setQaVoiceRecording] = useState(false);
  const [qaVoiceText, setQaVoiceText] = useState('');
  const [qaMeds, setQaMeds] = useState<{ name: string; taken: boolean }[]>([
    { name: 'Thyroxine 50 mcg', taken: true },
    { name: 'Calcium + Vitamin D', taken: true },
    { name: 'Magnesium glycinate', taken: false }
  ]);

  // Timeline UI Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'symptom' | 'sleep' | 'mood'>('all');

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'seed-1',
      role: 'user',
      content: "I've been waking up sweaty."
    },
    {
      id: 'seed-2',
      role: 'model',
      content: "I'm sorry, that sounds exhausting. I've noticed 4 night sweats this week - up from 1 last week. Would you like me to add this to your doctor's report?"
    },
    {
      id: 'seed-3',
      role: 'user',
      content: 'How have I been this month?'
    },
    {
      id: 'seed-4',
      role: 'model',
      content: 'Over the last few weeks your sleep has dropped from about 6.5 to 5.2 hours, hot flashes have increased (mostly afternoons), and you had light spotting on 1 July - your first in about 4 months. Fatigue and irritability have crept up alongside the poor sleep.'
    },
    {
      id: 'seed-5',
      role: 'user',
      content: 'Should I be worried about the spotting?'
    },
    {
      id: 'seed-6',
      role: 'model',
      content: "I understand why that's on your mind. I can't diagnose it, but new bleeding after months without a period is worth flagging. I've noted it for Dr. Desai on 17 July, and I'd gently suggest raising it early in your visit."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Doctor Report State
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState('');

  // Global Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Pre-fill default Doctor Report
  useEffect(() => {
    const formattedDate = '17 Jul 2026';
    const reportingPeriod = '9 Jun to 11 Jul 2026';
    const defaultMarkdown = `# CLINICAL SUMMARY (NURA)
*Prepared for Dr. Ananya Desai, ${formattedDate}*

- **Patient**: ${profile.name}, Age ${profile.age}
- **Stage**: ${profile.menopauseStage}
- **Reporting Period**: ${reportingPeriod}
- **Status Summary**: Ready for Review

---

## 1. CLINICAL OVERVIEW
Over the past ~6 weeks, Meera reports worsening sleep, increasing hot flashes and night sweats, rising fatigue and irritability, and a single episode of light spotting on 1 Jul (first bleeding in about 4 months). She has also noted a brief episode of palpitations on 7 Jul.

---

## 2. SYMPTOM TRACKING SUMMARY

| Symptom | Frequency / Details | Severity | Trend |
| :--- | :--- | :--- | :--- |
| **Hot flashes** | 3 to 4 per day | Moderate | Increasing (afternoon-clustered) |
| **Night sweats** | 4 per week | Moderate to severe | Increasing |
| **Sleep disturbance** | Nightly (avg 5.2h) | Moderate | Worsening |
| **Brain fog** | 4 to 5 per week | Mild to moderate | Stable to increasing |
| **Mood (irritability/anxiety)**| Frequent | Moderate | Increasing |
| **Fatigue** | Daily | Moderate | Increasing |
| **Joint aches** | About 3 per week (knees) | Mild | Stable |
| **Abnormal bleeding** | Spotting 1 Jul (first in ~4m) | Mild | **FLAG** |
| **Palpitations** | 1 brief episode (7 Jul) | Mild | **FLAG** |

---

## 3. CURRENT MEDICATIONS & SUPPLEMENTS
- Thyroxine 50 mcg daily (morning)
- Calcium + Vitamin D daily
- Magnesium glycinate at night
- Occasional Paracetamol for joint pain
- *No Hormone Replacement Therapy (HRT) at present.*

---

## 4. RELEVANT CLINICAL HISTORY
- **Hypothyroidism** (Managed with Thyroxine)
- **Borderline hypertension**
- **Family History**: Osteoporosis (Mother)

---

## 5. SUGGESTED DISCUSSION QUESTIONS
1. **Hormone Replacement Therapy**: Is HRT appropriate for me given my symptom severity and thyroid management?
2. **Abnormal Spotting**: Discuss the single episode of light spotting on 1 Jul after 4 months of cessation.
3. **Sleep & Night Sweats**: Options to manage sleep decline (down to 5.2h) and nightly wake-ups.
4. **Bone-Health Screening**: Should we schedule a DEXA scan or other bone density checks given family history (mother)?
5. **Brief Palpitations**: Is the brief, single racing-heart episode on 7 Jul typical for hot flashes?

---

## 6. PATTERNS & CLINICAL OBSERVATIONS (NON-DIAGNOSTIC)
- **Sleep Decline Correlation**: Sleep duration reduction directly correlates with nights when night sweats are logged.
- **Diurnal Symptom Clustering**: Hot flashes cluster primarily between 2:00 PM and 5:00 PM, impacting afternoon work.

---

*NURA supports your consultation and does not diagnose or replace medical advice.*`;

    setReportMarkdown(defaultMarkdown);
  }, [profile]);

  // Auth Action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'admin' && password.trim() === 'admin') {
      setIsLoggedIn(true);
      setProfile({ ...SEEDED_USER });
      setLoginError('');
      setCurrentView('Dashboard');
      showToast('Successfully logged in as admin!');
    } else {
      setLoginError('Invalid username or password. Use demo credentials (admin/admin).');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('Landing');
    showToast('Logged out successfully.', 'info');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to onboarding questionnaire
    setCurrentView('Onboarding');
    setOnboardingStep(0);
    setOnboardingData({ ...SEEDED_USER });
  };

  // Onboarding Steps Data
  const onboardingQuestions = [
    {
      id: 'age',
      title: "How old are you?",
      description: "Menopause typically occurs between ages 45 and 60.",
      input: (
        <input
          type="number"
          value={onboardingData.age}
          onChange={(e) => setOnboardingData({ ...onboardingData, age: Number(e.target.value) })}
          className="w-full p-4 border border-[#8A8391]/30 rounded-xl text-lg bg-white text-[#2D2A32] focus:outline-none focus:ring-2 focus:ring-[#5B4B6E]"
        />
      )
    },
    {
      id: 'stage',
      title: "What is your current menopause stage?",
      description: "If you're unsure, choose your best guess.",
      input: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Premenopause', 'Perimenopause', 'Postmenopause'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setOnboardingData({ ...onboardingData, menopauseStage: s })}
              className={`p-4 rounded-xl border text-left transition-all ${
                onboardingData.menopauseStage === s
                  ? 'border-[#5B4B6E] bg-[#5B4B6E]/5 font-semibold text-[#5B4B6E]'
                  : 'border-[#8A8391]/20 bg-white hover:border-[#8A8391]'
              }`}
            >
              <div className="font-semibold text-[#2D2A32]">{s}</div>
              <div className="text-xs text-[#8A8391] mt-1">
                {s === 'Premenopause' && 'Regular periods, early symptoms.'}
                {s === 'Perimenopause' && 'Irregular periods, active symptoms.'}
                {s === 'Postmenopause' && 'No period for 12+ months.'}
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'lastPeriod',
      title: "Tell us about your last menstrual period",
      description: "Any irregular spotting or duration since your last cycle?",
      input: (
        <input
          type="text"
          value={onboardingData.lastPeriodInfo}
          onChange={(e) => setOnboardingData({ ...onboardingData, lastPeriodInfo: e.target.value })}
          className="w-full p-4 border border-[#8A8391]/30 rounded-xl text-lg bg-white text-[#2D2A32] focus:outline-none focus:ring-2 focus:ring-[#5B4B6E]"
          placeholder="e.g., Irregular for 12 months; last spotting on 1 Jul."
        />
      )
    },
    {
      id: 'symptoms',
      title: "Select your main symptoms",
      description: "What have you been experiencing recently? (Select all that apply)",
      input: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
          {[
            'hot flashes',
            'night sweats',
            'sleep disturbance',
            'brain fog',
            'mood changes',
            'irritability',
            'anxiety',
            'fatigue',
            'joint aches',
            'headache',
            'palpitations',
            'spotting'
          ].map((sym) => {
            const isSelected = onboardingData.symptoms.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? onboardingData.symptoms.filter((x) => x !== sym)
                    : [...onboardingData.symptoms, sym];
                  setOnboardingData({ ...onboardingData, symptoms: updated });
                }}
                className={`p-3 rounded-xl border text-center text-sm capitalize transition-all ${
                  isSelected
                    ? 'border-[#8BA888] bg-[#8BA888]/10 text-[#5B4B6E] font-semibold'
                    : 'border-[#8A8391]/20 bg-white text-[#2D2A32] hover:border-[#8A8391]'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      )
    },
    {
      id: 'history',
      title: "Do you have any medical history?",
      description: "Such as thyroid conditions, blood pressure, family histories.",
      input: (
        <div className="space-y-2">
          {['hypothyroidism', 'borderline high blood pressure', 'family history of osteoporosis (mother)', 'No HRT yet'].map((hist) => {
            const isSelected = onboardingData.medicalHistory.includes(hist);
            return (
              <button
                key={hist}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? onboardingData.medicalHistory.filter((x) => x !== hist)
                    : [...onboardingData.medicalHistory, hist];
                  setOnboardingData({ ...onboardingData, medicalHistory: updated });
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#5B4B6E] bg-[#5B4B6E]/5 text-[#5B4B6E]'
                    : 'border-[#8A8391]/20 bg-white text-[#2D2A32]'
                }`}
              >
                <span>{hist}</span>
                {isSelected ? <Check className="w-4 h-4 text-[#5B4B6E]" /> : <div className="w-4 h-4 border rounded" />}
              </button>
            );
          })}
        </div>
      )
    },
    {
      id: 'medications',
      title: "Current medications & supplements",
      description: "List what you take daily or occasionally.",
      input: (
        <div className="space-y-2">
          {['Thyroxine 50 mcg every morning', 'Calcium + Vitamin D daily', 'Magnesium glycinate at night', 'occasional Paracetamol for joint pain'].map((med) => {
            const isSelected = onboardingData.currentMedications.includes(med);
            return (
              <button
                key={med}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? onboardingData.currentMedications.filter((x) => x !== med)
                    : [...onboardingData.currentMedications, med];
                  setOnboardingData({ ...onboardingData, currentMedications: updated });
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#5B4B6E] bg-[#5B4B6E]/5 text-[#5B4B6E]'
                    : 'border-[#8A8391]/20 bg-white text-[#2D2A32]'
                }`}
              >
                <span>{med}</span>
                {isSelected ? <Check className="w-4 h-4 text-[#5B4B6E]" /> : <div className="w-4 h-4 border rounded" />}
              </button>
            );
          })}
        </div>
      )
    },
    {
      id: 'goals',
      title: "What are your primary goals with NURA?",
      description: "Select everything you wish to achieve.",
      input: (
        <div className="space-y-2">
          {['sleep better', 'understand my symptom patterns', 'prepare confidently for my doctor visit', 'feel like myself again'].map((goal) => {
            const isSelected = onboardingData.goals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? onboardingData.goals.filter((x) => x !== goal)
                    : [...onboardingData.goals, goal];
                  setOnboardingData({ ...onboardingData, goals: updated });
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#5B4B6E] bg-[#5B4B6E]/5 text-[#5B4B6E]'
                    : 'border-[#8A8391]/20 bg-white text-[#2D2A32]'
                }`}
              >
                <span className="first-letter:uppercase">{goal}</span>
                {isSelected ? <Check className="w-4 h-4 text-[#5B4B6E]" /> : <div className="w-4 h-4 border rounded" />}
              </button>
            );
          })}
        </div>
      )
    }
  ];

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingQuestions.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Completed Onboarding
      setIsLoggedIn(true);
      setProfile({
        ...onboardingData,
        name: 'Meera Nair', // Keep pre-filled seed name
        location: 'Bengaluru, India',
        membership: 'Free'
      });
      setCurrentView('Dashboard');
      showToast('Onboarding completed successfully! Welcome, Meera.');
    }
  };

  const handleOnboardingPrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Chat API Call
  const handleSendChatMessage = async (contentToSend?: string) => {
    const textToSend = contentToSend || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!contentToSend) setChatInput('');
    setChatLoading(true);

    const pendingModelMsg: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: 'model',
      content: '',
      isPending: true
    };
    setChatMessages((prev) => [...prev, pendingModelMsg]);

    try {
      // Clean previous system/pending messages from the body context
      const messagesPayload = chatMessages
        .filter((m) => !m.isPending)
        .concat(userMsg)
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          profile,
          timeline
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      setChatMessages((prev) =>
        prev.map((m) =>
          m.isPending ? { id: `model-${Date.now()}`, role: 'model', content: data.text } : m
        )
      );
    } catch (err) {
      console.error(err);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.isPending
            ? {
                id: `model-${Date.now()}`,
                role: 'model',
                content: "I'm having trouble connecting to the NURA AI service. Please make sure your GEMINI_API_KEY is configured in AI Studio secrets. Here is Meera's in-memory data recommendation: remember to rest and discuss the 1 July spotting with your specialist."
              }
            : m
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Generate Doctor Report live via Gemini API
  const handleGenerateReportLive = async () => {
    setReportGenerating(true);
    setReportSuccessMessage('');
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, timeline })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report.');
      }

      const data = await response.json();
      setReportMarkdown(data.text);
      setReportSuccessMessage('Clinical summary regenerated live using your current symptom logs!');
      showToast('Report updated with live Gemini analysis!');
    } catch (err) {
      console.error(err);
      showToast('Using local backup summary due to network/API key state.', 'info');
      setReportSuccessMessage('Loaded local clinical model based on current logs.');
    } finally {
      setReportGenerating(false);
    }
  };

  // Quick Add / Symptom Log Action
  const handleSaveQuickAdd = () => {
    // Prep new entry
    const newEntry: TimelineEntry = {
      id: `entry-custom-${Date.now()}`,
      date: '11 Jul 2026', // Simulated Today
      sleep: {
        duration: qaSleepDuration,
        quality: qaSleepQuality,
        nightSweatCount: qaNightSweats
      },
      energy: qaEnergy,
      mood: qaMood,
      symptoms: qaSymptoms,
      medications: qaMeds,
      notes: qaNotes || undefined,
      voiceNote: qaVoiceRecording,
      aiSummary: qaSymptoms.length > 0
        ? `Logged ${qaSymptoms.join(', ')}. Keep tracking patterns.`
        : 'Logged clean day. Well done!'
    };

    // Prepend to timeline state
    setTimeline([newEntry, ...timeline]);

    // Update profile tracking symptoms dynamically if new ones were clicked
    const currentSymptoms = [...profile.symptoms];
    qaSymptoms.forEach((s) => {
      if (!currentSymptoms.includes(s)) {
        currentSymptoms.push(s);
      }
    });
    setProfile({
      ...profile,
      symptoms: currentSymptoms
    });

    // Reset QA state
    setQaSymptoms([]);
    setQaNotes('');
    setQaVoiceRecording(false);
    setQaVoiceText('');
    setShowQuickAdd(false);

    showToast('Symptoms logged successfully to today!');
  };

  // Trigger simulated voice recording
  const startVoiceRecording = () => {
    setQaVoiceRecording(true);
    setQaVoiceText('Transcribing...');
    setTimeout(() => {
      setQaVoiceText('\"Woke up at 3:15 with heavy night sweat, felt very anxious, then slept for another 2 hours. Took thyroid medication.\"');
      // Auto fill form based on simulated transcription
      setQaNightSweats(1);
      setQaSleepQuality('restless');
      setQaSleepDuration('5h 15m');
      setQaMood('anxious');
      if (!qaSymptoms.includes('night sweats')) {
        setQaSymptoms([...qaSymptoms, 'night sweats', 'anxiety']);
      }
      setQaNotes('Woke up at 3:15 with heavy night sweat, felt very anxious.');
    }, 2500);
  };

  // Filtered Timeline
  const filteredTimeline = timeline.filter((entry) => {
    // Search filter
    const matchesSearch =
      entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Chip filter
    if (selectedFilter === 'symptom') return entry.symptoms.length > 0;
    if (selectedFilter === 'sleep') return entry.sleep.nightSweatCount > 0 || entry.sleep.quality === 'restless';
    if (selectedFilter === 'mood') return entry.mood === 'irritable' || entry.mood === 'low' || entry.mood === 'anxious';

    return true;
  });

  return (
    <div id="app-root" className="min-h-screen bg-[#FBF7F2] text-[#2D2A32] flex flex-col font-sans transition-all">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg bg-[#5B4B6E] text-white border border-[#E08D79]/30">
          <Sparkles className="w-5 h-5 text-[#E08D79]" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Demo Prototype Indicator Badge */}
      <div className="bg-[#5B4B6E] text-white text-xs px-4 py-2 flex justify-between items-center z-40 border-b border-[#E08D79]/20">
        <div className="flex items-center gap-2">
          <span className="bg-[#E08D79] text-[#2D2A32] font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">Demo Mode</span>
          <span className="hidden sm:inline">NURA is a stateless perimenopause health companion. Pre-filled with seed user data (Meera Nair).</span>
          <span className="sm:hidden">Stateless perimenopause demo.</span>
        </div>
        <div className="group relative flex items-center gap-1 cursor-pointer underline decoration-dotted">
          <Info className="w-3.5 h-3.5" />
          <span>About Seed Data</span>
          <div className="pointer-events-none absolute right-0 top-6 w-72 p-3 bg-white text-[#2D2A32] rounded-xl shadow-xl border border-[#8A8391]/20 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
            <strong>Meera Nair, 52</strong> from Bengaluru, India.<br />
            - Perimenopause (Irregular cycles; last period ~4 months ago, then light spotting on 1 Jul 2026).<br />
            - Hypothyroidism (Thyroxine 50mcg).<br />
            - Upcoming Appointment: Dr. Ananya Desai on 17 Jul 2026.
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* SIDEBAR NAVIGATION - Displayed only if Logged In */}
        {isLoggedIn && (
          <>
            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#8A8391]/10 p-6 shrink-0 justify-between">
              <div className="space-y-8">
                {/* Brand Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('Dashboard')}>
                  <div className="w-10 h-10 rounded-xl bg-[#5B4B6E]/5 flex items-center justify-center border border-[#5B4B6E]/10">
                    <Heart className="w-6 h-6 text-[#5B4B6E]" />
                  </div>
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#5B4B6E]">NURA</span>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5">
                  <button
                    onClick={() => setCurrentView('Dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentView === 'Dashboard'
                        ? 'bg-[#5B4B6E] text-white shadow-sm shadow-[#5B4B6E]/15'
                        : 'text-[#8A8391] hover:text-[#5B4B6E] hover:bg-[#FBF7F2]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('Timeline')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentView === 'Timeline'
                        ? 'bg-[#5B4B6E] text-white shadow-sm shadow-[#5B4B6E]/15'
                        : 'text-[#8A8391] hover:text-[#5B4B6E] hover:bg-[#FBF7F2]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Symptom Timeline</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('Chat')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentView === 'Chat'
                        ? 'bg-[#5B4B6E] text-white shadow-sm shadow-[#5B4B6E]/15'
                        : 'text-[#8A8391] hover:text-[#5B4B6E] hover:bg-[#FBF7F2]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="flex-1 text-left">AI Chat Companion</span>
                    <span className="bg-[#E08D79] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Gemini</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('DoctorReport')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentView === 'DoctorReport'
                        ? 'bg-[#5B4B6E] text-white shadow-sm shadow-[#5B4B6E]/15'
                        : 'text-[#8A8391] hover:text-[#5B4B6E] hover:bg-[#FBF7F2]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Doctor Ready Report</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('Subscription')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentView === 'Subscription'
                        ? 'bg-[#5B4B6E] text-white shadow-sm shadow-[#5B4B6E]/15'
                        : 'text-[#8A8391] hover:text-[#5B4B6E] hover:bg-[#FBF7F2]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>NURA+ Premium</span>
                  </button>
                </nav>
              </div>

              {/* Sidebar Profile Card footer */}
              <div className="border-t border-[#8A8391]/10 pt-4 mt-6">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FBF7F2] border border-[#8A8391]/5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#5B4B6E] text-white flex items-center justify-center font-bold text-sm">
                      MN
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D2A32] leading-tight">{profile.name}</h4>
                      <p className="text-[10px] text-[#8A8391] leading-tight">Age {profile.age} • Bengaluru</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-1 hover:text-red-500 rounded transition-colors" title="Log out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#8A8391]/10 z-40 flex items-center justify-around py-2.5 px-2">
              <button
                onClick={() => setCurrentView('Dashboard')}
                className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  currentView === 'Dashboard' ? 'text-[#5B4B6E]' : 'text-[#8A8391]'
                }`}
              >
                <Layers className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentView('Timeline')}
                className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  currentView === 'Timeline' ? 'text-[#5B4B6E]' : 'text-[#8A8391]'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setCurrentView('Chat')}
                className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  currentView === 'Chat' ? 'text-[#5B4B6E]' : 'text-[#8A8391]'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>AI Chat</span>
              </button>
              <button
                onClick={() => setCurrentView('DoctorReport')}
                className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  currentView === 'DoctorReport' ? 'text-[#5B4B6E]' : 'text-[#8A8391]'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Report</span>
              </button>
              <button
                onClick={() => setCurrentView('Subscription')}
                className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  currentView === 'Subscription' ? 'text-[#5B4B6E]' : 'text-[#8A8391]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>NURA+</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                <span>Exit</span>
              </button>
            </nav>
          </>
        )}

        {/* PAGE BODY */}
        <main className={`flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto ${isLoggedIn ? 'max-w-6xl mx-auto' : ''}`}>
          
          {/* 1. LANDING VIEW */}
          {currentView === 'Landing' && (
            <div className="space-y-16 animate-fade-in">
              {/* Sticky Header */}
              <header className="sticky top-0 bg-[#FBF7F2]/90 backdrop-blur-md py-4 border-b border-[#8A8391]/10 flex justify-between items-center z-30">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#5B4B6E]/5 flex items-center justify-center border border-[#5B4B6E]/10">
                    <Heart className="w-5 h-5 text-[#5B4B6E]" />
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#5B4B6E] tracking-tight">NURA</span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                  <a href="#problem" className="text-sm font-medium text-[#8A8391] hover:text-[#5B4B6E] transition-colors">The Problem</a>
                  <a href="#how-it-works" className="text-sm font-medium text-[#8A8391] hover:text-[#5B4B6E] transition-colors">Our Solution</a>
                  <a href="#features" className="text-sm font-medium text-[#8A8391] hover:text-[#5B4B6E] transition-colors">Features</a>
                  <a href="#pricing" className="text-sm font-medium text-[#8A8391] hover:text-[#5B4B6E] transition-colors">Pricing</a>
                </nav>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentView('Login')}
                    className="px-4 py-2 text-sm font-semibold text-[#5B4B6E] hover:text-[#E08D79] transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setCurrentView('Signup')}
                    className="bg-[#5B4B6E] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#5B4B6E]/90 shadow-sm transition-all"
                  >
                    Get started free
                  </button>
                </div>
              </header>

              {/* Hero Section */}
              <section className="py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="bg-[#8BA888]/15 text-[#5B4B6E] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">Your Personal Menopause Companion</span>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2D2A32] leading-tight font-extrabold">
                    The health memory you <span className="text-[#5B4B6E] italic">can't afford</span> to forget.
                  </h1>
                  <p className="text-[#8A8391] text-lg md:text-xl leading-relaxed font-sans">
                    NURA quietly captures your menopause journey and turns months of symptoms into a clear, doctor-ready story.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => setCurrentView('Signup')}
                      className="bg-[#5B4B6E] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#5B4B6E]/90 hover:scale-102 transition-all shadow-md text-center flex items-center justify-center gap-2"
                    >
                      Get started free <ArrowRight className="w-5 h-5" />
                    </button>
                    <a
                      href="#how-it-works"
                      className="border border-[#8A8391]/20 text-[#2D2A32] bg-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#FBF7F2] transition-all text-center"
                    >
                      See how it works
                    </a>
                  </div>
                </div>
                
                {/* Visual Accent */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-[#E08D79] to-[#8BA888] rounded-[2rem] opacity-20 blur-xl"></div>
                  <div className="relative bg-white border border-[#8A8391]/15 rounded-[2rem] p-6 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-[#8A8391]/10 pb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#E08D79]" />
                        <span className="font-serif text-[#5B4B6E] font-bold">NURA AI Insights</span>
                      </div>
                      <span className="text-[10px] bg-[#8BA888]/15 text-[#5B4B6E] px-2 py-0.5 rounded-md font-bold">Active Pattern</span>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-[#FBF7F2] rounded-xl text-sm border-l-4 border-[#5B4B6E]">
                        "Your hot flashes are clustering between 2:00 PM and 5:00 PM. This correlates directly with days you report restless sleep the previous night."
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8A8391]">
                        <CheckCircle className="w-4 h-4 text-[#8BA888]" />
                        <span>Ready to add to Meera Nair's clinical summary</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Problem Section */}
              <section id="problem" className="bg-white border border-[#8A8391]/10 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl text-[#2D2A32] font-bold">
                    "Your doctor sees 15 minutes. Your body lives it for months."
                  </h2>
                  <p className="text-[#8A8391] text-base leading-relaxed">
                    Longitudinal symptom loss means doctors often make decisions based on incomplete snapshots. Menopause symptoms deserve a continuous record.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Without Nura */}
                  <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100 space-y-4">
                    <h3 className="font-serif text-lg text-red-800 font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Without NURA
                    </h3>
                    <div className="flex flex-col gap-3 text-sm text-red-900/80">
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>Symptoms occur irregularly over weeks & months</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>Key trends, sleeping deficits, and spotting events are forgotten</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>Doctor visit occurs with incomplete, anxious oral history</span>
                      </div>
                    </div>
                  </div>

                  {/* With Nura */}
                  <div className="p-6 rounded-2xl bg-[#8BA888]/10 border border-[#8BA888]/20 space-y-4">
                    <h3 className="font-serif text-lg text-[#5B4B6E] font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#8BA888]" />
                      With NURA Support
                    </h3>
                    <div className="flex flex-col gap-3 text-sm text-[#2D2A32]/80">
                      <div className="flex items-start gap-2">
                        <span className="text-[#8BA888] font-bold">•</span>
                        <span>Quick-log symptoms, mood, and sleep in seconds</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#8BA888] font-bold">•</span>
                        <span>AI extracts patterns & structures daily logs behind the scenes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#8BA888] font-bold">•</span>
                        <span>Generate beautiful, clinical-ready report for your doctor on appointment day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Solution / How it works Section */}
              <section id="how-it-works" className="space-y-12 text-center">
                <div className="space-y-3 max-w-xl mx-auto">
                  <h2 className="font-serif text-3xl md:text-4xl text-[#2D2A32] font-bold">Continuous Companion Care</h2>
                  <p className="text-[#8A8391]">Simple 3-step solution to organize your path gracefully.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-[#8A8391]/10 space-y-4 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#E08D79]/10 text-[#E08D79] flex items-center justify-center font-bold text-lg mx-auto">1</div>
                    <h3 className="font-serif text-xl font-bold">Log Effortlessly</h3>
                    <p className="text-sm text-[#8A8391] leading-relaxed">
                      Use quick sliders, mood selectors, or voice-log transcription to capture symptoms in under 15 seconds.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-[#8A8391]/10 space-y-4 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#5B4B6E]/10 text-[#5B4B6E] flex items-center justify-center font-bold text-lg mx-auto">2</div>
                    <h3 className="font-serif text-xl font-bold">AI Organizes & Correlates</h3>
                    <p className="text-sm text-[#8A8391] leading-relaxed">
                      Our Gemini Companion models find sleep trends, night sweat cycles, medication compliance, and spotting timelines.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-[#8A8391]/10 space-y-4 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#8BA888]/10 text-[#8BA888] flex items-center justify-center font-bold text-lg mx-auto">3</div>
                    <h3 className="font-serif text-xl font-bold">Get Doctor-Ready Report</h3>
                    <p className="text-sm text-[#8A8391] leading-relaxed">
                      Download a structured clinical PDF with graphs, symptom grids, history, and suggested specialist questions.
                    </p>
                  </div>
                </div>
              </section>

              {/* Features Grid Section */}
              <section id="features" className="space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl text-[#2D2A32] font-bold">Everything you need to guide your body</h2>
                  <p className="text-[#8A8391]">Soft touch, clinical focus. Highly optimized for women in perimenopause.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Daily journal', desc: 'A calming searchable record of sleep parameters, moods, and direct notes.', icon: Clock },
                    { title: 'Conversational AI companion', desc: 'Secure server-side Gemini chatbot to reason warm, supportive patterns from logged history.', icon: MessageSquare },
                    { title: 'Symptom timeline', desc: 'Clear week-over-week summary cards identifying severity shifts and spotting events.', icon: TrendingUp },
                    { title: 'Pattern & trend detection', desc: 'Detects if afternoon hot flashes correlate with restless nights or missed thyroid supplements.', icon: Sparkles },
                    { title: 'Doctor-ready clinical summary', desc: 'Downloadable clinical report with proper medical terminology, symptom tables, and HRT guidelines.', icon: FileText },
                    { title: 'Voice & quick logging', desc: 'Just tap and dictate. Voice transcription parses raw feelings into precise metrics instantly.', icon: Mic }
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white border border-[#8A8391]/10 p-6 rounded-2xl shadow-sm space-y-4 hover:border-[#5B4B6E]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#5B4B6E]/5 text-[#5B4B6E] flex items-center justify-center">
                        <feat.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#2D2A32]">{feat.title}</h3>
                      <p className="text-sm text-[#8A8391] leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing Preview Section */}
              <section id="pricing" className="space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <h2 className="font-serif text-3xl md:text-4xl text-[#2D2A32] font-bold">Honest, simple pricing</h2>
                  <p className="text-[#8A8391]">Start free and upgrade when you are ready to prepare for your appointment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  {/* Free plan */}
                  <div className="bg-white p-8 rounded-2xl border border-[#8A8391]/10 space-y-6 shadow-sm relative">
                    <h3 className="font-serif text-xl font-bold">NURA Free</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#2D2A32]">Rs 0</span>
                      <span className="text-sm text-[#8A8391]">/ forever</span>
                    </div>
                    <ul className="space-y-3 text-sm text-[#8A8391]">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Daily logging (Symptom, Sleep, Mood)</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Journal timeline</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Basic metrics & charts</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> 3 AI Chats per day</li>
                    </ul>
                    <button
                      onClick={() => setCurrentView('Signup')}
                      className="w-full py-3 rounded-xl border border-[#8A8391]/20 font-semibold text-[#5B4B6E] hover:bg-[#FBF7F2] transition-colors"
                    >
                      Start Free Cycle
                    </button>
                  </div>

                  {/* Premium plan */}
                  <div className="bg-white p-8 rounded-2xl border-2 border-[#5B4B6E] space-y-6 shadow-md relative">
                    <div className="absolute -top-3.5 right-6 bg-[#E08D79] text-[#2D2A32] font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">Highly Recommended</div>
                    <h3 className="font-serif text-xl font-bold text-[#5B4B6E]">NURA+ Premium</h3>
                    
                    {/* Period Selector */}
                    <div className="grid grid-cols-3 gap-1 p-1 bg-[#FBF7F2] rounded-xl border border-[#8A8391]/10">
                      <button
                        type="button"
                        onClick={() => setBillingPeriod('1month')}
                        className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                          billingPeriod === '1month'
                            ? 'bg-[#5B4B6E] text-white shadow-sm'
                            : 'text-[#8A8391] hover:text-[#5B4B6E]'
                        }`}
                      >
                        1 Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingPeriod('3months')}
                        className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                          billingPeriod === '3months'
                            ? 'bg-[#5B4B6E] text-white shadow-sm'
                            : 'text-[#8A8391] hover:text-[#5B4B6E]'
                        }`}
                      >
                        3 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingPeriod('12months')}
                        className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                          billingPeriod === '12months'
                            ? 'bg-[#5B4B6E] text-white shadow-sm'
                            : 'text-[#8A8391] hover:text-[#5B4B6E]'
                        }`}
                      >
                        12 Months
                      </button>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#5B4B6E]">
                        {billingPeriod === '1month' && 'Rs 199'}
                        {billingPeriod === '3months' && 'Rs 499'}
                        {billingPeriod === '12months' && 'Rs 1099'}
                      </span>
                      <span className="text-sm text-[#8A8391]">
                        {billingPeriod === '1month' && '/ month'}
                        {billingPeriod === '3months' && '/ 3 months'}
                        {billingPeriod === '12months' && '/ 12 months'}
                      </span>
                    </div>
                    <ul className="space-y-3 text-sm text-[#2D2A32]">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> <strong>Unlimited</strong> AI Chat Companion</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> <strong>Unlimited</strong> Doctor-Ready PDF Reports</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Voice logging dictation & parsing</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Advanced patterns & trend analysis</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Priority specialist-led support</li>
                    </ul>
                    <button
                      onClick={() => {
                        setCurrentView('Signup');
                      }}
                      className="w-full py-3 rounded-xl bg-[#5B4B6E] text-white font-semibold hover:bg-[#5B4B6E]/95 shadow-md transition-all text-center"
                    >
                      Upgrade with Onboarding
                    </button>
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <section className="space-y-8 bg-white/50 border border-[#8A8391]/5 rounded-3xl p-8 text-center">
                <h3 className="font-serif text-2xl font-bold text-[#5B4B6E]">Loved & Trusted by Women</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { quote: "NURA mapped my sleep decline so beautifully. When I met my doctor, I didn't have to guess. We started joint treatment right away.", author: "Priya S., 49, Mumbai" },
                    { quote: "I was so worried about irregular bleeding. The chatbot stayed calm and structured a doctor report that flagged exactly what my specialist needed.", author: "Asha R., 53, Chennai" },
                    { quote: "The voice logging is beautiful. I speak for 10 seconds in the car and it populates my timeline with deep clinical accuracy.", author: "Kiran J., 51, Bengaluru" }
                  ].map((t, idx) => (
                    <div key={idx} className="space-y-2 p-4">
                      <p className="text-sm text-[#8A8391] italic">"{t.quote}"</p>
                      <h4 className="text-xs font-semibold text-[#5B4B6E]">— {t.author}</h4>
                    </div>
                  ))}
                </div>
              </section>

              {/* Final CTA Footer */}
              <footer className="border-t border-[#8A8391]/15 pt-12 pb-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2">
                    <span className="font-serif text-xl font-bold text-[#5B4B6E]">NURA</span>
                    <p className="text-xs text-[#8A8391]">Stateless Menopause Wellness Companion. Built in AI Studio.</p>
                  </div>
                  <div className="flex gap-6 text-xs text-[#8A8391]">
                    <a href="#" className="hover:text-[#5B4B6E]">Privacy Policy</a>
                    <a href="#" className="hover:text-[#5B4B6E]">Terms of Service</a>
                    <a href="#" className="hover:text-[#5B4B6E]">Clinical Safety</a>
                  </div>
                </div>
                <div className="text-center text-[10px] text-[#8A8391]">
                  &copy; {new Date().getFullYear()} NURA. All rights reserved. Demo credentials: username <span className="font-mono text-[#5B4B6E]">admin</span> / password <span className="font-mono text-[#5B4B6E]">admin</span>.
                </div>
              </footer>
            </div>
          )}

          {/* 2. LOGIN VIEW */}
          {currentView === 'Login' && (
            <div className="max-w-md mx-auto py-12 animate-fade-in space-y-8">
              <div className="text-center space-y-2">
                <button onClick={() => setCurrentView('Landing')} className="text-xs text-[#8A8391] hover:text-[#5B4B6E] flex items-center gap-1 mx-auto">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to home
                </button>
                <h2 className="font-serif text-3xl font-bold text-[#5B4B6E]">Log in to NURA</h2>
                <p className="text-sm text-[#8A8391]">Secure stateless credentials</p>
              </div>

              <div className="bg-white border border-[#8A8391]/15 p-8 rounded-2xl shadow-xl space-y-6">
                {loginError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8391]">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full p-3 border border-[#8A8391]/20 rounded-xl text-sm bg-[#FBF7F2] text-[#2D2A32] focus:outline-none focus:ring-2 focus:ring-[#5B4B6E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8391]">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 border border-[#8A8391]/20 rounded-xl text-sm bg-[#FBF7F2] text-[#2D2A32] focus:outline-none focus:ring-2 focus:ring-[#5B4B6E]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#5B4B6E] text-white rounded-xl font-semibold hover:bg-[#5B4B6E]/95 transition-all text-center text-sm shadow"
                  >
                    Log in
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#8A8391]/10"></div>
                  <span className="flex-shrink mx-4 text-[#8A8391] text-xs font-normal">Or continue with</span>
                  <div className="flex-grow border-t border-[#8A8391]/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => {
                    setUsername('admin');
                    setPassword('admin');
                    showToast('Pre-filled demo login credentials!');
                  }} className="py-2.5 px-4 border border-[#8A8391]/15 rounded-xl text-xs font-medium bg-white hover:bg-[#FBF7F2] text-[#2D2A32] transition-colors">
                    Google
                  </button>
                  <button onClick={() => {
                    setUsername('admin');
                    setPassword('admin');
                    showToast('Pre-filled demo login credentials!');
                  }} className="py-2.5 px-4 border border-[#8A8391]/15 rounded-xl text-xs font-medium bg-white hover:bg-[#FBF7F2] text-[#2D2A32] transition-colors">
                    Apple
                  </button>
                </div>

                <div className="bg-[#8BA888]/10 border border-[#8BA888]/20 p-3 rounded-xl text-center">
                  <p className="text-xs text-[#5B4B6E] font-medium">
                    Demo credentials: Use <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded shadow-sm text-red-700">admin</span> / <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded shadow-sm text-red-700">admin</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. SIGNUP VIEW */}
          {currentView === 'Signup' && (
            <div className="max-w-md mx-auto py-12 animate-fade-in space-y-8">
              <div className="text-center space-y-2">
                <button onClick={() => setCurrentView('Landing')} className="text-xs text-[#8A8391] hover:text-[#5B4B6E] flex items-center gap-1 mx-auto">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to home
                </button>
                <h2 className="font-serif text-3xl font-bold text-[#5B4B6E]">Create your NURA Account</h2>
                <p className="text-sm text-[#8A8391]">Begin your personalized hormone timeline logging</p>
              </div>

              <div className="bg-white border border-[#8A8391]/15 p-8 rounded-2xl shadow-xl space-y-6">
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8391]">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full p-3 border border-[#8A8391]/20 rounded-xl text-sm bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8A8391]">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Create secure password"
                      className="w-full p-3 border border-[#8A8391]/20 rounded-xl text-sm bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#5B4B6E] text-white rounded-xl font-semibold hover:bg-[#5B4B6E]/95 transition-all text-center text-sm shadow"
                  >
                    Start Calm Onboarding
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#8A8391]/10"></div>
                  <span className="flex-shrink mx-4 text-[#8A8391] text-xs font-normal">Or register with</span>
                  <div className="flex-grow border-t border-[#8A8391]/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setCurrentView('Onboarding')} className="py-2.5 px-4 border border-[#8A8391]/15 rounded-xl text-xs font-medium bg-white hover:bg-[#FBF7F2] text-[#2D2A32] transition-colors">
                    Google Signup
                  </button>
                  <button onClick={() => setCurrentView('Onboarding')} className="py-2.5 px-4 border border-[#8A8391]/15 rounded-xl text-xs font-medium bg-white hover:bg-[#FBF7F2] text-[#2D2A32] transition-colors">
                    Apple Signup
                  </button>
                </div>

                <p className="text-center text-xs text-[#8A8391]">
                  Already have an account?{' '}
                  <button onClick={() => setCurrentView('Login')} className="text-[#5B4B6E] font-bold hover:underline">
                    Log in
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* 4. ONBOARDING VIEW */}
          {currentView === 'Onboarding' && (
            <div className="max-w-2xl mx-auto py-8 animate-fade-in space-y-8">
              {/* Progress Header */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-[#8A8391]">
                  <span>Onboarding Profile Creation</span>
                  <span>Step {onboardingStep + 1} of {onboardingQuestions.length}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-[#8A8391]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5B4B6E] transition-all duration-300"
                    style={{ width: `${((onboardingStep + 1) / onboardingQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Questionnaire Card */}
              <div className="bg-white border border-[#8A8391]/15 p-8 rounded-3xl shadow-xl space-y-6">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-bold text-[#5B4B6E]">
                    {onboardingQuestions[onboardingStep].title}
                  </h2>
                  <p className="text-sm text-[#8A8391]">
                    {onboardingQuestions[onboardingStep].description}
                  </p>
                </div>

                {/* Answer Inputs */}
                <div className="py-4">
                  {onboardingQuestions[onboardingStep].input}
                </div>

                {/* Back/Forward Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-[#8A8391]/10">
                  <button
                    type="button"
                    onClick={handleOnboardingPrev}
                    disabled={onboardingStep === 0}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#8A8391] hover:text-[#5B4B6E] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={handleOnboardingNext}
                    className="bg-[#5B4B6E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#5B4B6E]/95 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    {onboardingStep === onboardingQuestions.length - 1 ? 'Finish Profile' : 'Next Step'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#FBF7F2] p-4 rounded-xl border border-[#8A8391]/10 text-center">
                <p className="text-xs text-[#8A8391]">
                  Tip: We have pre-populated these options to represent Meera Nair's seeded demo profile so you can flow smoothly.
                </p>
              </div>
            </div>
          )}

          {/* 5. DASHBOARD VIEW */}
          {currentView === 'Dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-[#2D2A32]">Good morning, {profile.name}</h1>
                  <p className="text-xs font-medium text-[#8A8391] flex items-center gap-1.5 mt-1 bg-[#8BA888]/10 text-[#5B4B6E] py-1 px-2.5 rounded-full w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-[#E08D79]" />
                    <span>AI Status: You slept lightly and had a night sweat - let's take it gentle today.</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="bg-[#5B4B6E] hover:bg-[#5B4B6E]/90 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-[#5B4B6E]/10 cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <Plus className="w-4 h-4" /> Log Today's Symptoms
                </button>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Today's Health Overview */}
                <div className="bg-white p-6 rounded-2xl border border-[#8A8391]/10 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#8A8391] tracking-wider uppercase">Today's health</h3>
                    <span className="bg-[#E08D79]/15 text-[#E08D79] text-xs font-bold px-2.5 py-0.5 rounded-full">Moderate day</span>
                  </div>
                  <div className="space-y-4 py-2">
                    {/* Energy bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A8391]">Energy</span>
                        <span className="font-bold">4/10</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#8A8391]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    {/* Mood bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A8391]">Mood</span>
                        <span className="font-bold">5/10</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#8A8391]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8BA888] rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#8A8391] border-t border-[#8A8391]/5 pt-3">
                    Overall stamina is down slightly. Rest is recommended.
                  </div>
                </div>

                {/* 2. Sleep Card */}
                <div className="bg-white p-6 rounded-2xl border border-[#8A8391]/10 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#8A8391] tracking-wider uppercase">Last night's sleep</h3>
                    <span className="bg-[#5B4B6E]/5 text-[#5B4B6E] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">restless</span>
                  </div>
                  <div className="py-1">
                    <div className="text-4xl font-serif font-bold text-[#5B4B6E]">5h 10m</div>
                    <p className="text-xs text-[#8A8391] mt-1">Woke up at <strong className="text-[#2D2A32]">3:10 AM</strong> with a mild night sweat episode.</p>
                  </div>
                  <div className="bg-[#E08D79]/5 border border-[#E08D79]/15 rounded-xl p-2.5 text-xs text-[#E08D79] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>1 night sweat registered.</span>
                  </div>
                </div>

                {/* 3. Recent Symptoms */}
                <div className="bg-white p-6 rounded-2xl border border-[#8A8391]/10 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#8A8391] tracking-wider uppercase">Recent symptoms</h3>
                    <span className="text-xs text-[#8A8391]">This week</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 py-2">
                    <span className="bg-[#E08D79]/10 text-[#5B4B6E] text-xs px-2.5 py-1 rounded-full font-medium">night sweats (4x, up)</span>
                    <span className="bg-[#5B4B6E]/5 text-[#5B4B6E] text-xs px-2.5 py-1 rounded-full font-medium">hot flashes (up)</span>
                    <span className="bg-[#5B4B6E]/5 text-[#5B4B6E] text-xs px-2.5 py-1 rounded-full font-medium">brain fog</span>
                    <span className="bg-[#5B4B6E]/5 text-[#5B4B6E] text-xs px-2.5 py-1 rounded-full font-medium">irritability</span>
                  </div>
                  <button onClick={() => setCurrentView('Timeline')} className="text-xs text-[#5B4B6E] font-bold hover:underline text-left flex items-center gap-1">
                    View chronological logs <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mood trend removed */}

                {/* 5. Medication Checkcard */}
                <div className="bg-white p-6 rounded-2xl border border-[#8A8391]/10 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#8A8391] tracking-wider uppercase">Supplements & Meds</h3>
                    <span className="text-[10px] bg-[#8BA888]/15 text-[#5B4B6E] px-2 py-0.5 rounded-full font-bold">Today</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-[#FBF7F2] rounded-lg">
                      <span className="font-medium">Thyroxine 50 mcg (morning)</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Taken</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#FBF7F2] rounded-lg">
                      <span className="font-medium">Calcium + Vitamin D (daily)</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Taken</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#FBF7F2] rounded-lg">
                      <span className="font-medium">Magnesium glycinate (night)</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Due tonight</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#8A8391]">
                    Occasional Paracetamol taken yesterday for joint aches.
                  </div>
                </div>

                {/* 6. Upcoming Appointment */}
                <div className="bg-white p-6 rounded-2xl border border-[#8A8391]/10 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#8A8391] tracking-wider uppercase">Upcoming Appointment</h3>
                    <Calendar className="w-4 h-4 text-[#5B4B6E]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#5B4B6E]">{profile.upcomingAppointment.doctor}</h4>
                    <p className="text-[11px] text-[#8A8391]">{profile.upcomingAppointment.specialty}</p>
                    <p className="text-xs font-semibold text-[#2D2A32] pt-1">{profile.upcomingAppointment.date}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView('DoctorReport');
                      showToast('Opening report generator...');
                    }}
                    className="w-full bg-[#5B4B6E] hover:bg-[#5B4B6E]/95 text-white py-2 rounded-xl text-xs font-semibold shadow-sm text-center"
                  >
                    Prepare my report
                  </button>
                </div>

                {/* 7. AI Insight */}
                <div className="bg-gradient-to-br from-white to-[#FBF7F2] p-6 rounded-2xl border border-[#E08D79]/20 shadow-sm flex flex-col justify-between space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#5B4B6E] tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-[#E08D79]" /> AI Insight
                    </h3>
                    <span className="text-[9px] bg-[#E08D79]/15 text-[#5B4B6E] font-bold px-2 py-0.5 rounded-full">New Pattern</span>
                  </div>
                  <p className="text-xs text-[#2D2A32] leading-relaxed italic bg-white p-3 rounded-xl border border-[#8A8391]/5 shadow-sm">
                    "Night sweats are up: 4 this week vs 1 last week. Want me to add this to your doctor's report?"
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentView('DoctorReport');
                        showToast('Insight added to clinic priorities.');
                      }}
                      className="flex-1 bg-[#8BA888] hover:bg-[#8BA888]/90 text-white py-2 rounded-xl text-xs font-semibold"
                    >
                      Yes, add to report
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('Chat');
                        showToast('Ask NURA loaded in chat.');
                      }}
                      className="flex-1 border border-[#8A8391]/20 text-[#2D2A32] py-2 rounded-xl text-xs font-semibold hover:bg-white"
                    >
                      Discuss in Chat
                    </button>
                  </div>
                </div>

                {/* 8. Weekly Trend graph card */}
                <div className="bg-white p-6 rounded-2xl border border-[#8A8391]/10 shadow-sm flex flex-col justify-between space-y-4 col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#8A8391] tracking-wider uppercase">Weekly trend tracker</h3>
                    <span className="text-xs text-[#8A8391]">Last 2 weeks</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sleep Decline mini chart */}
                    <div className="p-3 bg-[#FBF7F2] rounded-xl border border-[#8A8391]/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-[#8A8391]">Sleep declining</span>
                        <span className="text-xs font-bold text-red-500">6.5h &rarr; 5.2h</span>
                      </div>
                      <div className="h-10 w-full pt-2">
                        <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#5B4B6E"
                            strokeWidth="2.5"
                            points="0,5 25,7 50,12 75,15 100,18"
                          />
                        </svg>
                      </div>
                    </div>
                    {/* Hot flash rising mini chart */}
                    <div className="p-3 bg-[#FBF7F2] rounded-xl border border-[#8A8391]/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-[#8A8391]">Hot flashes rising</span>
                        <span className="text-xs font-bold text-red-500">Up 300%</span>
                      </div>
                      <div className="h-10 w-full pt-2">
                        <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke="#E08D79"
                            strokeWidth="2.5"
                            points="0,18 25,14 50,9 75,6 100,2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#8A8391] leading-relaxed">
                    Sleep reduction correlates strongly with the rise in night sweats. Both are compiled into your active clinic draft.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 6. TIMELINE VIEW */}
          {currentView === 'Timeline' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-[#2D2A32]">Hormone Journal</h1>
                  <p className="text-xs text-[#8A8391] mt-0.5">Chronological records of Meera Nair's wellness timeline.</p>
                </div>
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="bg-[#5B4B6E] hover:bg-[#5B4B6E]/90 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#5B4B6E]/10"
                >
                  <Plus className="w-4 h-4" /> Quick Log Entry
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-2xl border border-[#8A8391]/10 shadow-sm">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-[#8A8391] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs by keyword (e.g., 'spotting', 'headache')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#8A8391]/20 rounded-xl text-xs bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-[#8A8391] font-semibold flex items-center gap-1"><Filter className="w-3 h-3" /> Filters:</span>
                  {[
                    { id: 'all', label: 'All logs' },
                    { id: 'symptom', label: 'Symptom days' },
                    { id: 'sleep', label: 'Poor sleep' },
                    { id: 'mood', label: 'Mood drops' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedFilter === f.id
                          ? 'bg-[#5B4B6E] text-white'
                          : 'bg-[#FBF7F2] text-[#8A8391] hover:text-[#5B4B6E]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline list */}
              <div className="space-y-8">
                {/* Active logs grouped by date */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-[#8A8391] uppercase tracking-wider">Recent Logs (Simulated "Today" is 11 Jul 2026)</div>
                  
                  {filteredTimeline.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-[#8A8391]/10">
                      <p className="text-[#8A8391] text-sm font-medium">No matching entries found.</p>
                      <button onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }} className="text-[#5B4B6E] text-xs font-bold hover:underline mt-2">
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredTimeline.map((entry) => (
                      <div key={entry.id} className="bg-white border border-[#8A8391]/10 rounded-2xl p-6 shadow-sm hover:border-[#5B4B6E]/20 transition-all space-y-4 relative">
                        {/* Spotting indicator / Important alerts flag */}
                        {(entry.symptoms.includes('palpitations') || entry.notes?.toLowerCase().includes('spotting')) && (
                          <div className="absolute top-6 right-6 bg-[#E08D79]/15 text-[#E08D79] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            Flagged for Doctor
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#8A8391]/5 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-bold text-[#5B4B6E]">{entry.date}</span>
                            <span className="bg-[#8BA888]/10 text-[#5B4B6E] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                              Mood: {entry.mood}
                            </span>
                          </div>
                          <div className="text-xs text-[#8A8391]">
                            Sleep: <strong className="text-[#2D2A32]">{entry.sleep.duration}</strong> ({entry.sleep.quality})
                          </div>
                        </div>

                        {/* Symptoms row */}
                        {entry.symptoms.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.symptoms.map((s) => (
                              <span key={s} className="bg-[#E08D79]/10 text-[#5B4B6E] text-xs px-2.5 py-0.5 rounded-full font-medium capitalize">
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-[#8BA888] italic font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> No active symptoms logged
                          </div>
                        )}

                        {/* Notes */}
                        {entry.notes && (
                          <p className="text-xs text-[#2D2A32] bg-[#FBF7F2] p-3 rounded-xl border border-[#8A8391]/5 italic leading-relaxed">
                            "{entry.notes}"
                          </p>
                        )}

                        {/* AI Summary and Voice Note Badge */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                          {entry.aiSummary && (
                            <p className="text-xs text-[#5B4B6E] font-medium flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#E08D79]" />
                              <span>NURA AI: {entry.aiSummary}</span>
                            </p>
                          )}
                          {entry.voiceNote && (
                            <span className="bg-[#5B4B6E]/5 text-[#5B4B6E] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 self-end sm:self-auto">
                              <Mic className="w-3 h-3 text-[#E08D79]" /> Voice note parsed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Older Weekly Summaries */}
                <div className="space-y-4 pt-4 border-t border-[#8A8391]/15">
                  <div className="text-xs font-bold text-[#8A8391] uppercase tracking-wider">Older Logs & Summaries</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SEEDED_WEEKLY_SUMMARIES.map((ws, i) => (
                      <div key={i} className="bg-white/70 p-5 rounded-2xl border border-[#8A8391]/10 shadow-sm space-y-2">
                        <span className="text-xs font-bold text-[#5B4B6E]">{ws.week}</span>
                        <p className="text-xs text-[#8A8391] leading-relaxed italic">
                          "{ws.summary}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. AI CHAT VIEW */}
          {currentView === 'Chat' && (
            <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white border border-[#8A8391]/10 rounded-3xl shadow-lg overflow-hidden animate-fade-in">
              {/* Chat Header */}
              <div className="bg-[#5B4B6E] text-white p-4 flex justify-between items-center shrink-0 border-b border-[#E08D79]/20">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#E08D79]">
                    N
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif">NURA AI Companion</h3>
                    <p className="text-[10px] text-[#FBF7F2]/80 leading-none">Powered by Gemini 3.5 Flash</p>
                  </div>
                </div>
                <div className="text-xs bg-[#8BA888]/20 px-2.5 py-1 rounded-full text-[#8BA888] font-bold">
                  Stateless Conversation
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FBF7F2]/50">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#E08D79] text-[#2D2A32] font-medium rounded-tr-none'
                            : 'bg-[#5B4B6E] text-white rounded-tl-none'
                        } shadow-sm`}
                      >
                        {msg.isPending ? (
                          <div className="flex items-center gap-1.5 py-1 px-3">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse delay-75"></span>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse delay-150"></span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-line">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggestions Chips Row */}
              <div className="px-4 py-2 bg-white/90 border-t border-[#8A8391]/5 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
                {[
                  'How have I been this month?',
                  'What should I tell my doctor?',
                  'Should I be worried about the spotting?'
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendChatMessage(s)}
                    disabled={chatLoading}
                    className="flex-shrink-0 px-3 py-1.5 bg-[#FBF7F2] hover:bg-[#5B4B6E]/5 border border-[#8A8391]/15 text-[#5B4B6E] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="p-3 bg-white border-t border-[#8A8391]/10 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Ask NURA about your logged history, sleep patterns, or symptom preparation..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !chatLoading) {
                      handleSendChatMessage();
                    }
                  }}
                  disabled={chatLoading}
                  className="flex-1 px-4 py-3 border border-[#8A8391]/20 rounded-xl text-xs bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-5 py-3 bg-[#5B4B6E] hover:bg-[#5B4B6E]/95 disabled:bg-[#8A8391]/40 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* 8. DOCTOR REPORT VIEW */}
          {currentView === 'DoctorReport' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in print:p-0">
              {/* Controls Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#8A8391]/10 shadow-sm print:hidden">
                <div className="space-y-1">
                  <h1 className="font-serif text-2xl font-bold text-[#5B4B6E]">Doctor-Ready clinical summary</h1>
                  <p className="text-xs text-[#8A8391]">Generate structured summaries automatically for Dr. Ananya Desai.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleGenerateReportLive}
                    disabled={reportGenerating}
                    className="bg-[#5B4B6E] hover:bg-[#5B4B6E]/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-[#E08D79]" />
                    {reportGenerating ? 'Analyzing with Gemini...' : 'Regenerate Report with Gemini'}
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-[#8BA888] hover:bg-[#8BA888]/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download PDF / Print
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Share link copied to clipboard!');
                    }}
                    className="border border-[#8A8391]/20 text-[#2D2A32] bg-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-[#FBF7F2]"
                  >
                    <Copy className="w-4 h-4" /> Copy Share Link
                  </button>
                </div>
              </div>

              {reportSuccessMessage && (
                <div className="p-3 bg-[#8BA888]/10 text-[#5B4B6E] rounded-xl border border-[#8BA888]/20 text-xs flex items-center gap-2 print:hidden">
                  <CheckCircle className="w-4 h-4" />
                  <span>{reportSuccessMessage}</span>
                </div>
              )}

              {/* Print Document Paper container */}
              <div className="bg-white border border-[#8A8391]/15 p-8 md:p-12 rounded-3xl shadow-xl space-y-6 max-w-4xl mx-auto text-[#2D2A32] print:border-none print:shadow-none print:p-0">
                <div className="prose prose-stone max-w-none text-sm leading-relaxed prose-headings:font-serif-heading">
                  <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* 9. SUBSCRIPTION VIEW */}
          {currentView === 'Subscription' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#5B4B6E]">Unlock NURA+ Premium</h1>
                <p className="text-[#8A8391] text-sm leading-relaxed">
                  Deepen your understanding, protect your history, and prepare beautifully with our specialist-approved features.
                </p>
              </div>

              {/* Two Column Pricing layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-4">
                {/* Free Plan details */}
                <div className="bg-white border border-[#8A8391]/10 rounded-2xl p-8 space-y-6 shadow-sm">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold">NURA Standard</h3>
                    <p className="text-xs text-[#8A8391]">Basic tracker for menopause symptoms</p>
                  </div>
                  <div className="flex items-baseline gap-1 border-y border-[#8A8391]/5 py-4">
                    <span className="text-4xl font-extrabold text-[#2D2A32]">Rs 0</span>
                    <span className="text-xs text-[#8A8391]">/ forever</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-[#8A8391]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Daily symptom logging</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Symptom Timeline Journal</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Basic metric trends & overview</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> 3 AI Companion chats per day</li>
                  </ul>
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
                      Your Active Plan
                    </span>
                  </div>
                </div>

                {/* Premium Plan details */}
                <div className="bg-white border-2 border-[#5B4B6E] rounded-2xl p-8 space-y-6 shadow-md relative">
                  <div className="absolute -top-3.5 right-6 bg-[#E08D79] text-[#2D2A32] font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">Highly Recommended</div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-[#5B4B6E]">NURA+ Premium</h3>
                    <p className="text-xs text-[#8A8391]">Continuous AI extraction and preparation</p>
                  </div>
                  
                  {/* Period Selector */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#FBF7F2] rounded-xl border border-[#8A8391]/10">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('1month')}
                      className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                        billingPeriod === '1month'
                          ? 'bg-[#5B4B6E] text-white shadow-sm'
                          : 'text-[#8A8391] hover:text-[#5B4B6E]'
                      }`}
                    >
                      1 Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('3months')}
                      className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                        billingPeriod === '3months'
                          ? 'bg-[#5B4B6E] text-white shadow-sm'
                          : 'text-[#8A8391] hover:text-[#5B4B6E]'
                      }`}
                    >
                      3 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('12months')}
                      className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-all ${
                        billingPeriod === '12months'
                          ? 'bg-[#5B4B6E] text-white shadow-sm'
                          : 'text-[#8A8391] hover:text-[#5B4B6E]'
                      }`}
                    >
                      12 Months
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1 border-y border-[#8A8391]/5 py-4">
                    <span className="text-4xl font-extrabold text-[#5B4B6E]">
                      {billingPeriod === '1month' && 'Rs 199'}
                      {billingPeriod === '3months' && 'Rs 499'}
                      {billingPeriod === '12months' && 'Rs 1099'}
                    </span>
                    <span className="text-xs text-[#8A8391]">
                      {billingPeriod === '1month' && '/ month'}
                      {billingPeriod === '3months' && '/ 3 months'}
                      {billingPeriod === '12months' && '/ 12 months'}
                    </span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-[#2D2A32]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> <strong>Unlimited</strong> AI Chat Companion</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> <strong>Unlimited</strong> Doctor-Ready PDF Reports</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Voice log transcription & automatic parsing</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Advanced pattern & symptom trend detection</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Appointment preparation summaries</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8BA888]" /> Priority specialist-led customer support</li>
                  </ul>
                  <button
                    onClick={() => {
                      const duration = billingPeriod === '1month' ? '1 Month' : billingPeriod === '3months' ? '3 Months' : '12 Months';
                      const cost = billingPeriod === '1month' ? 'Rs 199' : billingPeriod === '3months' ? 'Rs 499' : 'Rs 1099';
                      setProfile({ ...profile, membership: 'NURA+' });
                      showToast(`Successfully upgraded to NURA+ Premium (${duration} for ${cost})!`, 'success');
                    }}
                    className="w-full py-3 bg-[#5B4B6E] hover:bg-[#5B4B6E]/95 text-white font-semibold rounded-xl text-center text-xs shadow-sm"
                  >
                    {profile.membership === 'NURA+' ? 'Your NURA+ Plan is Active' : 'Upgrade to NURA+ Premium'}
                  </button>
                </div>
              </div>

              {/* Trust & Privacy Guarantee */}
              <div className="max-w-xl mx-auto text-center border-t border-[#8A8391]/10 pt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#5B4B6E]">
                  <Shield className="w-4 h-4 text-[#8BA888]" />
                  <span>Privacy, Security, and Consent First</span>
                </div>
                <p className="text-[11px] text-[#8A8391] leading-relaxed">
                  Your wellness logs are stored in stateless, in-memory sandboxes. NURA complies with HIPAA data preservation standards and never shares clinical histories with any unauthorized third parties.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 10. GLOBAL FLOATING QUICK ADD MODAL BOTTOM SHEET */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-[#2D2A32]/60 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4 transition-opacity">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in relative text-[#2D2A32]">
            {/* Close */}
            <button
              onClick={() => setShowQuickAdd(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#FBF7F2] text-[#8A8391]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#5B4B6E]">Log symptoms for 11 Jul 2026</h3>
              <p className="text-xs text-[#8A8391]">Simulation date. Fast capture your active feelings.</p>
            </div>

            {/* Simulated Voice note option */}
            <div className="bg-[#5B4B6E]/5 border border-[#5B4B6E]/10 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#5B4B6E] flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-[#E08D79]" /> Voice quick log transcription
                </span>
                <span className="bg-[#E08D79] text-[#2D2A32] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">NURA+ Feature</span>
              </div>
              <p className="text-[11px] text-[#8A8391]">
                Tap the mic to dictate your symptom feelings. NURA will transcribe and automatically fill the parameters below.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className={`p-3 rounded-full ${qaVoiceRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#5B4B6E] text-white'} hover:opacity-90`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                {qaVoiceRecording ? (
                  <div className="flex-1 space-y-1">
                    {/* Animated sound wave bars */}
                    <div className="flex gap-0.5 h-3 items-center">
                      {[1, 2, 3, 4, 3, 2, 1, 3, 5, 2].map((h, i) => (
                        <span key={i} className="w-0.5 bg-[#E08D79] rounded" style={{ height: `${h * 2}px` }}></span>
                      ))}
                    </div>
                    <p className="text-[11px] font-mono text-[#5B4B6E] leading-none">{qaVoiceText}</p>
                  </div>
                ) : (
                  <span className="text-xs text-[#8A8391] italic">Tap to start speaking...</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Symptoms selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8A8391]">Symptom Tracker</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'hot flashes',
                    'night sweats',
                    'sleep disturbance',
                    'brain fog',
                    'mood changes',
                    'irritability',
                    'anxiety',
                    'fatigue',
                    'joint aches',
                    'headache',
                    'palpitations'
                  ].map((sym) => {
                    const active = qaSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          const updated = active
                            ? qaSymptoms.filter((s) => s !== sym)
                            : [...qaSymptoms, sym];
                          setQaSymptoms(updated);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? 'bg-[#8BA888]/15 border-[#8BA888] text-[#5B4B6E] font-bold'
                            : 'bg-[#FBF7F2] border-[#8A8391]/15 text-[#2D2A32]'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mood picker scale */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8A8391]">Active Mood</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'low', label: 'Low 😞' },
                    { id: 'anxious', label: 'Anxious 😟' },
                    { id: 'irritable', label: 'Irritable 😠' },
                    { id: 'okay', label: 'Okay 😐' },
                    { id: 'good', label: 'Good 🙂' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setQaMood(m.id)}
                      className={`py-2 text-center border rounded-xl text-xs font-medium transition-all ${
                        qaMood === m.id
                          ? 'border-[#5B4B6E] bg-[#5B4B6E]/5 text-[#5B4B6E] font-bold'
                          : 'border-[#8A8391]/15 bg-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep log metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8A8391]">Sleep Duration</label>
                  <input
                    type="text"
                    value={qaSleepDuration}
                    onChange={(e) => setQaSleepDuration(e.target.value)}
                    placeholder="e.g., 5h 10m"
                    className="w-full p-2.5 border border-[#8A8391]/20 rounded-xl text-xs bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8A8391]">Sleep Quality</label>
                  <select
                    value={qaSleepQuality}
                    onChange={(e) => setQaSleepQuality(e.target.value as any)}
                    className="w-full p-2.5 border border-[#8A8391]/20 rounded-xl text-xs bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                  >
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                    <option value="restless">Restless</option>
                  </select>
                </div>
              </div>

              {/* Night Sweat count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8A8391]">Night Sweat Episodes</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQaNightSweats(Math.max(0, qaNightSweats - 1))}
                      className="w-8 h-8 rounded-full border border-[#8A8391]/25 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{qaNightSweats}</span>
                    <button
                      type="button"
                      onClick={() => setQaNightSweats(qaNightSweats + 1)}
                      className="w-8 h-8 rounded-full border border-[#8A8391]/25 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8A8391]">Today's Energy (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={qaEnergy}
                    onChange={(e) => setQaEnergy(Number(e.target.value))}
                    className="w-full h-2 bg-[#8A8391]/15 rounded-lg appearance-none cursor-pointer accent-[#5B4B6E]"
                  />
                  <div className="text-right text-[10px] font-bold text-[#5B4B6E]">{qaEnergy}/10</div>
                </div>
              </div>

              {/* Medication compliance checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8A8391]">Medications & Supplements Taken Today</label>
                <div className="grid grid-cols-3 gap-2">
                  {qaMeds.map((m, idx) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        const updated = [...qaMeds];
                        updated[idx].taken = !updated[idx].taken;
                        setQaMeds(updated);
                      }}
                      className={`p-2 border rounded-xl text-[10px] font-medium text-left flex items-center justify-between ${
                        m.taken ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-[#8A8391]/15 bg-white'
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      {m.taken ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <div className="w-2.5 h-2.5 border rounded-sm shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Text Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8A8391]">Notes & Observations</label>
                <textarea
                  value={qaNotes}
                  onChange={(e) => setQaNotes(e.target.value)}
                  placeholder="e.g., How did hot flashes affect your concentration? Any cramping or spotting details?"
                  rows={2}
                  className="w-full p-2.5 border border-[#8A8391]/20 rounded-xl text-xs bg-[#FBF7F2] text-[#2D2A32] focus:outline-none"
                ></textarea>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3 border-t border-[#8A8391]/10">
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="flex-1 py-3 border border-[#8A8391]/20 text-[#2D2A32] rounded-xl text-xs font-semibold hover:bg-[#FBF7F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickAdd}
                className="flex-1 py-3 bg-[#5B4B6E] text-white rounded-xl text-xs font-semibold hover:bg-[#5B4B6E]/95 shadow-sm"
              >
                Save Log Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

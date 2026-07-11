export interface UserProfile {
  name: string;
  age: number;
  location: string;
  menopauseStage: string;
  lastPeriodInfo: string;
  symptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  goals: string[];
  upcomingAppointment: {
    doctor: string;
    specialty: string;
    date: string;
  };
  membership: 'Free' | 'NURA+';
}

export interface TimelineEntry {
  id: string;
  date: string; // ISO string or readable e.g., "11 Jul"
  sleep: {
    duration: string; // e.g., "5h 10m"
    quality: 'restless' | 'good' | 'average' | 'poor';
    wokeTime?: string;
    nightSweatCount: number;
  };
  energy: number; // 1-10
  mood: string; // e.g., "irritable", "low", "okay", etc.
  symptoms: string[]; // e.g., ["night sweats", "hot flashes", "brain fog"]
  medications: {
    name: string;
    taken: boolean;
  }[];
  notes?: string;
  voiceNote?: boolean; // Whether a voice note was recorded
  aiSummary?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  isPending?: boolean;
}

export type ViewType =
  | 'Landing'
  | 'Login'
  | 'Signup'
  | 'Onboarding'
  | 'Dashboard'
  | 'Timeline'
  | 'Chat'
  | 'DoctorReport'
  | 'Subscription';

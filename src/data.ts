import { UserProfile, TimelineEntry } from './types';

export const SEEDED_USER: UserProfile = {
  name: 'Meera Nair',
  age: 52,
  location: 'Bengaluru, India',
  menopauseStage: 'Perimenopause',
  lastPeriodInfo: 'Periods irregular for about 12 months; last period about 4 months ago, then light spotting on 1 Jul 2026',
  symptoms: [
    'hot flashes',
    'night sweats',
    'sleep disturbance',
    'brain fog',
    'mood changes',
    'irritability',
    'anxiety',
    'fatigue',
    'joint aches'
  ],
  medicalHistory: [
    'hypothyroidism',
    'borderline high blood pressure',
    'family history of osteoporosis (mother)',
    'No HRT yet'
  ],
  currentMedications: [
    'Thyroxine 50 mcg every morning',
    'Calcium + Vitamin D daily',
    'Magnesium glycinate at night',
    'occasional Paracetamol for joint pain'
  ],
  goals: [
    'sleep better',
    'understand my symptom patterns',
    'prepare confidently for my doctor visit',
    'feel like myself again'
  ],
  upcomingAppointment: {
    doctor: 'Dr. Ananya Desai',
    specialty: 'Gynaecologist and Menopause Specialist',
    date: 'Thu 17 Jul 2026, 4:30 PM'
  },
  membership: 'Free'
};

export const SEEDED_TIMELINE: TimelineEntry[] = [
  {
    id: 'entry-11-jul',
    date: '11 Jul 2026',
    sleep: {
      duration: '5h 10m',
      quality: 'restless',
      wokeTime: '3:10 AM',
      nightSweatCount: 1
    },
    energy: 4,
    mood: 'irritable',
    symptoms: ['night sweats', 'hot flashes', 'brain fog'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Snapped at my daughter, felt guilty.',
    voiceNote: false,
    aiSummary: 'Night sweat and short sleep again - your 4th night sweat this week.'
  },
  {
    id: 'entry-10-jul',
    date: '10 Jul 2026',
    sleep: {
      duration: '5h 00m',
      quality: 'restless',
      nightSweatCount: 0
    },
    energy: 3,
    mood: 'low',
    symptoms: ['hot flashes', 'fatigue', 'joint aches'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'High fatigue, knees and fingers aching today.',
    voiceNote: true,
    aiSummary: 'Low energy tracks with poor sleep.'
  },
  {
    id: 'entry-09-jul',
    date: '09 Jul 2026',
    sleep: {
      duration: '5h 30m',
      quality: 'poor',
      nightSweatCount: 1
    },
    energy: 4,
    mood: 'tired',
    symptoms: ['night sweats', 'brain fog', 'fatigue'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Skipped my evening walk, was just too tired.',
    voiceNote: false,
    aiSummary: 'Second night sweat this week.'
  },
  {
    id: 'entry-08-jul',
    date: '08 Jul 2026',
    sleep: {
      duration: '6h 30m',
      quality: 'good',
      nightSweatCount: 0
    },
    energy: 6,
    mood: 'okay',
    symptoms: ['hot flashes'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Took a 30-minute evening walk. Mood was much steadier.',
    voiceNote: false,
    aiSummary: 'Better sleep, steadier mood.'
  },
  {
    id: 'entry-07-jul',
    date: '07 Jul 2026',
    sleep: {
      duration: '4h 45m',
      quality: 'poor',
      wokeTime: '2:45 AM',
      nightSweatCount: 1
    },
    energy: 3,
    mood: 'anxious',
    symptoms: ['night sweats', 'anxiety', 'palpitations'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Woke up suddenly with brief racing heart/palpitations and night sweat.',
    voiceNote: true,
    aiSummary: 'Palpitations noted - worth mentioning to your doctor.'
  },
  {
    id: 'entry-06-jul',
    date: '06 Jul 2026',
    sleep: {
      duration: '6h 00m',
      quality: 'average',
      nightSweatCount: 0
    },
    energy: 5,
    mood: 'mood swings',
    symptoms: ['hot flashes'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Had three separate hot flashes during the afternoon at work. Hard to focus.',
    voiceNote: false,
    aiSummary: 'Daytime hot flashes clustering in the afternoon.'
  },
  {
    id: 'entry-05-jul',
    date: '05 Jul 2026',
    sleep: {
      duration: '6h 15m',
      quality: 'good',
      nightSweatCount: 0
    },
    energy: 6,
    mood: 'calm',
    symptoms: [],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'A much steadier, calmer day. No hot flashes or night sweats.',
    voiceNote: false,
    aiSummary: 'A calmer day.'
  },
  {
    id: 'entry-04-jul',
    date: '04 Jul 2026',
    sleep: {
      duration: '4h 30m',
      quality: 'poor',
      nightSweatCount: 1
    },
    energy: 3,
    mood: 'irritable',
    symptoms: ['night sweats', 'headache'],
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Severe headache and woke up hot. Rough day.',
    voiceNote: false,
    aiSummary: 'Night-time hot flash and headache.'
  },
  {
    id: 'entry-01-jul',
    date: '01 Jul 2026',
    sleep: {
      duration: '5h 15m',
      quality: 'average',
      nightSweatCount: 0
    },
    energy: 4,
    mood: 'low',
    symptoms: ['joint aches'], // + light spotting/cramping notes
    medications: [
      { name: 'Thyroxine 50 mcg', taken: true },
      { name: 'Calcium + Vitamin D', taken: true },
      { name: 'Magnesium glycinate', taken: true }
    ],
    notes: 'Light spotting today, first bleeding of any kind in about 4 months. Mild cramping and low mood.',
    voiceNote: false,
    aiSummary: "First bleeding in about 4 months - I've flagged this for your doctor."
  }
];

export interface WeeklySummary {
  week: string;
  summary: string;
}

export const SEEDED_WEEKLY_SUMMARIES: WeeklySummary[] = [
  {
    week: 'Week of 23 Jun 2026',
    summary: 'Hot flashes becoming more frequent; sleep about 6h average.'
  },
  {
    week: 'Week of 16 Jun 2026',
    summary: 'Occasional night sweats begin; mild fatigue.'
  },
  {
    week: 'Week of 09 Jun 2026',
    summary: 'Mostly mild symptoms; sleep about 6.5h average.'
  }
];

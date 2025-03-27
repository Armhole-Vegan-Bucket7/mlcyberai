
import { generateDateSequence } from '@/utils/dateUtils';

// Generate 10 recent dates with a 3-day interval (covering roughly the last month)
const recentDates = generateDateSequence(10, 3);

// Mock data for D3 visualizations
export const incidentTimelineData = recentDates.map((date, index) => ({
  date,
  critical: 4 + Math.floor(Math.random() * 6),
  high: 7 + Math.floor(Math.random() * 8),
  medium: 12 + Math.floor(Math.random() * 10),
  low: 18 + Math.floor(Math.random() * 12)
}));

export const detectionVolumeData = recentDates.map((date, index) => ({
  date,
  malware: 24 + Math.floor(Math.random() * 20),
  phishing: 18 + Math.floor(Math.random() * 18),
  ransomware: 5 + Math.floor(Math.random() * 11),
  other: 12 + Math.floor(Math.random() * 16)
}));

export const mitreTechniqueData = recentDates.map((date, index) => ({
  date,
  initialAccess: 15 + Math.floor(Math.random() * 15),
  execution: 10 + Math.floor(Math.random() * 13),
  persistence: 8 + Math.floor(Math.random() * 10),
  privilegeEscalation: 5 + Math.floor(Math.random() * 7),
  defensiveEvasion: 12 + Math.floor(Math.random() * 12)
}));

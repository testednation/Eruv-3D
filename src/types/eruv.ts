export type AppMode = 'game' | 'sandbox' | 'domains' | 'infographics' | 'quiz' | 'daily-halacha';

export type GameDifficulty = 'easy' | 'standard' | 'expert';

export interface DifficultyConfig {
  id: GameDifficulty;
  name: string;
  hebrewName: string;
  badge: string;
  description: string;
  taskCount: number;
  initialMinutes: number;
  color: string;
  accentClass: string;
  bgClass: string;
  borderClass: string;
}

export interface EruvInspectionTask {
  id: string;
  title: string;
  locationName: string;
  poleIndex: number;
  description: string;
  halachicIssue: string;
  halachicRule: string;
  hebrewTerm: string;
  source: string;
  fixed: boolean;
  fixActionLabel: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  sourceCitation?: ShulchanAruchCitation;
}

export interface ShulchanAruchCitation {
  siman: number;
  seif: string;
  citation: string;
  hebrewCitation: string;
  rulingSummary: string;
  mishnahBerurahRef?: string;
}

export interface DomainItem {
  id: string;
  name: string;
  description: string;
  hebrew: string;
  minHeight: string;
  minArea: string;
  carryingRule: string;
  color: string;
  examples: string[];
  shulchanAruch?: ShulchanAruchCitation;
}

export interface QuizQuestion {
  id: number;
  question: string;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  halachicPrinciple: string;
  source: string;
}

export interface EruvPoleData {
  id: number;
  position: [number, number, number];
  height: number;
  leanAngle: number; // in radians
  wireAttachment: 'top' | 'side' | 'missing'; // 'top' is Kosher, 'side' is Pasul
  hasLechi: boolean;
  name: string;
}

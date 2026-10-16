export type AppMode = 'game' | 'sandbox' | 'domains' | 'infographics' | 'quiz' | 'daily-halacha';

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

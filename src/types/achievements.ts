export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  hebrewTitle: string;
  description: string;
  requirement: string;
  icon: string;
  rarity: AchievementRarity;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

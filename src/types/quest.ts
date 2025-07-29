export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  progress: number;
  reward: QuestReward;
  isCompleted: boolean;
  expiresAt: string; // ISO date string
}

export enum QuestType {
  ATTACK_DOGHOUSES = 'attack_doghouses',
  BUILD_DOGHOUSES = 'build_doghouses',
  GAIN_EXPERIENCE = 'gain_experience',
  VISIT_LOCATIONS = 'visit_locations',
  REPAIR_DOGHOUSES = 'repair_doghouses',
}

export interface QuestReward {
  type: RewardType;
  amount: number;
  description: string;
}

export enum RewardType {
  DOGHOUSES = 'doghouses',
  EXPERIENCE = 'experience',
  ENERGY = 'energy',
  COINS = 'coins',
}

export interface DailyQuestsResponse {
  quests: Quest[];
  nextRefreshAt: string;
}

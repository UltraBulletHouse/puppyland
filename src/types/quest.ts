export interface Quest {
  isRewardClaimed: any;
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
  ATTACK_DOGHOUSES = 'ATTACK_DOGHOUSES',
  BUILD_DOGHOUSES = 'BUILD_DOGHOUSES',
  GAIN_EXPERIENCE = 'GAIN_EXPERIENCE',
  REPAIR_DOGHOUSES = 'REPAIR_DOGHOUSES',
  DESTROY_DOGHOUSES = 'DESTROY_DOGHOUSES',
  LEVEL_UP = 'LEVEL_UP',
  SPEND_ENERGY = 'SPEND_ENERGY',
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
  ENERGY_RESTORE = 'energy_restore',
  PREMIUM_DOGHOUSE = 'premium_doghouse',
  COINS = 'COINS',
}

export interface DailyQuestsResponse {
  quests: Quest[];
  nextRefreshAt: string;
}

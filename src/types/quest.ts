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
  ATTACK_DOGHOUSES = 'attack_doghouses',
  BUILD_DOGHOUSES = 'build_doghouses',
  GAIN_EXPERIENCE = 'gain_experience',
  REPAIR_DOGHOUSES = 'repair_doghouses',
  DESTROY_DOGHOUSES = 'destroy_doghouses',
  LEVEL_UP = 'level_up',
  SPEND_ENERGY = 'spend_energy'
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
  COINS = "COINS"
}

export interface DailyQuestsResponse {
  quests: Quest[];
  nextRefreshAt: string;
}

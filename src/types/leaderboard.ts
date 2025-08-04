export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  dogName: string;
  avatar?: string;
  score: number;
  
  rank: number;
  isCurrentUser?: boolean;
  level?: number;
  experience?: number;
  ownedDoghouses?: number;
  destroyedDoghouses?: number;
  badge?: LeaderboardBadge;
}

export interface LeaderboardBadge {
  type: BadgeType;
  label: string;
  color: string;
}

export enum BadgeType {
  CHAMPION = 'champion',
  TOP_PLAYER = 'top_player',
  RISING_STAR = 'rising_star',
  VETERAN = 'veteran',
  NEWCOMER = 'newcomer',
}

export enum LeaderboardCategory {
  LEVEL = 'LEVEL',
  DOGHOUSES_BUILT = 'DOGHOUSES_BUILT',
  DOGHOUSES_DESTROYED = 'DOGHOUSES_DESTROYED'
}

export interface LeaderboardData {
  category: LeaderboardCategory;
  title: string;
  description: string;
  icon: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
  currentUserRank?: number;
  totalPlayers: number;
}

export interface LeaderboardsResponse {
  leaderboards: LeaderboardData[];
  currentUser: {
    userId: string;
    userName: string;
    dogName: string;
  };
}

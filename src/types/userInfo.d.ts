import { DogInfo } from './dog';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  availableDoghouses: number;
  availableAttacks: number;
  ownedDogHouses: number;
  isPremium?: boolean;
  premiumExpiryUtc?: string | null;
}

export interface UserInfoResponse {
  user: UserInfo;
  dog: DogInfo;
}

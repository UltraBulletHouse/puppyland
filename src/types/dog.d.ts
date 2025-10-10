export interface DogBuffs {
  buffSku: string;
  name: string;
  description?: string;
  quantity: number;
}

export interface DogInfo {
  id: string;
  userId: string;
  name: string;
  nameChangesCounter: number;
  availableDoghouses: number;
  energy: number;
  energyMax: number;
  experience: number;
  level: number;
  expForNextLevel: number;
  reachMeters?: number;
  buffsForDoghouses: DogBuffs[] | null;
  buffsForDog: DogBuffs[] | null;
  iconKey?: string | null;
  photo: null;
}

export interface DogDerivedStats {
  attackMin: number;
  attackMax: number;
  reachMeters: number;
  energyMax: number;
  doghouseMaxHp: number;
}

export interface DogInfoResponse {
  dog: DogInfo;
  derived?: DogDerivedStats;
}

export interface DogInfoUpdateRequest {
  dogId: string;
  name?: string;
  iconKey?: string;
}

export interface DogInfoUpdateResponse {
  dog: DogInfo;
}

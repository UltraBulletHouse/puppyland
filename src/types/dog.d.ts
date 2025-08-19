export interface DogBuffs {
  buffSku: string;
  name: string;
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
  buffsForDoghouses: DogBuffs[] | null;
  buffsForDog: DogBuffs[] | null;
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
  name: string;
}

export interface DogInfoUpdateResponse {
  dog: DogInfo;
}

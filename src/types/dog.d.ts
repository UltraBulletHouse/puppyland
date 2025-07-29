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

export interface DogInfoResponse {
  dog: DogInfo;
}

export interface DogInfoUpdateRequest {
  dogId: string;
  name: string;
}

export interface DogInfoUpdateResponse {
  dog: DogInfo;
}

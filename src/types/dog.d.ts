export interface DogInfo {
  id: string;
  userId: string;
  name: string;
  availableDoghouses: number;
  energy: number;
  energyMax: number;
  experience: number;
  level: number;
  expForNextLevel: number;
  buffsForDoghouses: null;
  buffsForDog: null;
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

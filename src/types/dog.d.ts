export interface DogInfo {
  id: string;
  userId: string;
  name: string;
  attackPower: number;
  availableDoghouses: number;
  availableAttacks: number;
  ownedDoghouses: number;
  experience: number;
  level: number;
}

export interface DogInfoResponse {
  dog: DogInfo;
}

export interface DogInfoUpdateRequest {
  dogId: string;
  name: string;
}

export interface DogInfoUpdateResponse {
  name: string;
}

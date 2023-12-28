import { DogInfo } from './dog';

export interface Doghouse {
  id: string;
  dogId: string;
  name: string;
  lat: number;
  lng: number;
  hp: number;
  maxHp: number;
  createdDate: string;
}

export interface NearDoghousesResponse {
  doghousesList: Doghouse[];
}

export interface ClosestDoghouse {
  doghouse: Doghouse | null;
  diff: number;
}

export interface GetDoghouseResponse {
  doghousesList: Doghouse[];
}

export interface CreateDoghouseResponse {
  id: string;
  dog: DogInfo;
  name: string;
  hp: number;
  maxHp: number;
  lng: number;
  lat: number;
}

export interface AttackResult {
  experienceGained: number;
  damageDealt: number;
  isDoghouseDestroyed: boolean;
}

export interface AttackDoghouseResponse {
  doghouse: Doghouse;
  dog: DogInfo;
  attackResult: AttackResult;
}

export interface UpdateDoghouseResponse {
  name: string;
}

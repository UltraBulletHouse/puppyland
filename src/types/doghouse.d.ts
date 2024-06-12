import { DogInfo } from './dog';

export interface Doghouse {
  id: string;
  dogId: string;
  dogName: string;
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

export interface CreateResult {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  lng: number;
  lat: number;
  experienceGained: number;
}

export interface CreateDoghouseResponse {
  dog: DogInfo;
  createResult: CreateResult;
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

export interface RepairDoghouseResponse {
  doghouse: Doghouse;
  dog: DogInfo;
}

export interface UpdateDoghouseResponse {
  doghouse: Doghouse;
}

export interface GeoRange {
  latitudeMin: number;
  longitudeMin: number;
  latitudeMax: number;
  longitudeMax: number;
}
export interface GetDoghouseNearUserResponse {
  doghousesList: Doghouse[];
  geoRange: GeoRange;
}

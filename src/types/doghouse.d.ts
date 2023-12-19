import { DogInfo } from './dog';
import { UserInfo } from './userInfo';

export interface Doghouse {
  id: string;
  dogId: string;
  name: string;
  lat: number;
  lng: number;
  hp: number;
  maxHp: number;
}

export interface NearDoghousesResponse {
  doghousesList: Doghouse[];
}

export interface ClosestDoghouse {
  doghouse: Doghouse | null;
  diff: number;
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

export interface AttackDoghouseResponse {
  attackDmg: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  user: UserInfo;
}

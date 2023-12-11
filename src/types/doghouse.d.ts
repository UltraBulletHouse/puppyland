import { UserInfo } from './userInfo';

export interface NearDoghousesResponse {
  doghousesList: Doghouse[];
}

export interface Doghouse {
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  hp: number;
  maxHp: number;
}

export interface ClosestDoghouse {
  doghouse: Doghouse | null;
  diff: number;
}

export interface CreateDoghouseResponse {
  id: string;
  user: UserInfo;
  name: string;
  hp: number;
  maxHp: number;
  lng: number;
  lat: number;
}

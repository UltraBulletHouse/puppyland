export interface DogHouse {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  hp: number;
  maxHp: number;
}

export interface ClosestDogHouse {
  dogHouse: DogHouse | null;
  diff: number;
}

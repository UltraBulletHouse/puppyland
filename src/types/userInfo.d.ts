export interface UserInfo {
  id: string;
  email: string;
  name: string;
  avaliableDogHouses: number;
  avaliableAttacks: number;
  ownedDogHouses: number;
}

export interface UserInfoResponse {
  user: UserInfo;
}

import L from 'leaflet';
import { LitElement } from 'lit';

import { Doghouse } from '../types/doghouse';
import { UserInfo } from '../types/userInfo';

export declare class AppMap extends LitElement {
  static styles: import('lit').CSSResult[];
  accessToken: string | null;
  userInfo: UserInfo | null;
  lat?: number;
  lng?: number;
  map?: L.Map;
  userPosMarker?: L.Marker;
  doghouses?: Doghouse[];
  closestDoghouse: Doghouse | null;
  getUserPosition(): void;
  watchUserPostion(): void;
  centerPosition(): void;
  setDoghousesMarkers(): Promise<void>;
  addDoghouse(): Promise<void>;
  attackDoghouse(): Promise<void>;
  connectedCallback(): void;
  firstUpdated(): void;
  render(): import('lit-html').TemplateResult<1>;
}

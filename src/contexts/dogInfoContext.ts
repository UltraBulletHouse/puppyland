import { createContext } from '@lit/context';
import { LitElement } from 'lit';

import { DogInfo } from '../types/dog';

export const dogInfoContext = createContext<DogInfo | null>('dogInfo');

export const updateDogInfoEvent = (element: LitElement, dogInfo: DogInfo) => {
  const options: CustomEventInit<DogInfo> = {
    detail: dogInfo,
    bubbles: true,
    composed: true,
  };
  element.dispatchEvent(new CustomEvent<DogInfo>('updateDogInfo', options));
};

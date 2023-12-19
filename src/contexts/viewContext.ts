import { createContext } from '@lit/context';
import { LitElement } from 'lit';

import { View } from '../types/view';

export const viewContext = createContext<View>('view');

export const updateViewEvent = (element: LitElement, view: View) => {
  const options: CustomEventInit<View> = {
    detail: view,
    bubbles: true,
    composed: true,
  };
  element.dispatchEvent(new CustomEvent<View>('updateView', options));
};

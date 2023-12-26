import { LitElement } from 'lit';

export const sendEvent = <T>(element: LitElement, name: string, detail?: T) => {
  const options: CustomEventInit<any> = {
    detail: detail,
    bubbles: true,
    composed: true,
  };
  element.dispatchEvent(new CustomEvent<T>(name, options));
};

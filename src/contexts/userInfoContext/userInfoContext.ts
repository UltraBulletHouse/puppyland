import { createContext } from '@lit/context';
import { LitElement } from 'lit';

import { UserInfo } from '../../types/userInfo';

export const userInfoContext = createContext<UserInfo | null>('userInfo');

export const updateUserInfoEvent = (element: LitElement, user: UserInfo) => {
  const options: CustomEventInit<UserInfo> = {
    detail: user,
    bubbles: true,
    composed: true,
  };
  element.dispatchEvent(new CustomEvent<UserInfo>('updateUserInfo', options));
};

import { createContext } from '@lit/context';

import { UserInfo } from '../types/userInfo';

export const userInfoContext = createContext<UserInfo | null>('userInfo');

import { createContext } from '@lit/context';

import { UserFirebase } from '../utils/firebase';

export const userFirebaseContext = createContext<UserFirebase>('userFirebase');

export const accessTokenContext = createContext<string | null>('accessToken');

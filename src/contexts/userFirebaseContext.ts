import { createContext } from '@lit/context';

import { User } from 'firebase/auth';

export const userFirebaseContext = createContext<User | null>('userFirebase');

export const accessTokenContext = createContext<string | null>('accessToken');

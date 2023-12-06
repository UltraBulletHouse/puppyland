import { createContext } from '@lit/context';

import { UserFirebase } from '../utils/firebase';

export const userFirebaseContext = createContext<UserFirebase>('userFirebase');

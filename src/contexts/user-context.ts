import { createContext } from '@lit/context';

import { UserFirebase } from '../utils/firebase';

export const userContext = createContext<UserFirebase>('userFirebase');

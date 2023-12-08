import { createContext } from '@lit/context';

import { Views } from '../constants/viewsConstants';

export const viewsContext = createContext<Views>('views');

import { createContext } from '@lit/context';

import { View } from '../types/view';

export const viewContext = createContext<View>('view');

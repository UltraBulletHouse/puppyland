import { createContext } from '@lit/context';

import { Coords } from '../types/geolocation';

export const userPosContext = createContext<Coords | null>('userPos');

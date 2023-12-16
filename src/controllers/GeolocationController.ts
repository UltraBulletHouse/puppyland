import { ReactiveController, ReactiveControllerHost } from 'lit';

import { Coords } from '../types/geolocation';
import { watchUserPosition } from '../utils/geolocationUtils';

export class GeolocationController implements ReactiveController {
  private host: ReactiveControllerHost;
  userPos: Coords | null = null;

  constructor(host: ReactiveControllerHost) {
    // Store a reference to the host
    this.host = host;
    // Register for lifecycle updates
    this.host.addController(this);
  }

  hostConnected() {}

  hostDisconnected() {}

  watchUserPostion(watchUserPosSuccess: (userPos: Coords) => void) {
    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      this.userPos = { lat, lng };
      watchUserPosSuccess({ lat, lng });
    };

    watchUserPosition(watchUserPositionSuccess);
  }
}

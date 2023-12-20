import { ReactiveController, ReactiveControllerHost } from 'lit';

import { Coords } from '../types/geolocation';
import { alertNotifyDanger } from '../utils/alertsUtils';
import { watchUserPosition } from '../utils/geolocationUtils';

export class GeolocationController implements ReactiveController {
  private host: ReactiveControllerHost;

  userPos: Coords | null = null;
  permissionGeolocation: boolean | null = null;

  constructor(host: ReactiveControllerHost) {
    // Store a reference to the host
    this.host = host;
    // Register for lifecycle updates
    this.host.addController(this);
  }

  hostConnected() {
    this.checkPermissions();
  }

  hostDisconnected() {}

  checkPermissions() {
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state == 'denied') {
        alertNotifyDanger('Your geolocation is blocked');
        this.permissionGeolocation = false;
      }

      permissionStatus.onchange = () => {
        if (permissionStatus.state == 'granted') {
          this.permissionGeolocation = true;
        }
        if (permissionStatus.state == 'denied') {
          alertNotifyDanger('Your geolocation is blocked');
          this.permissionGeolocation = false;
        }
      };
    });
  }

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

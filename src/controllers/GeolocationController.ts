import { ReactiveController, ReactiveControllerHost } from 'lit';

import { Coords } from '../types/geolocation';
import { getUserPosition, watchUserPosition } from '../utils/geolocationUtils';

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
    console.log('CONNECTED');
    this.checkPermissions();
  }

  private watchId: number | null = null;

  hostDisconnected() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  resetController() {
    this.host.removeController(this);
    this.host.addController(this);
  }

  checkPermissions() {
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state == 'denied') {
        this.permissionGeolocation = false;
      }
      if (permissionStatus.state == 'granted') {
        this.permissionGeolocation = true;
      }

      permissionStatus.onchange = () => {
        console.log('permissionStatus', permissionStatus.state);

        if (permissionStatus.state == 'granted') {
          this.permissionGeolocation = true;
        }
        if (permissionStatus.state == 'denied') {
          this.permissionGeolocation = false;
        }
      };
    });
  }

  watchUserPostion(watchUserPosSuccess: (userPos: Coords) => void) {
    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const numberToFixed = (number: number) => parseFloat(number.toFixed(4));

      const lat = numberToFixed(pos.coords.latitude);
      const lng = numberToFixed(pos.coords.longitude);

      if (this.userPos?.lat === lat && this.userPos?.lng === lng) return;

      this.userPos = { lat, lng };
      watchUserPosSuccess({ lat, lng });
    };

    this.watchId = watchUserPosition(watchUserPositionSuccess) || null;
  }

  getUserPosition(getUserPosSuccess: (userPos: Coords) => void) {
    const watchUserPositionSuccess = (pos: GeolocationPosition) => {
      const numberToFixed = (number: number) => parseFloat(number.toFixed(4));

      const lat = numberToFixed(pos.coords.latitude);
      const lng = numberToFixed(pos.coords.longitude);

      if (this.userPos?.lat === lat && this.userPos?.lng === lng) return;

      this.userPos = { lat, lng };
      getUserPosSuccess({ lat, lng });
    };

    getUserPosition(watchUserPositionSuccess);
  }
}

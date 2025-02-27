import { ReactiveController, ReactiveControllerHost } from 'lit';

import { Coords } from '../types/geolocation';
import { alertNotifyDanger, alertNotifySuccess } from '../utils/alertsUtils';
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
    this.checkPermissions();
  }

  hostDisconnected() {}

  checkPermissions() {
    this.host.requestUpdate()
    
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state == 'denied') {
        alertNotifyDanger('Permission for geolocation denied');
        this.permissionGeolocation = false;
      }
      if (permissionStatus.state == 'granted') {
        this.permissionGeolocation = true;
      }

      permissionStatus.onchange = () => {
        console.log('permissionStatus', permissionStatus.state);

        if (permissionStatus.state == 'granted') {
          this.permissionGeolocation = true;
          alertNotifySuccess('Permission for geolocation granted');
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
      const numberToFixed = (number: number) => parseFloat(number.toFixed(4));

      const lat = numberToFixed(pos.coords.latitude);
      const lng = numberToFixed(pos.coords.longitude);

      if (this.userPos?.lat === lat && this.userPos?.lng === lng) return;

      this.userPos = { lat, lng };
      watchUserPosSuccess({ lat, lng });
    };

    watchUserPosition(watchUserPositionSuccess);
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

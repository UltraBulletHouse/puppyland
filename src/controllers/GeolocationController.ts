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
    this.handlePermissions();
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

  handlePermissions() {
    navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
      this.updatePermissionState(permissionStatus.state);

      permissionStatus.onchange = () => {
        this.updatePermissionState(permissionStatus.state);
        if (permissionStatus.state === 'granted') {
          this.getUserPosition(pos => {
            this.userPos = pos;
            this.host.requestUpdate();
          });
        }
      };
    });
  }

  private updatePermissionState(state: PermissionState) {
    if (state === 'denied') {
      this.permissionGeolocation = false;
    } else if (state === 'granted') {
      this.permissionGeolocation = true;
    } else {
      this.permissionGeolocation = null;
    }
    this.host.requestUpdate();
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

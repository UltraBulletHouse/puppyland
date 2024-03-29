import { alertNotifyWarning } from './alertsUtils';

// TODO: Usunac
export const getHeading = (deviceOrientChange: (heading: number | null) => void) => {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (event) {
      alertNotifyWarning('Orient absolute' + `${event.absolute}`);
      deviceOrientChange(event.alpha);
    });
  }
};

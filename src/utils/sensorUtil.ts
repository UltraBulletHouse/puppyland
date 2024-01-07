export const getHeading = (deviceOrientChange: (heading: number | null) => void) => {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (event) {
      deviceOrientChange(event.alpha);
    });
  }
};

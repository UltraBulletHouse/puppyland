import { alertNotifyDanger } from './alertsUtils';

export const watchPositionOptions: PositionOptions = {
  enableHighAccuracy: true,
  // Get high accuracy reading, if available (default false)
  timeout: 30000,
  // Time to return a position successfully before error (default infinity)
  maximumAge: 1000,
  // Milliseconds for which it is acceptable to use cached position (default 0)
};

// const watchUserPositionSuccess = (pos: GeolocationPosition) => {
//   const lat = pos.coords.latitude;
//   const lng = pos.coords.longitude;
//   const heading = pos.coords.heading // Where device is pointing
//   const accuracy = pos.coords.accuracy; // Accuracy in metres
// };

export const watchPositionError = (err: GeolocationPositionError) => {
  console.log('watchPositionError', err);
  if (err.code === 1) {
    alertNotifyDanger('Please allow geolocation access');
  } else {
    // alertNotifyDanger('Geolocation is turned off ' + err.message);
    // console.log(err);
  }
};
//TODO: Przeniesc do controllera wszystko i zapisywac id
export const watchUserPosition = (watchUserPositionSuccess: PositionCallback) => {
  // alertNotifyWarning(navigator.geolocation.getCurrentPosition.toString());
  // console.log('watchUserPosition',navigator.geolocation);

  if ('geolocation' in navigator) {
    // alertNotifyWarning('WATCH USER - utils');
    // navigator.geolocation.clearWatch(1);
    // navigator.geolocation.clearWatch(2);

    navigator.geolocation.watchPosition(
      watchUserPositionSuccess,
      watchPositionError,
      watchPositionOptions
    );
  } else {
    // alertNotifyDanger('Watch position: No geolocation access');
  }
};

export const getUserPosition = (getUserPositionSuccess: PositionCallback) => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      getUserPositionSuccess,
      watchPositionError,
      watchPositionOptions
    );
  } else {
    // alertNotifyDanger('Get position: No geolocation access');
  }
};

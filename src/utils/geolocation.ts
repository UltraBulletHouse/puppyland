export const watchPositionOptions: PositionOptions = {
  enableHighAccuracy: true,
  // Get high accuracy reading, if available (default false)
  timeout: 5000,
  // Time to return a position successfully before error (default infinity)
  maximumAge: 5000,
  // Milliseconds for which it is acceptable to use cached position (default 0)
};

// const watchUserPositionSuccess = (pos: GeolocationPosition) => {
//   const lat = pos.coords.latitude;
//   const lng = pos.coords.longitude;
// const heading = pos.coords.heading // Where device is pointing
// const accuracy = pos.coords.accuracy; // Accuracy in metres
// };

export const watchPositionError = (err: GeolocationPositionError) => {
  if (err.code === 1) {
    // Runs if user refuses access
    console.log('Please allow geolocation access');
  } else {
    console.log(err);
  }
};

export const watchUserPosition = (watchUserPositionSuccess: PositionCallback) => {
  navigator.geolocation.watchPosition(
    watchUserPositionSuccess,
    watchPositionError,
    watchPositionOptions
  );
};

export const getUserPostion = (getUserPositionSuccess: PositionCallback) => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      getUserPositionSuccess,
      watchPositionError,
      watchPositionOptions
    );
  } else {
    console.log('Please allow geolocation access');
  }
};

/**
 * Accurate Qibla bearing and distance calculations from any coordinates on Earth
 */

export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

/**
 * Calculates the forward azimuth / bearing from user's location to the Kaaba in Mecca
 * Returns degrees between 0° and 360° (clockwise from True North)
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = toDegrees(Math.atan2(y, x));
  // Normalize to 0° - 360°
  qibla = (qibla + 360) % 360;

  return Math.round(qibla * 10) / 10;
}

/**
 * Calculates Great Circle distance to Mecca in kilometers
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371; // Earth radius in kilometers
  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaPhi = toRadians(KAABA_COORDINATES.latitude - latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Computes difference between user compass heading and true Qibla bearing
 * Value between -180 and +180 degrees. If Math.abs(diff) <= tolerance, device is facing Kaaba.
 */
export function getHeadingDeviation(heading: number, qiblaDirection: number): number {
  let diff = (qiblaDirection - heading + 360) % 360;
  if (diff > 180) {
    diff -= 360;
  }
  return diff;
}

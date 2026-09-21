/**
 * Maps service — Google Maps Platform integration point.
 *
 * The frontend renders a simulated SVG city map with zero setup. To go
 * live with real roads and traffic:
 *
 *   1. Enable "Directions API" and "Distance Matrix API" in Google Cloud
 *      Console, and create a server-side API key restricted to your
 *      backend's IP / referrer.
 *   2. Put that key in backend/.env as GOOGLE_MAPS_API_KEY (never expose
 *      it in frontend code — the frontend should call YOUR backend, which
 *      calls Google, so the key never reaches the browser).
 *   3. Implement the two functions below using `fetch` against the Google
 *      Maps HTTP APIs, or the official @googlemaps/google-maps-services-js
 *      Node client.
 *   4. Have routes/routing.js call these instead of services/routingEngine.js's
 *      mock candidateRoutes().
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

function isConfigured() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

/**
 * getDirections(origin, destination) -> multiple route alternatives with
 * live distance/duration. Example real implementation:
 *
 *   const url = `https://maps.googleapis.com/maps/api/directions/json` +
 *     `?origin=${origin}&destination=${destination}&alternatives=true` +
 *     `&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`;
 *   const res = await fetch(url);
 *   return res.json();
 */
async function getDirections(origin, destination) {
  if (!isConfigured()) {
    throw new Error("GOOGLE_MAPS_API_KEY not set — using simulated routing instead. See services/mapsService.js");
  }
  // Real call would go here.
  throw new Error("getDirections() is a placeholder — implement the Google Directions API call.");
}

/**
 * getEtaWithTraffic(origin, destination) -> live ETA via Distance Matrix API,
 * accounting for current traffic conditions.
 */
async function getEtaWithTraffic(origin, destination) {
  if (!isConfigured()) {
    throw new Error("GOOGLE_MAPS_API_KEY not set — using simulated ETA instead. See services/mapsService.js");
  }
  throw new Error("getEtaWithTraffic() is a placeholder — implement the Google Distance Matrix API call.");
}

module.exports = { isConfigured, getDirections, getEtaWithTraffic };

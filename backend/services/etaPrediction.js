/**
 * ETA prediction service
 *
 * Provides a realistic heuristic prediction so the app is fully functional
 * without a trained model. The function signature is deliberately the
 * interface a real ML model/API would expose, so predictHeuristic() can be
 * swapped for e.g. predictWithModel() (a call to a hosted sklearn/PyTorch
 * inference endpoint) without touching any calling code.
 *
 * Expected real-world inputs: traffic density, current speed, road distance,
 * historical traffic for the time of day, and road condition.
 */

function predictEta({ distanceKm = 6, trafficDensity = 0.5, timeOfDay = new Date().getHours() } = {}) {
  const baseSpeedKmh = 40;
  const trafficFactor = 1 + trafficDensity; // 1.0 (clear) .. 2.0 (gridlock)
  const rushHour = (timeOfDay >= 8 && timeOfDay <= 10) || (timeOfDay >= 17 && timeOfDay <= 20);
  const rushPenalty = rushHour ? 1.15 : 1;

  const effectiveSpeed = baseSpeedKmh / (trafficFactor * rushPenalty);
  const etaMinutes = (distanceKm / effectiveSpeed) * 60;
  const etaSeconds = Math.round(etaMinutes * 60);

  // Confidence shrinks slightly with higher traffic uncertainty.
  const confidence = Math.round(96 - trafficDensity * 10 - (rushHour ? 4 : 0));

  return {
    etaSeconds,
    etaFormatted: formatSeconds(etaSeconds),
    confidence: Math.max(70, Math.min(97, confidence)),
  };
}

function formatSeconds(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")} min ${String(s).padStart(2, "0")} sec`;
}

module.exports = { predictEta };

/**
 * Routing engine
 *
 * Simulates evaluating multiple candidate routes the way a time-dependent
 * A* / Dijkstra search would: weighing distance against predicted traffic,
 * road capacity and risk, rather than always picking the shortest path.
 *
 * Swap-in point for a real implementation:
 *   - Replace candidateRoutes() with calls to mapsService.getDirections()
 *     (Google Directions API, returns multiple alternatives) and score each
 *     alternative using live traffic data instead of the mock weights below.
 */

function candidateRoutes() {
  return [
    { id: "A", distanceKm: 7.2, etaMin: 11, traffic: "Heavy", risk: "Medium" },
    { id: "B", distanceKm: 8.1, etaMin: 8, traffic: "Low", risk: "Low" },
    { id: "C", distanceKm: 6.5, etaMin: 13, traffic: "Very Heavy", risk: "High" },
  ];
}

const riskPenalty = { Low: 0, Medium: 4, High: 9 };

function scoreRoute(route) {
  // Lower score = better. ETA dominates, risk and traffic add a penalty.
  return route.etaMin + riskPenalty[route.risk];
}

function pickBestRoute() {
  const routes = candidateRoutes();
  const scored = routes.map(r => ({ ...r, score: scoreRoute(r) }));
  const best = scored.reduce((a, b) => (b.score < a.score ? b : a));
  return {
    routes: scored,
    best,
    reason: `Route ${best.id} minimizes predicted travel time after accounting for traffic risk, even when it is not the shortest by distance.`,
  };
}

function recalculateAfterBlockage(previousEtaSeconds = 452) {
  // Simulate a recalculated, slightly faster alternative route.
  const newEtaSeconds = Math.max(60, Math.round(previousEtaSeconds * (0.85 + Math.random() * 0.08)));
  return {
    previousEta: formatSeconds(previousEtaSeconds),
    newEta: formatSeconds(newEtaSeconds),
    savedSeconds: previousEtaSeconds - newEtaSeconds,
  };
}

function formatSeconds(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

module.exports = { candidateRoutes, pickBestRoute, recalculateAfterBlockage };

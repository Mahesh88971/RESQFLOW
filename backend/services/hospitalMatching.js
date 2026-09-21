/**
 * Hospital matching service
 *
 * Scores hospitals on a mix of distance, department availability and
 * current load, so the closest hospital doesn't always win if it can't
 * actually take the patient.
 */

const availabilityScore = { Available: 1, Limited: 0.5, Busy: 0.1 };

function scoreHospital(hospital) {
  const distanceKm = parseFloat(hospital.distance) || 10;
  const distanceScore = Math.max(0, 30 - distanceKm * 2); // closer = higher, capped contribution

  const icu = (availabilityScore[hospital.icu] ?? 0.3) * 25;
  const emergency = (availabilityScore[hospital.emergency] ?? 0.3) * 25;
  const trauma = (availabilityScore[hospital.trauma] ?? 0.3) * 10;
  const loadScore = Math.max(0, (100 - (hospital.load ?? 50)) / 10);

  const total = distanceScore + icu + emergency + trauma + loadScore;
  return Math.round(Math.min(100, total));
}

function rankHospitals(hospitals) {
  return hospitals
    .map(h => ({ ...h, score: scoreHospital(h) }))
    .sort((a, b) => b.score - a.score);
}

function recommend(hospitals) {
  const ranked = rankHospitals(hospitals);
  const top = ranked[0];
  const runnerUp = ranked[1];
  const reason = runnerUp && parseFloat(top.distance) > parseFloat(runnerUp.distance)
    ? "Better emergency capacity despite a slightly longer distance."
    : "Closest hospital with sufficient capacity for this case.";
  return { ranked, recommended: top, reason };
}

module.exports = { scoreHospital, rankHospitals, recommend };

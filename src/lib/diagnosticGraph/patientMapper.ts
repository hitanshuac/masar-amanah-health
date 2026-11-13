/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Longitudinal Record -> ScreeningInput Deterministic Bridge.
 * Strictly preserves the Null Invariant (null semenLab => hasSemenReport = false, semen fields = null).
 */

import { LongitudinalPatientRecord } from '../../types/diagnosticGraph';
import { ScreeningInput } from '../../types/screening';

/**
 * Maps a LongitudinalPatientRecord's latest encounter into a valid deterministic ScreeningInput.
 * Strictly preserves the Null Invariant (null semenLab => hasSemenReport = false, semen fields = null).
 */
export function mapLongitudinalPatientToScreeningInput(
  record: LongitudinalPatientRecord
): ScreeningInput {
  const latest =
    record.encounters && record.encounters.length > 0
      ? record.encounters[record.encounters.length - 1]
      : null;

  const bmi = latest?.vitals?.bmi ?? 24.5;
  const heightCm = 175;
  const weightKg = Math.round(bmi * (1.75 * 1.75));

  const acutePain = Boolean(latest?.clinicalFlags?.acuteScrotalPain);
  const painlessLump = Boolean(latest?.clinicalFlags?.painlessTesticularMass);

  const steroidsTrt = Boolean(
    latest?.medications?.some((m) => m.class === 'TRT_ANDROGEN' || m.class === '5ARI')
  );

  const undescendedTesticle = Boolean(latest?.clinicalFlags?.cryptorchidismHistory);
  const varicocele = (latest?.clinicalFlags?.varicoceleGrade ?? 0) > 0;
  const mumpsOrchitis = Boolean(latest?.clinicalFlags?.mumpsOrchitisHistory);

  const sittingHours = latest?.clinicalFlags?.sittingHoursPerDay ?? 6;
  const frequentHeat = Boolean(latest?.clinicalFlags?.frequentThermalExposure);
  const tobaccoShisha = latest?.clinicalFlags?.tobaccoUsage ?? 'none';

  const hasSemenReport = latest?.semenLab !== null && latest?.semenLab !== undefined;
  const semenVolume = hasSemenReport && latest?.semenLab ? latest.semenLab.volumeMl : null;
  const semenConcentration =
    hasSemenReport && latest?.semenLab ? latest.semenLab.concentrationMMl : null;
  const semenMotility =
    hasSemenReport && latest?.semenLab ? latest.semenLab.totalMotilityPct : null;
  const semenMorphology =
    hasSemenReport && latest?.semenLab ? latest.semenLab.normalMorphologyPct : null;

  return {
    acutePain,
    painlessLump,
    age: record.age,
    heightCm,
    weightKg,
    bmi,
    steroidsTrt,
    undescendedTesticle,
    varicocele,
    mumpsOrchitis,
    sittingHours,
    frequentHeat,
    tobaccoShisha,
    hasSemenReport,
    semenVolume,
    semenConcentration,
    semenMotility,
    semenMorphology,
  };
}


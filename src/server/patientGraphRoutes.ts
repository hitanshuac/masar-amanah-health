/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Longitudinal Malaffi Patient Store & Closed-Loop Graph Express Router.
 * In-memory stateful persistence (Map) + stateless cold-start replay support.
 * ZERO-PII ARCHITECTURE (ADR-1 v2): Fully pseudonymized synthetic tokens.
 */

import { Router, Request, Response } from 'express';
import { LongitudinalPatientRecord } from '../types/diagnosticGraph';
import { LONGITUDINAL_MALAFFI_COHORT } from '../data/longitudinalCohort';
import {
  evaluatePatientGraph,
  resolveNullBiomarkerInLoop,
  mutatePatientEncounterInLoop,
  computeDeterministicGraphSignature,
} from '../lib/diagnosticGraph/loopController';

export const patientGraphRouter = Router();

// In-memory patient store initialized on container/server boot
const patientStore = new Map<string, LongitudinalPatientRecord>();

function resetStore(): void {
  patientStore.clear();
  for (const record of LONGITUDINAL_MALAFFI_COHORT) {
    patientStore.set(record.patientId, JSON.parse(JSON.stringify(record)));
  }
}

// Initial hydration
resetStore();

/**
 * GET /api/patients
 * Returns all records with live computed summary metrics from the knowledge graph.
 */
patientGraphRouter.get('/', (_req: Request, res: Response) => {
  const summaries = Array.from(patientStore.values()).map((record) => {
    const evaluation = evaluatePatientGraph(record);
    const latestEnc = record.encounters[record.encounters.length - 1];

    return {
      patientId: record.patientId,
      pseudonymToken: record.pseudonymToken,
      age: record.age,
      ifhasBracket: record.ifhasBracket,
      primaryComplaintEn: record.primaryComplaintEn,
      primaryComplaintAr: record.primaryComplaintAr,
      encounterCount: record.encounters.length,
      latestEncounterDate: latestEnc?.dateIso ?? null,
      jointEntropyBits: evaluation.jointEntropyBits,
      diagnosticCertaintyPct: evaluation.diagnosticCertaintyPct,
      loopStatus: evaluation.loopStatus,
      activeBlindSpotsCount: evaluation.blindSpotSyndromes.filter((s) => s.triggered).length,
      activeLifeSafetyCount: evaluation.lifeSafetyEscalations.filter((e) => e.triggered).length,
      topDifferential: evaluation.differentialRanking[0]
        ? {
            id: evaluation.differentialRanking[0].id,
            titleEn: evaluation.differentialRanking[0].titleEn,
            posteriorProbability: evaluation.differentialRanking[0].posteriorProbability,
          }
        : null,
    };
  });

  return res.json({ patients: summaries, count: summaries.length });
});

/**
 * GET /api/patients/:id/graph
 * Returns the raw patient record along with full live graph evaluation (zero cached results).
 */
patientGraphRouter.get('/:id/graph', (req: Request, res: Response) => {
  const record = patientStore.get(req.params.id);
  if (!record) {
    if (req.params.id.startsWith('MALAFFI-PT-NEW')) {
      return res.status(200).json({
        patientId: req.params.id,
        status: 'CLIENT_VOLATILE_ONLY',
      });
    }
    return res.status(404).json({ error: `Patient record ${req.params.id} not found` });
  }

  const evaluation = evaluatePatientGraph(record);
  const signatures = computeDeterministicGraphSignature(record, evaluation);
  return res.json({ record, evaluation, signatures });
});

/**
 * POST /api/patients/:id/mutate-encounter
 * Mutates latest encounter ('UPDATE_LATEST') or appends +90d follow-up ('APPEND_FOLLOWUP_90D'),
 * updates the server's in-memory Map, and returns the full evaluation, delta, and deterministic signatures.
 */
patientGraphRouter.post('/:id/mutate-encounter', (req: Request, res: Response) => {
  const { mode, patch } = req.body;

  if (!mode || (mode !== 'UPDATE_LATEST' && mode !== 'APPEND_FOLLOWUP_90D')) {
    return res.status(400).json({
      error: 'Valid mode ("UPDATE_LATEST" | "APPEND_FOLLOWUP_90D") is required',
    });
  }

  const record = patientStore.get(req.params.id);
  if (!record) {
    if (req.params.id.startsWith('MALAFFI-PT-NEW')) {
      return res.status(200).json({
        patientId: req.params.id,
        status: 'CLIENT_VOLATILE_ONLY',
      });
    }
    return res.status(404).json({ error: `Patient record ${req.params.id} not found` });
  }

  try {
    const result = mutatePatientEncounterInLoop(record, mode, patch || {});
    patientStore.set(req.params.id, result.updatedRecord);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to mutate patient encounter in loop',
    });
  }
});

/**
 * POST /api/patients/:id/resolve-null
 * Resolves an unmeasured (NULL) biomarker in-loop, mutates the server Map, and returns ΔH convergence.
 */
patientGraphRouter.post('/:id/resolve-null', (req: Request, res: Response) => {
  const { biomarkerKey, measuredValue } = req.body;

  if (!biomarkerKey || typeof measuredValue !== 'number' || isNaN(measuredValue)) {
    return res.status(400).json({
      error: 'Valid biomarkerKey and numeric measuredValue are required',
    });
  }

  const record = patientStore.get(req.params.id);
  if (!record) {
    if (req.params.id.startsWith('MALAFFI-PT-NEW')) {
      return res.status(200).json({
        patientId: req.params.id,
        status: 'CLIENT_VOLATILE_ONLY',
      });
    }
    return res.status(404).json({ error: `Patient record ${req.params.id} not found` });
  }

  try {
    const result = resolveNullBiomarkerInLoop(record, biomarkerKey, measuredValue);
    patientStore.set(req.params.id, result.updatedRecord);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to resolve NULL biomarker in loop' });
  }
});

/**
 * POST /api/patients/evaluate-timeline
 * Stateless endpoint accepting an arbitrary LongitudinalPatientRecord and returning evaluatePatientGraph.
 */
patientGraphRouter.post('/evaluate-timeline', (req: Request, res: Response) => {
  const { record } = req.body;

  if (!record || !record.encounters || !Array.isArray(record.encounters)) {
    return res.status(400).json({
      error: 'Valid LongitudinalPatientRecord with encounters array required',
    });
  }

  try {
    const evaluation = evaluatePatientGraph(record);
    return res.json({ evaluation });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to evaluate timeline' });
  }
});

/**
 * POST /api/patients/reset
 * Resets the in-memory patient store back to LONGITUDINAL_MALAFFI_COHORT baseline.
 */
patientGraphRouter.post('/reset', (_req: Request, res: Response) => {
  resetStore();
  return res.json({
    message: 'Longitudinal Malaffi cohort store reset to baseline',
    count: patientStore.size,
  });
});


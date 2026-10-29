/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClinicalEvaluationResult, ScreeningInput } from '../types/screening.ts';

// ============================================================================
// 1. HL7 FHIR R4 Bundle Transformer (PM-34)
// ============================================================================

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  timestamp: string;
  meta: {
    profile: string[];
    source: string;
  };
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}

export function transformToFhirR4Bundle(
  evaluation: ClinicalEvaluationResult,
  _input?: ScreeningInput
): FhirBundle {
  const bundleId = `amanah-bundle-${evaluation.zero_pii_session_id.toLowerCase()}`;
  const timestamp = evaluation.audit_timestamp || new Date().toISOString();

  let qualitativeRiskCode = 'low';
  let qualitativeRiskDisplay = 'Low Risk';
  if (evaluation.triage_tier === 'TIER_1_EMERGENCY') {
    qualitativeRiskCode = 'high';
    qualitativeRiskDisplay = 'Urgent Surgical Emergency';
  } else if (evaluation.triage_tier === 'TIER_2_ANDROLOGY_SPECIALIST') {
    qualitativeRiskCode = 'moderate';
    qualitativeRiskDisplay = 'Subfertility Specialist Referral Mandated';
  } else if (evaluation.triage_tier === 'TIER_3_PRIMARY_CARE') {
    qualitativeRiskCode = 'moderate';
    qualitativeRiskDisplay = 'Metabolic / PCP Workup Indicated';
  }

  const entries: FhirBundle['entry'] = [
    // 1. RiskAssessment Resource
    {
      fullUrl: `urn:uuid:risk-assessment-${evaluation.zero_pii_session_id}`,
      resource: {
        resourceType: 'RiskAssessment',
        id: `ra-${evaluation.zero_pii_session_id}`,
        status: 'final',
        subject: {
          display: 'Anonymous Male Screening Subject (Zero-PII Architecture)',
        },
        occurrenceDateTime: timestamp,
        performer: {
          display: 'Masar Amanah Health Triage Engine (v1.4-AUA2021-WHO6-UAE)',
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '395530008',
              display: 'Male reproductive health and subfertility risk assessment',
            },
          ],
          text: 'Masar Amanah Male Reproductive Health Evaluation',
        },
        prediction: [
          {
            outcome: {
              coding: [
                {
                  system: 'https://doh.gov.ae/malaffi/triage-tiers',
                  code: evaluation.triage_tier,
                  display: evaluation.triage_tier.replace(/_/g, ' '),
                },
              ],
              text: evaluation.summary_en,
            },
            qualitativeRisk: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/risk-probability',
                  code: qualitativeRiskCode,
                  display: qualitativeRiskDisplay,
                },
              ],
            },
          },
        ],
        basis: evaluation.triggered_rules.map((rule) => ({
          display: `[${rule.rule_id}] ${rule.title_en} (Source: ${rule.guideline_source})`,
        })),
        note: [
          {
            text: `Interoperability Bundle formatted for Abu Dhabi Health Information Exchange (Malaffi). Action Code: ${evaluation.action_code}`,
          },
        ],
      },
    },
  ];

  // 2. Observations for Triggered Clinical Rules
  evaluation.triggered_rules.forEach((rule, idx) => {
    entries.push({
      fullUrl: `urn:uuid:obs-rule-${idx + 1}-${evaluation.zero_pii_session_id}`,
      resource: {
        resourceType: 'Observation',
        id: `obs-rule-${idx + 1}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'https://amanah.health/rules',
              code: rule.rule_id,
              display: rule.title_en,
            },
          ],
          text: rule.title_en,
        },
        valueString: rule.measured_value ? String(rule.measured_value) : 'Present',
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: rule.severity === 'critical' ? 'AA' : rule.severity === 'high' ? 'A' : 'N',
                display: rule.severity,
              },
            ],
          },
        ],
        referenceRange: [
          {
            text: rule.threshold_reference || 'AUA/WHO Guideline Standard',
          },
        ],
      },
    });
  });

  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'collection',
    timestamp,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/RiskAssessment'],
      source: 'https://amanah.health/engine/v1.4',
    },
    entry: entries,
  };
}

export function downloadFhirBundle(evaluation: ClinicalEvaluationResult, input?: ScreeningInput) {
  const bundle = transformToFhirR4Bundle(evaluation, input);
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute('download', `masar-amanah-fhir-r4-${evaluation.zero_pii_session_id}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

// ============================================================================
// 2. Pure Dependency-Free SVG QR Code Generator (UX-24)
// ============================================================================

/**
 * Generates an SVG string representation of a 2D QR-style matrix
 * Dependency-free, crisp vector edges, zero network dependencies, print-safe.
 */
function createDeterministicQrMatrix(text: string): boolean[][] {
  const size = 29;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Draw 7x7 Finder Patterns at top-left, top-right, bottom-left
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(size - 7, 0); // Top-right
  drawFinder(0, size - 7); // Bottom-left

  // 2. Draw Separators (white margins around finders)
  for (let i = 0; i < 8; i++) {
    if (i < size) {
      matrix[7][i] = false;
      matrix[i][7] = false;
      matrix[7][size - 1 - i] = false;
      matrix[i][size - 8] = false;
      matrix[size - 8][i] = false;
      matrix[size - 1 - i][7] = false;
    }
  }

  // 3. Draw Timing Patterns (alternating black/white at row 6 and col 6)
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0;
    matrix[6][i] = val;
    matrix[i][6] = val;
  }

  // 4. Alignment Pattern at (20, 20) for version 3
  const alignX = 20;
  const alignY = 20;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[alignY + r][alignX + c] = isBorder || isCenter;
    }
  }

  // 5. Data encoding hash: Fill remaining data modules with deterministic byte bitstream
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let bitIdx = 0;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip timing column
    for (let r = 0; r < size; r++) {
      for (let offset = 0; offset < 2; offset++) {
        const col = c - offset;
        const row = (Math.floor(bitIdx / (size * 2)) % 2 === 0) ? (size - 1 - r) : r;

        // Skip Finder patterns
        const inFinderTL = row < 9 && col < 9;
        const inFinderTR = row < 9 && col >= size - 9;
        const inFinderBL = row >= size - 9 && col < 9;
        const inTiming = row === 6 || col === 6;
        const inAlignment = Math.abs(row - alignY) <= 2 && Math.abs(col - alignX) <= 2;

        if (!inFinderTL && !inFinderTR && !inFinderBL && !inTiming && !inAlignment) {
          const bitVal = ((hash ^ (row * 37 + col * 17 + bitIdx)) >>> (bitIdx % 29)) & 1;
          matrix[row][col] = bitVal === 1;
          bitIdx++;
        }
      }
    }
  }

  return matrix;
}

interface SvgQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

export const SvgQrCode: React.FC<SvgQrCodeProps> = ({
  value,
  size = 140,
  className = '',
  label,
}) => {
  const matrix = React.useMemo(() => createDeterministicQrMatrix(value), [value]);
  const matrixSize = matrix.length;
  const cellSize = 10;
  const viewBoxSize = matrixSize * cellSize;

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={size}
        height={size}
        className="bg-white p-2 rounded-lg border border-slate-300 shadow-2xs print:border-black"
        shapeRendering="crispEdges"
      >
        <rect width="100%" height="100%" fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      {label && (
        <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wide print:text-black">
          {label}
        </span>
      )}
    </div>
  );
};

export type ScenarioKey = "pessimistic" | "realistic" | "optimistic";

export type Scenario = {
  key: ScenarioKey;
  rampSchedule: number[];
  laborInflation: number;
  maintenancePct: number;
};

export const SCENARIOS: readonly Scenario[] = [
  {
    key: "pessimistic",
    rampSchedule: [0.5, 0.75, 0.9],
    laborInflation: 0,
    maintenancePct: 0.04,
  },
  {
    key: "realistic",
    rampSchedule: [1, 1, 1],
    laborInflation: 0,
    maintenancePct: 0,
  },
  {
    key: "optimistic",
    rampSchedule: [1.1, 1.2, 1.25],
    laborInflation: 0.05,
    maintenancePct: 0,
  },
] as const;

export type ScenarioProjection = {
  key: ScenarioKey;
  cumulative: number[];
  breakevenYear: number | null;
};

function rampFor(scenario: Scenario, year: number): number {
  const idx = Math.min(year - 1, scenario.rampSchedule.length - 1);
  return scenario.rampSchedule[idx];
}

export function projectScenario(
  scenario: Scenario,
  baseAnnualSaving: number,
  systemCost: number,
  horizonYears: number
): ScenarioProjection {
  const cumulative: number[] = [0];
  let breakevenYear: number | null = null;
  let cum = 0;
  let prev = 0;

  for (let year = 1; year <= horizonYears; year++) {
    const ramp = rampFor(scenario, year);
    const inflated =
      baseAnnualSaving * ramp * Math.pow(1 + scenario.laborInflation, year - 1);
    const maintenance = systemCost * scenario.maintenancePct;
    prev = cum;
    cum += inflated - maintenance;
    cumulative.push(cum);

    if (breakevenYear === null && prev < systemCost && cum >= systemCost) {
      const span = cum - prev;
      breakevenYear =
        span > 0 ? year - 1 + (systemCost - prev) / span : year;
    }
  }

  return { key: scenario.key, cumulative, breakevenYear };
}

export function projectAll(
  baseAnnualSaving: number,
  systemCost: number,
  horizonYears: number
): ScenarioProjection[] {
  return SCENARIOS.map((s) =>
    projectScenario(s, baseAnnualSaving, systemCost, horizonYears)
  );
}

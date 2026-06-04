export type Part = {
  id: string;
  code: string;
  annualQty: number;
  manualCycleSec: number;
  programmingSec: number;
  roboticCycleSec: number;
};

export type RoiInputs = {
  rbwSystemCost: number;
  workingDays: number;
  shiftsPerDay: number;
  hoursPerShift: number;
  hourlyLaborCost: number;
  numWelders: number;
  amortizationYears: number;
  electricityPrice: number;
  powerConsumption: number;
};

export type PartCalc = {
  manualHours: number;
  roboticHours: number;
  diffHours: number;
};

export type RoiResult = {
  perPart: PartCalc[];
  totalManualHours: number;
  totalRoboticHours: number;
  totalDiffHours: number;
  productivityIncrease: number;
  annualRobotCapacity: number;
  annualAmortization: number;
  annualPowerCost: number;
  annualAvailableLabor: number;
  annualManualCost: number;
  theoreticalWelders: number;
  robotUtilization: number;
  annualLaborSaving: number;
  roiYears: number;
  overCapacity: boolean;
};

export function calcPart(part: Part): PartCalc {
  const manualHours = (part.annualQty * part.manualCycleSec) / 3600;
  const roboticHours =
    (part.annualQty * part.roboticCycleSec) / 3600 + part.programmingSec / 3600;
  return {
    manualHours,
    roboticHours,
    diffHours: roboticHours - manualHours,
  };
}

export function calcRoi(parts: Part[], inputs: RoiInputs): RoiResult {
  const perPart = parts.map(calcPart);
  const totalManualHours = perPart.reduce((s, p) => s + p.manualHours, 0);
  const totalRoboticHours = perPart.reduce((s, p) => s + p.roboticHours, 0);
  const totalDiffHours = totalRoboticHours - totalManualHours;

  const annualRobotCapacity =
    inputs.workingDays * inputs.shiftsPerDay * inputs.hoursPerShift;

  const overCapacity = totalRoboticHours > annualRobotCapacity;

  const productivityIncrease =
    totalManualHours > 0
      ? overCapacity
        ? (1 - (annualRobotCapacity - totalManualHours)) / totalManualHours
        : (1 - totalDiffHours) / totalManualHours
      : 0;

  const annualAmortization =
    inputs.amortizationYears > 0
      ? inputs.rbwSystemCost / inputs.amortizationYears
      : 0;

  const annualPowerCost =
    inputs.electricityPrice * inputs.powerConsumption * totalRoboticHours;

  const annualAvailableLabor =
    inputs.workingDays *
    inputs.shiftsPerDay *
    inputs.hoursPerShift *
    inputs.numWelders;

  const annualManualCost = annualAvailableLabor * inputs.hourlyLaborCost;

  const theoreticalWelders =
    annualAvailableLabor > 0
      ? Math.ceil(totalManualHours / annualAvailableLabor)
      : 0;

  const robotUtilization =
    annualRobotCapacity > 0 ? totalRoboticHours / annualRobotCapacity : 0;

  const annualLaborSaving =
    annualManualCost * (theoreticalWelders * (1 + productivityIncrease)) -
    annualAmortization -
    annualPowerCost;

  const roiYears =
    annualLaborSaving > 0 ? inputs.rbwSystemCost / annualLaborSaving : NaN;

  return {
    perPart,
    totalManualHours,
    totalRoboticHours,
    totalDiffHours,
    productivityIncrease,
    annualRobotCapacity,
    annualAmortization,
    annualPowerCost,
    annualAvailableLabor,
    annualManualCost,
    theoreticalWelders,
    robotUtilization,
    annualLaborSaving,
    roiYears,
    overCapacity,
  };
}

export const DEFAULT_PARTS: Part[] = [
  { id: "p1", code: "GG14856", annualQty: 1260, manualCycleSec: 540, programmingSec: 240, roboticCycleSec: 300 },
  { id: "p2", code: "BC15959", annualQty: 2438, manualCycleSec: 840, programmingSec: 80, roboticCycleSec: 240 },
  { id: "p3", code: "BC03459", annualQty: 648, manualCycleSec: 1200, programmingSec: 210, roboticCycleSec: 300 },
  { id: "p4", code: "CA00073", annualQty: 27156, manualCycleSec: 240, programmingSec: 11, roboticCycleSec: 60 },
  { id: "p5", code: "CA00163", annualQty: 7896, manualCycleSec: 240, programmingSec: 22, roboticCycleSec: 120 },
];

export const DEFAULT_INPUTS: RoiInputs = {
  rbwSystemCost: 45000,
  workingDays: 237,
  shiftsPerDay: 1,
  hoursPerShift: 8.5,
  hourlyLaborCost: 7.65,
  numWelders: 1,
  amortizationYears: 8,
  electricityPrice: 0.06,
  powerConsumption: 3.9,
};

export const MAX_PARTS = 10;

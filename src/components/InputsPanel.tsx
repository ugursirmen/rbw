"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { RoiInputs } from "@/lib/roi";
import type { TranslationKey } from "@/i18n/dictionary";

type Props = {
  inputs: RoiInputs;
  onChange: (next: RoiInputs) => void;
};

const FIELDS: { key: keyof RoiInputs; label: TranslationKey; step?: number }[] = [
  { key: "rbwSystemCost", label: "rbw_system_cost", step: 100 },
  { key: "workingDays", label: "working_days", step: 1 },
  { key: "shiftsPerDay", label: "shifts_per_day", step: 1 },
  { key: "hoursPerShift", label: "hours_per_shift", step: 0.5 },
  { key: "hourlyLaborCost", label: "hourly_labor_cost", step: 0.05 },
  { key: "numWelders", label: "num_welders", step: 1 },
  { key: "amortizationYears", label: "amortization_years", step: 1 },
  { key: "electricityPrice", label: "electricity_price", step: 0.01 },
  { key: "powerConsumption", label: "power_consumption", step: 0.1 },
];

export default function InputsPanel({ inputs, onChange }: Props) {
  const { t } = useLanguage();

  const handle = (key: keyof RoiInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    onChange({ ...inputs, [key]: num });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        {t("inputs_section")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 2,
        }}
      >
        {FIELDS.map((field) => (
          <TextField
            key={field.key}
            label={t(field.label)}
            type="number"
            size="small"
            value={inputs[field.key]}
            onChange={handle(field.key)}
            slotProps={{ htmlInput: { min: 0, step: field.step ?? 1 } }}
          />
        ))}
      </Box>
    </Paper>
  );
}

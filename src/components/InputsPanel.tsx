"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/dictionary";
import type { RoiInputs } from "@/lib/roi";

type Props = {
  inputs: RoiInputs;
  onChange: (next: RoiInputs) => void;
  selectedSystem: string;
  onSystemChange: (value: string) => void;
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

const SYSTEMS = [
  { value: "rb-mig", label: "RB-Mig" },
  { value: "rb-tig", label: "RB-Tig" },
  { value: "rb-lazer", label: "RB-Lazer" },
  { value: "rb-cut", label: "RB-Cut" },
  { value: "rb-grind", label: "RB-Grind" },
  { value: "rb-deburr", label: "RB-Deburr" },
  { value: "rb-clean", label: "RB-Clean" },
  { value: "rb-brush", label: "RB-Brush" },
  { value: "rb-pall", label: "RB-Pall" },
];

export default function InputsPanel({ inputs, onChange, selectedSystem, onSystemChange }: Props) {
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

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>{t("rbware_system")}</InputLabel>
        <Select
          value={selectedSystem}
          label={t("rbware_system")}
          onChange={(e) => onSystemChange(e.target.value)}
        >
          <MenuItem value="">—</MenuItem>
          {SYSTEMS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSystem && (
        <Box sx={{ mb: 2 }}>
          <Image
            src={`/${selectedSystem}.png`}
            alt={selectedSystem}
            width={600}
            height={400}
            style={{ width: "100%", height: "auto", borderRadius: 4 }}
            unoptimized
          />
        </Box>
      )}

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

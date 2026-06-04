"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useLanguage } from "@/i18n/LanguageProvider";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { RoiResult } from "@/lib/roi";
import type { TranslationKey } from "@/i18n/dictionary";

type Props = {
  result: RoiResult;
};

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "primary" | "success";
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: emphasis ? `${emphasis}.main` : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function ResultsPanel({ result }: Props) {
  const { t, lang } = useLanguage();
  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const calculated: { label: TranslationKey; value: string }[] = [
    {
      label: "annual_robot_capacity",
      value: formatNumber(result.annualRobotCapacity, locale),
    },
    {
      label: "annual_available_labor",
      value: formatNumber(result.annualAvailableLabor, locale),
    },
    {
      label: "annual_manual_cost",
      value: formatCurrency(result.annualManualCost, locale),
    },
    {
      label: "annual_amortization",
      value: formatCurrency(result.annualAmortization, locale),
    },
    {
      label: "annual_power_cost",
      value: formatCurrency(result.annualPowerCost, locale),
    },
    {
      label: "theoretical_welders",
      value: formatNumber(result.theoreticalWelders, locale, 0),
    },
    {
      label: "productivity_increase",
      value: formatPercent(result.productivityIncrease, locale, 1),
    },
  ];

  const utilizationPct = Math.min(Math.max(result.robotUtilization * 100, 0), 100);

  return (
    <Stack spacing={2}>
      {result.overCapacity && (
        <Alert severity="warning">{t("warn_robot_capacity")}</Alert>
      )}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          {t("calculated_section")}
        </Typography>
        <Box>
          {calculated.map((row) => (
            <Stat key={row.label} label={t(row.label)} value={row.value} />
          ))}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {t("robot_utilization")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatPercent(result.robotUtilization, locale, 1)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={utilizationPct}
            color={result.overCapacity ? "warning" : "primary"}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Card variant="outlined" sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>
              {t("annual_labor_saving")}
            </Typography>
            <Typography variant="h1" sx={{ mt: 0.5 }}>
              {formatCurrency(result.annualLaborSaving, locale)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.9 }}>
              {t("roi_years")}
            </Typography>
            <Typography variant="h1" sx={{ mt: 0.5 }}>
              {Number.isFinite(result.roiYears)
                ? formatNumber(result.roiYears, locale, 2)
                : "—"}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}

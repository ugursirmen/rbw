"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";
import { LineChart } from "@mui/x-charts/LineChart";
import { useId, useMemo } from "react";

import { useLanguage } from "@/i18n/LanguageProvider";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { RoiResult, RoiInputs } from "@/lib/roi";
import {
  type ScenarioKey,
  type ScenarioProjection,
  projectAll,
  SCENARIOS,
} from "@/lib/scenarios";
import type { TranslationKey } from "@/i18n/dictionary";

type Props = {
  result: RoiResult;
  systemCost: RoiInputs["rbwSystemCost"];
};

const MIN_HORIZON = 8;
const MAX_HORIZON = 20;

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 160,
        px: 2.5,
        py: 1.5,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(accent, 0.18)}, ${alpha(accent, 0.04)})`,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <Typography variant="overline" sx={{ color: "text.secondary", lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="h2" sx={{ mt: 0.25, color: accent, fontWeight: 700 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Box>
  );
}

export default function SavingsChart({ result, systemCost }: Props) {
  const { t, lang } = useLanguage();
  const theme = useTheme();
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const gradientId = `savings-gradient-${useId().replace(/:/g, "")}`;

  const scenarioMeta: Record<
    ScenarioKey,
    { label: TranslationKey; color: string }
  > = {
    pessimistic: { label: "scenario_pessimistic", color: "rgb(234, 18, 7)" },
    realistic: { label: "scenario_realistic", color: "rgb(0, 128, 128)" },
    optimistic: { label: "scenario_optimistic", color: "rgb(158, 158, 158)" },
  };

  const { years, projections } = useMemo(() => {
    const all = projectAll(result.annualLaborSaving, systemCost, MAX_HORIZON);
    const pessimisticBE = all.find((p) => p.key === "pessimistic")?.breakevenYear;
    const horizon = pessimisticBE
      ? Math.min(MAX_HORIZON, Math.max(MIN_HORIZON, Math.ceil(pessimisticBE + 2)))
      : MAX_HORIZON;
    const xs = Array.from({ length: horizon + 1 }, (_, i) => i);
    const trimmed = all.map<ScenarioProjection>((p) => ({
      key: p.key,
      cumulative: p.cumulative.slice(0, horizon + 1),
      breakevenYear:
        p.breakevenYear !== null && p.breakevenYear <= horizon
          ? p.breakevenYear
          : null,
    }));
    return { years: xs, projections: trimmed };
  }, [result.annualLaborSaving, systemCost]);

  const realistic = projections.find((p) => p.key === "realistic")!;
  const fiveYearTotal = realistic.cumulative[Math.min(5, realistic.cumulative.length - 1)];
  const hasBreakeven = realistic.breakevenYear !== null;

  const primary = "rgb(0, 128, 128)";
  const success = "rgb(158, 158, 158)";
  const secondary = "rgb(234, 18, 7)";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        background: `linear-gradient(180deg, ${alpha(primary, 0.04)} 0%, transparent 60%)`,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            {t("chart_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("chart_subtitle")} — {t("scenario_assumptions")}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <StatCard
            label={t("stat_annual_saving")}
            value={formatCurrency(result.annualLaborSaving, locale)}
            accent={primary}
          />
          <StatCard
            label={t("stat_breakeven")}
            value={
              hasBreakeven && realistic.breakevenYear !== null
                ? `${formatNumber(realistic.breakevenYear, locale, 2)} ${t("stat_year_unit")}`
                : "—"
            }
            accent={success}
            sub={hasBreakeven ? t("scenario_realistic") : t("chart_no_savings")}
          />
          <StatCard
            label={t("stat_five_year")}
            value={formatCurrency(fiveYearTotal, locale)}
            accent={secondary}
            sub={t("scenario_realistic")}
          />
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {projections.map((p) => {
            const meta = scenarioMeta[p.key];
            const label = t("scenario_breakeven_label")
              .replace("{name}", t(meta.label))
              .replace(
                "{value}",
                p.breakevenYear !== null
                  ? `${formatNumber(p.breakevenYear, locale, 2)} ${t("stat_year_unit")}`
                  : t("scenario_never")
              );
            return (
              <Chip
                key={p.key}
                label={label}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: meta.color,
                  color: meta.color,
                  fontWeight: 600,
                  "& .MuiChip-label": { px: 1.25 },
                }}
              />
            );
          })}
        </Stack>

        <Box sx={{ width: "100%", height: 440, position: "relative" }}>
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
                <stop offset="60%" stopColor={primary} stopOpacity={0.12} />
                <stop offset="100%" stopColor={primary} stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <LineChart
            xAxis={[
              {
                data: years,
                label: t("chart_x_axis"),
                valueFormatter: (v) => `${v}`,
                tickLabelStyle: { fontSize: 13, fontWeight: 500 },
              },
            ]}
            yAxis={[
              {
                label: t("chart_y_axis"),
                valueFormatter: (v) =>
                  new Intl.NumberFormat(locale, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(v)),
                tickLabelStyle: { fontSize: 13, fontWeight: 500 },
              },
            ]}
            series={projections.map((p) => {
              const meta = scenarioMeta[p.key];
              const isRealistic = p.key === "realistic";
              return {
                data: p.cumulative,
                label: t(meta.label),
                color: meta.color,
                area: isRealistic,
                showMark: false,
                curve: "monotoneX",
                valueFormatter: (v) =>
                  v === null ? "" : formatCurrency(Number(v), locale),
              };
            })}
            margin={{ left: 80, right: 30, top: 30, bottom: 60 }}
            grid={{ horizontal: true }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "right" },
                itemMarkWidth: 14,
                itemMarkHeight: 4,
              },
            }}
            sx={{
              "& .MuiAreaElement-series-realistic, & .MuiAreaElement-root": {
                fill: `url(#${gradientId})`,
                fillOpacity: 1,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 3,
              },
              "& .MuiLineElement-series-pessimistic": {
                strokeDasharray: "6 4",
              },
              "& .MuiLineElement-series-optimistic": {
                strokeDasharray: "2 3",
              },
              "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
                stroke: theme.palette.divider,
              },
              "& .MuiChartsGrid-line": {
                stroke: alpha(theme.palette.text.primary, 0.06),
              },
            }}
          >
            <ChartsReferenceLine
              y={systemCost}
              label={`${t("chart_system_cost")} • ${formatCurrency(systemCost, locale)}`}
              labelAlign="end"
              lineStyle={{
                stroke: secondary,
                strokeDasharray: "6 4",
                strokeWidth: 2,
              }}
              labelStyle={{
                fill: secondary,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            {realistic.breakevenYear !== null && (
              <ChartsReferenceLine
                x={realistic.breakevenYear}
                label={`▲ ${formatNumber(realistic.breakevenYear, locale, 2)} ${t("stat_year_unit")}`}
                labelAlign="start"
                lineStyle={{
                  stroke: success,
                  strokeDasharray: "4 4",
                  strokeWidth: 2,
                }}
                labelStyle={{
                  fill: success,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            )}
          </LineChart>
        </Box>
      </Stack>
    </Paper>
  );
}

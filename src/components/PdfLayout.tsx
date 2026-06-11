"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import SavingsChart from "@/components/SavingsChart";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Part, RoiInputs, RoiResult } from "@/lib/roi";

type Props = {
  parts: Part[];
  inputs: RoiInputs;
  result: RoiResult;
  selectedSystem: string;
};

function KvTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Table size="small">
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label} sx={{ "&:nth-of-type(even)": { bgcolor: "action.hover" } }}>
            <TableCell sx={{ py: 0.6, px: 1.5, fontSize: 12, color: "text.secondary", width: "65%" }}>
              {row.label}
            </TableCell>
            <TableCell align="right" sx={{ py: 0.6, px: 1.5, fontSize: 12, fontWeight: 600 }}>
              {row.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function PdfLayout({ parts, inputs, result, selectedSystem }: Props) {
  const { t, lang } = useLanguage();
  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const inputRows = [
    { label: t("rbw_system_cost"), value: formatCurrency(inputs.rbwSystemCost, locale) },
    { label: t("working_days"), value: formatNumber(inputs.workingDays, locale, 0) },
    { label: t("shifts_per_day"), value: formatNumber(inputs.shiftsPerDay, locale, 0) },
    { label: t("hours_per_shift"), value: formatNumber(inputs.hoursPerShift, locale, 1) },
    { label: t("hourly_labor_cost"), value: formatCurrency(inputs.hourlyLaborCost, locale) },
    { label: t("num_welders"), value: formatNumber(inputs.numWelders, locale, 0) },
    { label: t("amortization_years"), value: formatNumber(inputs.amortizationYears, locale, 0) },
    { label: t("electricity_price"), value: `${formatNumber(inputs.electricityPrice, locale, 2)} €/kWh` },
    { label: t("power_consumption"), value: `${formatNumber(inputs.powerConsumption, locale, 1)} kW/h` },
  ];

  const calcRows = [
    { label: t("annual_robot_capacity"), value: `${formatNumber(result.annualRobotCapacity, locale)} h` },
    { label: t("annual_available_labor"), value: `${formatNumber(result.annualAvailableLabor, locale)} h` },
    { label: t("annual_manual_cost"), value: formatCurrency(result.annualManualCost, locale) },
    { label: t("annual_amortization"), value: formatCurrency(result.annualAmortization, locale) },
    { label: t("annual_power_cost"), value: formatCurrency(result.annualPowerCost, locale) },
    { label: t("theoretical_welders"), value: formatNumber(result.theoreticalWelders, locale, 0) },
    { label: t("productivity_increase"), value: formatPercent(result.productivityIncrease, locale, 1) },
    { label: t("robot_utilization"), value: formatPercent(result.robotUtilization, locale, 1) },
    { label: t("annual_labor_saving"), value: formatCurrency(result.annualLaborSaving, locale) },
    { label: t("roi_years"), value: Number.isFinite(result.roiYears) ? `${formatNumber(result.roiYears, locale, 2)} yr` : "—" },
  ];

  const thSx = { py: 0.75, px: 1.5, fontSize: 11, fontWeight: 700, bgcolor: "action.hover" };
  const tdSx = { py: 0.6, px: 1.5, fontSize: 12 };

  return (
    <Stack spacing={0} sx={{ bgcolor: "background.paper" }}>
      {/* Page 1 */}
      <Stack id="roi-pdf-page1" spacing={3} sx={{ bgcolor: "background.paper", p: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "rgb(50, 50, 50)", px: 2, py: 1.25, borderRadius: 1.5 }}>
        <Image src="/logo.avif" alt="RBW" width={94} height={35} unoptimized style={{ display: "block" }} />
        <Divider orientation="vertical" flexItem sx={{ borderColor: "#fff" }} />
        <Typography variant="h2" sx={{ fontWeight: 700, color: "#fff" }}>
          {t("pdf_title")}
        </Typography>
      </Box>
      <Divider />

      {/* Parts */}
      <Box>
        <Typography variant="h3" sx={{ mb: 1 }}>{t("parts_section")}</Typography>
        <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...thSx, width: "13%", textAlign: "left" }}>{t("col_part")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "11%" }}>{t("col_annual_qty")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "11%" }}>{t("col_manual_cycle")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "11%" }}>{t("col_programming")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "11%" }}>{t("col_robotic_cycle")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "15%" }}>{t("col_manual_hours")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "15%" }}>{t("col_robotic_hours")}</TableCell>
              <TableCell align="right" sx={{ ...thSx, width: "13%" }}>{t("col_diff")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.map((part, idx) => {
              const calc = result.perPart[idx];
              return (
                <TableRow key={part.id} sx={{ "&:nth-of-type(even)": { bgcolor: "action.hover" } }}>
                  <TableCell sx={tdSx}>{part.code || "—"}</TableCell>
                  <TableCell align="right" sx={tdSx}>{formatNumber(part.annualQty, locale, 0)}</TableCell>
                  <TableCell align="right" sx={tdSx}>{part.manualCycleSec}</TableCell>
                  <TableCell align="right" sx={tdSx}>{part.programmingSec}</TableCell>
                  <TableCell align="right" sx={tdSx}>{part.roboticCycleSec}</TableCell>
                  <TableCell align="right" sx={tdSx}>{formatNumber(calc?.manualHours ?? 0, locale)}</TableCell>
                  <TableCell align="right" sx={tdSx}>{formatNumber(calc?.roboticHours ?? 0, locale)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ ...tdSx, color: (calc?.diffHours ?? 0) < 0 ? "success.main" : "text.primary" }}
                  >
                    {formatNumber(calc?.diffHours ?? 0, locale)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {/* Inputs + Calculated (+ image if selected) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: selectedSystem ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>{t("inputs_section")}</Typography>
          <KvTable rows={inputRows} />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>{t("calculated_section")}</Typography>
          <KvTable rows={calcRows} />
        </Box>
        {selectedSystem && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h3" sx={{ mb: 1 }}>{selectedSystem.toUpperCase()}</Typography>
            <Image
              src={`/${selectedSystem}.jpg`}
              alt={selectedSystem}
              width={600}
              height={400}
              style={{ width: "100%", height: "auto", borderRadius: 4 }}
              unoptimized
            />
          </Box>
        )}
      </Box>

      </Stack>

      {/* Page 2 — chart */}
      <Box id="roi-pdf-page2" sx={{ bgcolor: "background.paper", p: 3 }}>
        <SavingsChart result={result} systemCost={inputs.rbwSystemCost} />
      </Box>
    </Stack>
  );
}

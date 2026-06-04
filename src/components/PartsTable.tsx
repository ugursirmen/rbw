"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { type Part, type PartCalc, MAX_PARTS } from "@/lib/roi";

type Props = {
  parts: Part[];
  perPart: PartCalc[];
  onChange: (parts: Part[]) => void;
};

function makeBlankPart(index: number): Part {
  return {
    id: `p-${Date.now()}-${index}`,
    code: "",
    annualQty: 0,
    manualCycleSec: 0,
    programmingSec: 0,
    roboticCycleSec: 0,
  };
}

export default function PartsTable({ parts, perPart, onChange }: Props) {
  const { t, lang } = useLanguage();
  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const updatePart = <K extends keyof Part>(id: string, key: K, value: Part[K]) => {
    onChange(parts.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  };

  const handleNumber = (id: string, key: keyof Part) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    updatePart(id, key, num as Part[typeof key]);
  };

  const addPart = () => {
    if (parts.length >= MAX_PARTS) return;
    onChange([...parts, makeBlankPart(parts.length)]);
  };

  const removePart = (id: string) => {
    onChange(parts.filter((p) => p.id !== id));
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 1 }}>
        <Typography variant="h3">{t("parts_section")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("parts_help")}
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t("col_part")}</TableCell>
              <TableCell align="right">{t("col_annual_qty")}</TableCell>
              <TableCell align="right">{t("col_manual_cycle")}</TableCell>
              <TableCell align="right">{t("col_programming")}</TableCell>
              <TableCell align="right">{t("col_robotic_cycle")}</TableCell>
              <TableCell align="right">{t("col_manual_hours")}</TableCell>
              <TableCell align="right">{t("col_robotic_hours")}</TableCell>
              <TableCell align="right">{t("col_diff")}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.map((part, idx) => {
              const calc = perPart[idx];
              return (
                <TableRow key={part.id} hover>
                  <TableCell sx={{ minWidth: 140 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={part.code}
                      onChange={(e) => updatePart(part.id, "code", e.target.value)}
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 110 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: "right" } } }}
                      value={part.annualQty}
                      onChange={handleNumber(part.id, "annualQty")}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 110 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: "right" } } }}
                      value={part.manualCycleSec}
                      onChange={handleNumber(part.id, "manualCycleSec")}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 110 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: "right" } } }}
                      value={part.programmingSec}
                      onChange={handleNumber(part.id, "programmingSec")}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 110 }}>
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, style: { textAlign: "right" } } }}
                      value={part.roboticCycleSec}
                      onChange={handleNumber(part.id, "roboticCycleSec")}
                    />
                  </TableCell>
                  <TableCell align="right">{formatNumber(calc?.manualHours ?? 0, locale)}</TableCell>
                  <TableCell align="right">{formatNumber(calc?.roboticHours ?? 0, locale)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: (calc?.diffHours ?? 0) < 0 ? "success.main" : "text.primary" }}
                  >
                    {formatNumber(calc?.diffHours ?? 0, locale)}
                  </TableCell>
                  <TableCell padding="none">
                    <Tooltip title={t("remove_part")}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => removePart(part.id)}
                          disabled={parts.length <= 1}
                          aria-label={t("remove_part")}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="text"
          startIcon={<AddIcon />}
          onClick={addPart}
          disabled={parts.length >= MAX_PARTS}
        >
          {t("add_part")} ({parts.length}/{MAX_PARTS})
        </Button>
      </Box>
    </Paper>
  );
}

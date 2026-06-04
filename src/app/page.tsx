"use client";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

import InputsPanel from "@/components/InputsPanel";
import PartsTable from "@/components/PartsTable";
import ResultsPanel from "@/components/ResultsPanel";
import SavingsChart from "@/components/SavingsChart";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  DEFAULT_INPUTS,
  DEFAULT_PARTS,
  calcRoi,
  type Part,
  type RoiInputs,
} from "@/lib/roi";

export default function Home() {
  const { t } = useLanguage();
  const [parts, setParts] = useState<Part[]>(DEFAULT_PARTS);
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => calcRoi(parts, inputs), [parts, inputs]);

  const reset = () => {
    setParts(DEFAULT_PARTS);
    setInputs(DEFAULT_INPUTS);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h1">{t("nav_calculator")}</Typography>
        <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={reset}>
          {t("reset")}
        </Button>
      </Box>
      <Stack spacing={3}>
        <SavingsChart result={result} systemCost={inputs.rbwSystemCost} />
        <PartsTable parts={parts} perPart={result.perPart} onChange={setParts} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <InputsPanel inputs={inputs} onChange={setInputs} />
          <ResultsPanel result={result} />
        </Box>
      </Stack>
    </Container>
  );
}

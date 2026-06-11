"use client";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

import InputsPanel from "@/components/InputsPanel";
import PartsTable from "@/components/PartsTable";
import PdfLayout from "@/components/PdfLayout";
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

async function captureSection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  html2canvas: any,
  id: string,
): Promise<HTMLCanvasElement | null> {
  const el = document.getElementById(id);
  if (!el) return null;
  return html2canvas(el, {
    scale: 1.5,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: el.scrollWidth,
    windowWidth: el.scrollWidth,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addCanvasToPage(pdf: any, canvas: HTMLCanvasElement) {
  const pageWidth: number = pdf.internal.pageSize.getWidth();
  const pageHeight: number = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  let heightLeft = imgHeight - pageHeight;
  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  while (heightLeft > 0) {
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, -(imgHeight - heightLeft), imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
}

async function savePdf() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvas = ((await import("html2canvas")) as any).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (await import("jspdf")) as any;

  const [page1, page2] = await Promise.all([
    captureSection(html2canvas, "roi-pdf-page1"),
    captureSection(html2canvas, "roi-pdf-page2"),
  ]);

  if (!page1) return;

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  addCanvasToPage(pdf, page1);

  if (page2) {
    pdf.addPage();
    addCanvasToPage(pdf, page2);
  }

  pdf.save("rbw-roi-calculator.pdf");
}

export default function Home() {
  const { t } = useLanguage();
  const [parts, setParts] = useState<Part[]>(DEFAULT_PARTS);
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_INPUTS);
  const [selectedSystem, setSelectedSystem] = useState<string>("rb-mig");

  const result = useMemo(() => calcRoi(parts, inputs), [parts, inputs]);

  const reset = () => {
    setParts(DEFAULT_PARTS);
    setInputs(DEFAULT_INPUTS);
    setSelectedSystem("rb-mig");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hidden off-screen PDF layout — always rendered at fixed 1400px width */}
      <Box
        id="roi-pdf-root"
        sx={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "1400px",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <PdfLayout
          parts={parts}
          inputs={inputs}
          result={result}
          selectedSystem={selectedSystem}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h1">{t("nav_calculator")}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => savePdf()}
          >
            {t("save_pdf")}
          </Button>
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={reset}>
            {t("reset")}
          </Button>
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Row 1: Parts — full width */}
        <PartsTable parts={parts} perPart={result.perPart} onChange={setParts} />

        {/* Row 2: Input variables (50%) | Calculated variables (50%) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 3,
            alignItems: "stretch",
            "& > *": { height: "100%" },
          }}
        >
          <InputsPanel
            inputs={inputs}
            onChange={setInputs}
            selectedSystem={selectedSystem}
            onSystemChange={setSelectedSystem}
          />
          <ResultsPanel result={result} />
        </Box>

        {/* Row 3: Chart — full width */}
        <SavingsChart result={result} systemCost={inputs.rbwSystemCost} />
      </Stack>
    </Container>
  );
}

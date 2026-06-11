"use client";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

import InputsPanel, { SYSTEMS } from "@/components/InputsPanel";
import PartsTable from "@/components/PartsTable";
import PdfLayout from "@/components/PdfLayout";
import ResultsPanel, { CalculatedPanel } from "@/components/ResultsPanel";
import SavingsChart from "@/components/SavingsChart";
import Image from "next/image";
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
function addCanvasToPage(pdf: any, canvas: HTMLCanvasElement, fitToPage = false) {
  const pageWidth: number = pdf.internal.pageSize.getWidth();
  const pageHeight: number = pdf.internal.pageSize.getHeight();
  const naturalHeight = (canvas.height * pageWidth) / canvas.width;
  const imgWidth = fitToPage && naturalHeight > pageHeight
    ? (canvas.width * pageHeight) / canvas.height
    : pageWidth;
  const imgHeight = fitToPage && naturalHeight > pageHeight ? pageHeight : naturalHeight;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  if (!fitToPage) {
    let heightLeft = imgHeight - pageHeight;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, -(imgHeight - heightLeft), imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
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
  addCanvasToPage(pdf, page1, true);

  if (page2) {
    pdf.addPage();
    addCanvasToPage(pdf, page2);
  }

  const date = new Date().toISOString().slice(0, 10);
  pdf.save(`rbw-roi-report-${date}.pdf`);
}

export default function Home() {
  const { t } = useLanguage();
  const [parts, setParts] = useState<Part[]>(DEFAULT_PARTS);
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_INPUTS);
  const [selectedSystem, setSelectedSystem] = useState<string>("rb-mig");
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

        {/* Row 2: Left (inputs + calculated) | Right (image + output) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          <Stack spacing={3}>
            <InputsPanel
              inputs={inputs}
              onChange={setInputs}
              selectedSystem={selectedSystem}
              onSystemChange={setSelectedSystem}
            />
            <CalculatedPanel result={result} />
            <ResultsPanel result={result} />
          </Stack>
          {selectedSystem && (() => {
            const systemLabel = SYSTEMS.find((s) => s.value === selectedSystem)?.label ?? selectedSystem;
            const labelChip = (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  bgcolor: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              >
                {systemLabel}
              </Typography>
            );
            return (
              <>
                <Paper
                  variant="outlined"
                  onClick={() => setLightboxOpen(true)}
                  sx={{ overflow: "hidden", position: "relative", cursor: "zoom-in" }}
                >
                  {labelChip}
                  <Image
                    src={`/${selectedSystem}.jpg`}
                    alt={selectedSystem}
                    fill
                    style={{ objectFit: "contain" }}
                    unoptimized
                  />
                </Paper>
                <Dialog
                  open={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                  maxWidth="lg"
                  slotProps={{ paper: { sx: { bgcolor: "transparent", boxShadow: "none", overflow: "hidden", position: "relative" } } }}
                >
                  {labelChip}
                  <Image
                    src={`/${selectedSystem}.jpg`}
                    alt={selectedSystem}
                    width={1200}
                    height={800}
                    style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }}
                    unoptimized
                  />
                </Dialog>
              </>
            );
          })()}
        </Box>

        {/* Row 3: Chart — full width */}
        <SavingsChart result={result} systemCost={inputs.rbwSystemCost} />
      </Stack>
    </Container>
  );
}

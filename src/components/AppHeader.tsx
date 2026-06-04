"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import Image from "next/image";

import { LANGUAGES } from "@/i18n/dictionary";
import { useLanguage } from "@/i18n/LanguageProvider";

const LOGO_W = 94;
const LOGO_H = 35;

export default function AppHeader() {
  const { lang, setLang, t } = useLanguage();
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, sm: 72 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          }}
        >
          <Image
            src="/logo.avif"
            alt={t("brand")}
            width={LOGO_W}
            height={LOGO_H}
            priority
            unoptimized
            style={{ display: "block", width: LOGO_W, height: LOGO_H }}
          />
        </Box>
        <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: 1.2,
              lineHeight: 1,
            }}
          >
            {t("brand")}
          </Typography>
          <Typography
            variant="subtitle1"
            component="h1"
            sx={{ fontWeight: 600, lineHeight: 1.2, mt: 0.25 }}
          >
            {t("appTitle")}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <ButtonGroup size="small" variant="outlined">
          {LANGUAGES.map((option) => (
            <Button
              key={option.code}
              variant={lang === option.code ? "contained" : "outlined"}
              onClick={() => setLang(option.code)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </Toolbar>
    </AppBar>
  );
}

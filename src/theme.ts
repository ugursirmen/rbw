"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#0b66c2",
    },
    secondary: {
      main: "#f57c00",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: "1.75rem", fontWeight: 600 },
    h2: { fontSize: "1.4rem", fontWeight: 600 },
    h3: { fontSize: "1.15rem", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;

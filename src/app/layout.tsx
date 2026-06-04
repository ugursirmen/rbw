import type { Metadata } from "next";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import AppHeader from "@/components/AppHeader";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import theme from "@/theme";

export const metadata: Metadata = {
  title: "RBW ROI Calculator",
  description: "Robotic Welding ROI calculator and analytics tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LanguageProvider>
              <AppHeader />
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

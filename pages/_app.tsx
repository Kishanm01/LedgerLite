import { EmotionCache, ThemeProvider } from "@emotion/react";
import { darkTheme } from "../styles/theme";
import createEmotionCache from "../utils/createEmotionCache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import React from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../components/layouts/AuthLayout";
import { InferGetStaticPropsType } from "next";
import { AppProps } from "next/app";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const nonAuthedRoutes = ["/login", "/sign-up", "/forgot-password"];

const clientSideEmotionCache = createEmotionCache();

export interface CustomAppProps extends AppProps{
  emotionCache: EmotionCache;
}

function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: CustomAppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();
  let authenticated = true;
  nonAuthedRoutes.map((route) => {
    if (route == router.pathname) {
      authenticated = false;
    }
  });

  if (!authenticated) {
    return (
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={pageProps.initialSession}
      >
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </CacheProvider>
      </SessionContextProvider>
    );
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AuthLayout>
              <Component {...pageProps} />
            </AuthLayout>
          </ThemeProvider>
        </CacheProvider>
      </SessionContextProvider>
    </LocalizationProvider>
  );
}

export default MyApp;

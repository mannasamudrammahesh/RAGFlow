import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useRouter } from "next/router";
import { AuthProvider } from "@/context/AuthContext";

// Analytics utilities
import { initGA, trackPageView, setupScrollTracking } from "@/utils/analytics";

// We create the QueryClient inside the component to avoid sharing state across requests
// in case of SSR, though this is a basic setup.
export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: (error) => {
              console.error("Mutation error:", error);
            },
          },
        },
      })
  );

  const router = useRouter();

  useEffect(() => {
    // Initialize GA on first load
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (GA_MEASUREMENT_ID) {
      initGA(GA_MEASUREMENT_ID);
    } else {
      console.warn("⚠️ Google Analytics ID not found.");
    }

    // Setup scroll tracking
    const cleanupScroll = setupScrollTracking();
    return cleanupScroll;
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    
    // Initial page view
    trackPageView(router.asPath);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, router.asPath]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Component {...pageProps} />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

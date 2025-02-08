"use client";
import { Providers } from "@/providers/providers";

import { Inter } from "next/font/google";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { WagmiProviderWrapper } from "@/providers/WagmiProviderWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProviderWrapper>
          {/* Wrap with QueryClientProvider */}
          <QueryClientProvider client={queryClient}>
            <Providers>{children}</Providers>
          </QueryClientProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}

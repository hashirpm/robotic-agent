"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains"; // add baseSepolia for testing

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          name: "Robotic Agent", // Displayed in modal header
          // logo: logo, // Displayed in modal header
          mode: "auto", // 'light' | 'dark' | 'auto'

          theme: "default",
        },
        wallet: {
          display: "modal",
        },
      }}
    >
      {props.children}
    </OnchainKitProvider>
  );
}

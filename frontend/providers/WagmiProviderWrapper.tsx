"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import "@coinbase/onchainkit/styles.css";
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "roboticagent",
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});

export function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}

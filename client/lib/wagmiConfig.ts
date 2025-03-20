import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Votereum",
  projectId: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  chains: [mainnet, sepolia],
  ssr: true,
});

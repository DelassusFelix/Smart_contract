import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import "dotenv/config";

export const wagmiConfig = getDefaultConfig({
  appName: "Votereum",
  projectId: process.env.VOTING_ID || "",
  chains: [mainnet, sepolia],
  ssr: true,
});

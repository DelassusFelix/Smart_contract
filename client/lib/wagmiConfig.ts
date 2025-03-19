import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import "dotenv/config";

export const wagmiConfig = getDefaultConfig({
  appName: "Votereum",
  projectId: '0x9777e166F6D7299f2914d738Edf19f1E62E21513',
  chains: [mainnet, sepolia],
  ssr: true,
});

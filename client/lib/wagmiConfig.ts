import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Votereum",
  projectId: '0x0DE6485275bDf9793ded188fDD60d80BE397006e',
  chains: [mainnet, sepolia],
  ssr: true,
});

import { useWalletClient } from "wagmi";
import { Contract, JsonRpcProvider } from "ethers";
import { contractAddress, contractABI } from "../lib/contractConfig";

export async function useVotingContract() {
  const { data: walletClient } = useWalletClient();

  const provider = walletClient
    ? new JsonRpcProvider(walletClient.transport.url)
    : null;

  const contract = provider
    ? new Contract(contractAddress, contractABI, await provider.getSigner())
    : null;

  return contract;
}

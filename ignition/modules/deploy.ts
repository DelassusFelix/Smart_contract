import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const storageModule = buildModule("StorageModule", (m) => {
  const storage = m.contract("SimpleStorage", {
    gasLimit: 3000000, // Set a reasonable gas limit
    gasPrice: ethers.utils.parseUnits("10", "gwei"), // Set a reasonable gas price
  });

  return { storage };
});

export default storageModule;

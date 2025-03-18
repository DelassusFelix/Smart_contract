import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const storageModule = buildModule("StorageModule", (m) => {
  const storage = m.contract("Storage");

  return { storage };
});

export default storageModule;

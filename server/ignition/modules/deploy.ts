import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StorageModule = buildModule("StorageModule", (m) => {
  // Deploy the Storage contract
  const storage = m.contract("Storage");

  // Log the deployment
  console.log("Storage contract deployment initiated");

  return { storage };
});

export default StorageModule;
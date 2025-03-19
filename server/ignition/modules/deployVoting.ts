import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingModule = buildModule("VotingModule", (m) => {
  // Deploy the Voting contract
  const voting = m.contract("Voting");

  // Log the deployment
  console.log("Voting contract deployment initiated");

  return { voting };
});

export default VotingModule;
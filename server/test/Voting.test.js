const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();
    voting = await Voting.deploy();
    await voting.deployed();
  });

  it("Should add a voter to the whitelist", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    expect(await voting.whiteList(0)).to.equal(addr1.address);
  });

  it("Should register a voter", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    const voter = await voting.voterAdress(addr1.address);
    expect(voter.isRegistered).to.be.true;
  });

  it("Should add a proposal", async function () {
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    const proposal = await voting.proposals(0);
    expect(proposal.description).to.equal("Proposal 1");
  });

  it("Should allow a registered voter to vote", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    const voter = await voting.voterAdress(addr1.address);
    expect(voter.hasVoted).to.be.true;
    expect(voter.votedProposalId).to.equal(0);
  });

  it("Should tally votes and get the winning proposal", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.addVoterToWhiteList(addr2.address);
    await voting.registerVoter(addr1.address);
    await voting.registerVoter(addr2.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.addProposal("Proposal 2");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.connect(addr2).vote(0);
    await voting.endVotingSession();
    await voting.tallyVotes();
    const winningProposal = await voting.getWinningProposal();
    expect(winningProposal).to.equal("Proposal 1");
  });

  it("Should allow a voter to cancel their vote", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.connect(addr1).cancelVote();
    const voter = await voting.voterAdress(addr1.address);
    expect(voter.hasVoted).to.be.false;
    expect(voter.votedProposalId).to.equal(0);
  });
});
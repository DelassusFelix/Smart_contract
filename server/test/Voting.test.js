const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Voting Contract Tests
 * @dev This file contains tests for the Voting contract
 */
describe("Voting", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  /**
   * @dev Deploys the Voting contract before each test
   */
  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, _] = await ethers.getSigners();

    voting = await Voting.deploy();
  });

  /**
   * @notice Tests if a voter can be added to the whitelist
   * @dev This test adds addr1 to the whitelist and checks if it was added correctly
   */
  it("Should add a voter to the whitelist", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    const isWhitelisted = await voting.whiteList(addr1.address);
    expect(isWhitelisted).to.be.true;
  });

  /**
   * @notice Tests if a non-owner cannot add a voter to the whitelist
   * @dev This test tries to add addr2 to the whitelist using addr1 and expects it to revert
   */
  it("Should revert if non-owner tries to add a voter to the whitelist", async function () {
    await expect(voting.connect(addr1).addVoterToWhiteList(addr2.address)).to.be.reverted;
    const isWhitelisted = await voting.whiteList(addr2.address);
    expect(isWhitelisted).to.be.false;
  });

  /**
   * @notice Tests if a voter can be registered
   * @dev This test registers addr1 as a voter and checks if it was registered correctly
   */
  it("Should register a voter", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    const voter = await voting.voterAdress(addr1.address);
    expect(voter.isRegistered).to.be.true;
  });

  /**
   * @notice Tests if an already registered voter cannot register again
   * @dev This test tries to register addr1 again and expects it to revert
   */
  it("Should revert if already registered voter tries to register again", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await expect(voting.registerVoter(addr1.address)).to.be.revertedWith("Voter already registered");
  });

  /**
   * @notice Tests if proposals registration can be started
   * @dev This test starts the proposals registration and checks if the status is updated correctly
   */
  it("Should start proposals registration", async function () {
    await voting.startProposalsRegistration();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(1);
  });

  /**
   * @notice Tests if a non-owner cannot start proposals registration
   * @dev This test tries to start proposals registration using addr1 and expects it to revert
   */
  it("Should revert if non-owner tries to start proposals registration", async function () {
    const initialStatus = await voting.currentWorkflowStatus();
    await expect(voting.connect(addr1).startProposalsRegistration()).to.be.reverted;
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a proposal can be added
   * @dev This test adds a proposal and checks if it was added correctly
   */
  it("Should add a proposal", async function () {
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    const proposal = await voting.proposals(0);
    expect(proposal.description).to.equal("Proposal 1");
  });

  /**
   * @notice Tests if a proposal cannot be added when proposals registration is not active
   * @dev This test tries to add a proposal when the proposals registration is not active and expects it to revert
   */
  it("Should revert if proposals registration is not active", async function () {
    await expect(voting.addProposal("Proposal 1")).to.be.revertedWith("Proposals registration session is not active");
  });

  /**
   * @notice Tests if proposals registration can be ended
   * @dev This test ends the proposals registration and checks if the status is updated correctly
   */
  it("Should end proposals registration", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(2);
  });

  /**
   * @notice Tests if a non-owner cannot end proposals registration
   * @dev This test tries to end proposals registration using addr1 and expects it to revert
   */
  it("Should revert if non-owner tries to end proposals registration", async function () {
    await voting.startProposalsRegistration();
    const initialStatus = await voting.currentWorkflowStatus();
    await expect(voting.connect(addr1).endProposalsRegistration()).to.be.reverted;
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if voting session can be started
   * @dev This test starts the voting session and checks if the status is updated correctly
   */
  it("Should start voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(3);
  });

  /**
   * @notice Tests if a non-owner cannot start voting session
   * @dev This test tries to start voting session using addr1 and expects it to revert
   */
  it("Should revert if non-owner tries to start voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    const initialStatus = await voting.currentWorkflowStatus();
    await expect(voting.connect(addr1).startVotingSession()).to.be.reverted;
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if voting session can be ended
   * @dev This test ends the voting session and checks if the status is updated correctly
   */
  it("Should end voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.endVotingSession();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(4);
  });

  /**
   * @notice Tests if a non-owner cannot end voting session
   * @dev This test tries to end voting session using addr1 and expects it to revert
   */
  it("Should revert if non-owner tries to end voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    const initialStatus = await voting.currentWorkflowStatus();
    await expect(voting.connect(addr1).endVotingSession()).to.be.reverted;
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if votes can be tallied
   * @dev This test tallies the votes and checks if the status is updated correctly
   */
  it("Should tally votes", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.endVotingSession();
    await voting.tallyVotes();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(5);
  });

  /**
   * @notice Tests if a non-owner cannot tally votes
   * @dev This test tries to tally votes using addr1 and expects it to revert
   */
  it("Should revert if non-owner tries to tally votes", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.endVotingSession();
    const initialStatus = await voting.currentWorkflowStatus();
    await expect(voting.connect(addr1).tallyVotes()).to.be.reverted;
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a registered voter can vote
   * @dev This test registers addr1 as a voter, starts the voting session, and checks if addr1 can vote
   */
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

  /**
   * @notice Tests if a non-registered voter cannot vote
   * @dev This test tries to vote using addr1 without registering and expects it to revert
   */
  it("Should revert if non-registered voter tries to vote", async function () {
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voter not registered");
  });

  /**
   * @notice Tests if a voter cannot vote twice
   * @dev This test registers addr1 as a voter, starts the voting session, votes once, and tries to vote again expecting it to revert
   */
  it("Should revert if voter tries to vote twice", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voter already voted");
  });

  /**
   * @notice Tests if a voter cannot vote for an invalid proposal
   * @dev This test registers addr1 as a voter, starts the voting session, and tries to vote for an invalid proposal expecting it to revert
   */
  it("Should revert if voter tries to vote for an invalid proposal", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("Invalid proposal id");
  });

  /**
   * @notice Tests if a voter can cancel their vote
   * @dev This test registers addr1 as a voter, starts the voting session, votes, and then cancels the vote
   */
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

  /**
   * @notice Tests if a non-registered voter cannot cancel vote
   * @dev This test tries to cancel vote using addr1 without registering and expects it to revert
   */
  it("Should revert if non-registered voter tries to cancel vote", async function () {
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr1).cancelVote()).to.be.revertedWith("Voter not registered");
  });

  /**
   * @notice Tests if a voter cannot cancel vote without voting
   * @dev This test registers addr1 as a voter, starts the voting session, and tries to cancel vote without voting expecting it to revert
   */
  it("Should revert if voter tries to cancel vote without voting", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr1).cancelVote()).to.be.revertedWith("Voter has not voted yet");
  });

  /**
   * @notice Tests if the winning proposal can be retrieved
   * @dev This test registers addr1 and addr2 as voters, adds proposals, votes, tallies the votes, and retrieves the winning proposal
   */
  it("Should get the winning proposal", async function () {
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

  /**
   * @notice Tests if the winning proposal cannot be retrieved before votes are tallied
   * @dev This test tries to retrieve the winning proposal before votes are tallied and expects it to revert
   */
  it("Should revert if trying to get winning proposal before votes are tallied", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.endVotingSession();
    await expect(voting.getWinningProposal()).to.be.revertedWith("Tallied session is not active");
  });

  /**
   * @notice Tests if all votes can be retrieved
   * @dev This test registers addr1, addr2, and owner as voters, adds proposals, votes, tallies the votes, and retrieves all votes
   */
  it("Should get all votes", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.addVoterToWhiteList(addr2.address);
    await voting.addVoterToWhiteList(owner.address);
    await voting.registerVoter(addr1.address);
    await voting.registerVoter(addr2.address);
    await voting.registerVoter(owner.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.addProposal("Proposal 2");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.connect(addr2).vote(1);
    await voting.endVotingSession();
    await voting.tallyVotes();
    const [voters, votes] = await voting.getAllVotes();
    expect(voters).to.include(addr1.address);
    expect(voters).to.include(addr2.address);
    expect(votes).to.include(BigInt(0));
    expect(votes).to.include(BigInt(1));
  });

  /**
   * @notice Tests if a non-registered voter cannot get all votes
   * @dev This test tries to retrieve all votes using addr1 without registering and expects it to revert
   */
  it("Should revert if non-registered voter tries to get all votes", async function () {
    await expect(voting.getAllVotes()).to.be.revertedWith("Voter not registered");
  });

  /**
   * @notice Tests if the workflow status does not change if a non-owner tries to change it
   * @dev This test tries to change the workflow status using addr1 and expects it to revert, then checks if the status remains unchanged
   */
  it("Should not change workflow status if non-owner tries", async function () {
    const initialStatus = await voting.currentWorkflowStatus();
    await expect(voting.connect(addr1).startProposalsRegistration()).to.be.reverted;
    let finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);

    await voting.startProposalsRegistration();
    await expect(voting.connect(addr1).endProposalsRegistration()).to.be.reverted;
    finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(1);

    await voting.endProposalsRegistration();
    await expect(voting.connect(addr1).startVotingSession()).to.be.reverted;
    finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(2);

    await voting.startVotingSession();
    await expect(voting.connect(addr1).endVotingSession()).to.be.reverted;
    finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(3);

    await voting.endVotingSession();
    await expect(voting.connect(addr1).tallyVotes()).to.be.reverted;
    finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(4);
  });

  /**
   * @notice Tests if a proposal cannot be added when proposals registration is not active
   * @dev This test tries to add a proposal when the proposals registration is not active and expects it to revert
   */
  it("Should revert if trying to add a proposal when proposals registration is not active", async function () {
    await expect(voting.addProposal("Proposal 1")).to.be.revertedWith("Proposals registration session is not active");
  });
  
  /**
   * @notice Tests if a voter cannot vote when voting session is not active
   * @dev This test tries to vote using addr1 when the voting session is not active and expects it to revert
   */
  it("Should revert if trying to vote when voting session is not active", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voting session is not active");
  });
  
  /**
   * @notice Tests if a voter cannot cancel vote when voting session is not active*
   * @dev This test tries to cancel when the voting session is not active and expects it to revert
   */
  it("Should revert if trying to cancel vote when voting session is not active", async function () {
    await voting.addVoterToWhiteList(addr1.address);
    await voting.registerVoter(addr1.address);
    await expect(voting.connect(addr1).cancelVote()).to.be.revertedWith("Voting session is not active");
  });

});
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
   * @dev This test registers a voter and checks if they are in the whitelist
   */
  it("Should add a voter to the whitelist", async function () {
    await voting.registerVoter(addr1.address);
    const isWhitelisted = await voting.whiteList(addr1.address);
    expect(isWhitelisted).to.be.true;
  });

  /**
   * @notice Tests if a voter can be registered
   * @dev This test registers a voter and checks if they are registered
   */
  it("Should register a voter", async function () {
    await voting.registerVoter(addr1.address);
    const voter = await voting.voterAddress(addr1.address);
    expect(voter.isRegistered).to.be.true;
  });

  /**
   * @notice Tests if an already registered voter cannot be registered again
   * @dev This test registers a voter and tries to register them again, expecting a revert
   */
  it("Should revert if already registered voter tries to register again", async function () {
    await voting.registerVoter(addr1.address);
    await expect(voting.registerVoter(addr1.address)).to.be.revertedWith("Voter already registered");
  });

  /**
   * @notice Tests if the proposals registration can be started
   * @dev This test starts the proposals registration and checks the workflow status
   */
  it("Should start proposals registration", async function () {
    await voting.startProposalsRegistration();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(1);
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
   * @notice Tests if adding a proposal when proposals registration is not active reverts
   * @dev This test tries to add a proposal when proposals registration is not active, expecting a revert
   */
  it("Should revert if proposals registration is not active", async function () {
    await expect(voting.addProposal("Proposal 1")).to.be.revertedWith("Proposals registration session is not active");
  });

  /**
   * @notice Tests if the proposals registration can be ended
   * @dev This test ends the proposals registration and checks the workflow status
   */
  it("Should end proposals registration", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(2);
  });

  /**
   * @notice Tests if the voting session can be started
   * @dev This test starts the voting session and checks the workflow status
   */
  it("Should start voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(3);
  });

  /**
   * @notice Tests if the voting session can be ended
   * @dev This test ends the voting session and checks the workflow status
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
   * @notice Tests if the votes can be tallied
   * @dev This test tallies the votes and checks the workflow status
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
   * @notice Tests if a registered voter can vote
   * @dev This test registers a voter, adds a proposal, and checks if the voter can vote
   */
  it("Should allow a registered voter to vote", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    const voter = await voting.voterAddress(addr1.address);
    expect(voter.hasVoted).to.be.true;
    expect(voter.votedProposalId).to.equal(0);
  });

  /**
   * @notice Tests if a non-registered voter cannot vote
   * @dev This test tries to vote with a non-registered voter, expecting a revert
   */
  it("Should revert if non-registered voter tries to vote", async function () {
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr2).vote(0)).to.be.revertedWith("Voter not registered");
  });

  /**
   * @notice Tests if a voter cannot vote twice
   * @dev This test registers a voter, adds a proposal, and checks if the voter cannot vote twice
   */
  it("Should revert if voter tries to vote twice", async function () {
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
   * @dev This test registers a voter, adds a proposal, and checks if the voter cannot vote for an invalid proposal
   */
  it("Should revert if voter tries to vote for an invalid proposal", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("Invalid proposal id");
  });

  /**
   * @notice Tests if a voter can cancel their vote
   * @dev This test registers a voter, adds a proposal, and checks if the voter can cancel their vote
   */
  it("Should allow a voter to cancel their vote", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.connect(addr1).cancelVote();
    const voter = await voting.voterAddress(addr1.address);
    expect(voter.hasVoted).to.be.false;
    expect(voter.votedProposalId).to.equal(0);
  });

  /**
   * @notice Tests if a non-registered voter cannot cancel their vote
   * @dev This test tries to cancel a vote with a non-registered voter, expecting a revert
   */
  it("Should revert if non-registered voter tries to cancel vote", async function () {
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr2).cancelVote()).to.be.revertedWith("Voter not registered");
  });

  /**
   * @notice Tests if a voter cannot cancel their vote without voting
   * @dev This test registers a voter, adds a proposal, and checks if the voter cannot cancel their vote without voting
   */
  it("Should revert if voter tries to cancel vote without voting", async function () {
    await voting.registerVoter(addr1.address);
    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await expect(voting.connect(addr1).cancelVote()).to.be.revertedWith("Voter has not voted yet");
  });

  /**
   * @notice Tests if the winning proposal can be retrieved
   * @dev This test registers voters, adds proposals, votes, and checks if the winning proposal can be retrieved
   */
  it("Should get the winning proposal", async function () {
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
   * @notice Tests if trying to get the winning proposal before votes are tallied reverts
   * @dev This test tries to get the winning proposal before votes are tallied, expecting a revert
   */
  it("Should revert if trying to get winning proposal before votes are tallied", async function () {
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
   * @dev This test registers voters, adds proposals, votes, and checks if all votes can be retrieved
   */
  it("Should get all votes", async function () {
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
    const [descriptions, voteCounts, votersPerProposal] = await voting.getAllProposalsWithVotes();
    expect(descriptions).to.include("Proposal 1");
    expect(descriptions).to.include("Proposal 2");
    expect(voteCounts.map(v => Number(v))).to.include(1);
    expect(votersPerProposal[0]).to.include(addr1.address);
    expect(votersPerProposal[1]).to.include(addr2.address);
  });

  /**
   * @notice Tests if adding a proposal when proposals registration is not active reverts
   * @dev This test tries to add a proposal when proposals registration is not active, expecting a revert
   */
  it("Should revert if trying to add a proposal when proposals registration is not active", async function () {
    await expect(voting.addProposal("Proposal 1")).to.be.revertedWith("Proposals registration session is not active");
  });

  /**
   * @notice Tests if voting when voting session is not active reverts
   * @dev This test tries to vote when voting session is not active, expecting a revert
   */
  it("Should revert if trying to vote when voting session is not active", async function () {
    await voting.registerVoter(addr1.address);
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voting session is not active");
  });

  /**
   * @notice Tests if canceling a vote when voting session is not active reverts
   * @dev This test tries to cancel a vote when voting session is not active, expecting a revert
   */
  it("Should revert if trying to cancel vote when voting session is not active", async function () {
    await voting.registerVoter(addr1.address);
    await expect(voting.connect(addr1).cancelVote()).to.be.revertedWith("Voting session is not active");
  });

  /**
   * @notice Tests if the voting session can be reset
   * @dev This test registers voters, adds proposals, votes, and checks if the voting session can be reset
   */
  it("Should reset the voting session", async function () {
    await voting.registerVoter(addr1.address);
    await voting.registerVoter(addr2.address);

    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.addProposal("Proposal 2");
    await voting.endProposalsRegistration();

    await voting.startVotingSession();
    await voting.connect(addr1).vote(0);
    await voting.connect(addr2).vote(1);
    await voting.endVotingSession();
    await voting.tallyVotes();

    await voting.resetSession();

    const status = await voting.currentWorkflowStatus();
    expect(status).to.equal(0); 

    const proposals = await voting.getAllProposalsWithVotes();
    expect(proposals[0].length).to.equal(0); 
    expect(proposals[1].length).to.equal(0); 
    expect(proposals[2].length).to.equal(0); 

    const voter1 = await voting.voterAddress(addr1.address);
    const voter2 = await voting.voterAddress(addr2.address);
    expect(voter1.isRegistered).to.be.false;
    expect(voter1.hasVoted).to.be.false;
    expect(voter1.votedProposalId).to.equal(0);
    expect(voter2.isRegistered).to.be.false;
    expect(voter2.hasVoted).to.be.false;
    expect(voter2.votedProposalId).to.equal(0);
  });

  /**
   * @notice Tests if a non-owner cannot reset the session
   * @dev This test tries to reset the session with a non-owner and checks if the action is not applied
   */
  it("Should not allow non-owner to reset the session", async function () {
    await voting.registerVoter(addr1.address);
    await voting.registerVoter(addr2.address);

    await voting.startProposalsRegistration();
    await voting.addProposal("Proposal 1");
    await voting.addProposal("Proposal 2"); // Ajout d'une deuxième proposition
    await voting.endProposalsRegistration();

    await voting.startVotingSession();
    await voting.connect(addr1).vote(0); // Vote pour la première proposition
    await voting.connect(addr2).vote(1); // Vote pour la deuxième proposition
    await voting.endVotingSession();
    await voting.tallyVotes();

    const initialStatus = await voting.currentWorkflowStatus();
    await voting.connect(addr1).resetSession().catch(() => {});
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a non-owner cannot start proposals registration
   * @dev This test tries to start proposals registration with a non-owner and checks if the action is not applied
   */
  it("Should not allow non-owner to start proposals registration", async function () {
    const initialStatus = await voting.currentWorkflowStatus();
    await voting.connect(addr1).startProposalsRegistration().catch(() => {});
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a non-owner cannot end proposals registration
   * @dev This test tries to end proposals registration with a non-owner and checks if the action is not applied
   */
  it("Should not allow non-owner to end proposals registration", async function () {
    await voting.startProposalsRegistration();
    const initialStatus = await voting.currentWorkflowStatus();
    await voting.connect(addr1).endProposalsRegistration().catch(() => {});
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a non-owner cannot start voting session
   * @dev This test tries to start voting session with a non-owner and checks if the action is not applied
   */
  it("Should not allow non-owner to start voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    const initialStatus = await voting.currentWorkflowStatus();
    await voting.connect(addr1).startVotingSession().catch(() => {});
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a non-owner cannot end voting session
   * @dev This test tries to end voting session with a non-owner and checks if the action is not applied
   */
  it("Should not allow non-owner to end voting session", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    const initialStatus = await voting.currentWorkflowStatus();
    await voting.connect(addr1).endVotingSession().catch(() => {});
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });

  /**
   * @notice Tests if a non-owner cannot tally votes
   * @dev This test tries to tally votes with a non-owner and checks if the action is not applied
   */
  it("Should not allow non-owner to tally votes", async function () {
    await voting.startProposalsRegistration();
    await voting.endProposalsRegistration();
    await voting.startVotingSession();
    await voting.endVotingSession();
    const initialStatus = await voting.currentWorkflowStatus();
    await voting.connect(addr1).tallyVotes().catch(() => {});
    const finalStatus = await voting.currentWorkflowStatus();
    expect(finalStatus).to.equal(initialStatus);
  });
});
  
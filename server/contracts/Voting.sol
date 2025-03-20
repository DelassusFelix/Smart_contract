pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voting
 * @dev Implements a simple voting system with proposals and votes
 */
contract Voting is Ownable {
    mapping(address => bool) public whiteList;
    address[] public whiteListArray;
    uint winningProposalId;

    mapping(address => Voter) public voterAdress;
    Proposal[] public proposals;
    WorkflowStatus public currentWorkflowStatus;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event VoteCancelled(address voter, uint proposalId);

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner and sets the initial workflow status
     */
    constructor() Ownable(msg.sender) {
        currentWorkflowStatus = WorkflowStatus.RegisteringVoters;
    }

    /**
     * @notice Adds a voter to the whitelist
     * @dev Only the owner can add a voter to the whitelist
     * @param _voterAddress The address of the voter to be added to the whitelist
     */
    function addVoterToWhiteList(address _voterAddress) external onlyOwner {
        whiteListArray.push(_voterAddress);
        whiteList[_voterAddress] = true;
    }

    /**
     * @notice Registers a voter
     * @dev A voter must be in the whitelist to be registered
     * @param _voterAddress The address of the voter to be registered
     */
    function registerVoter(address _voterAddress) public {
        require(!voterAdress[_voterAddress].isRegistered, "Voter already registered");
        voterAdress[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    /**
     * @notice Starts the proposals registration phase
     * @dev Only the owner can start the proposals registration phase
     */
    function startProposalsRegistration() external onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
        currentWorkflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
    }

    /**
     * @notice Adds a proposal
     * @dev Proposals can only be added during the proposals registration phase
     * @param _description The description of the proposal
     */
    function addProposal(string memory _description) public {
        require(currentWorkflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration session is not active");
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    /**
     * @notice Ends the proposals registration phase
     * @dev Only the owner can end the proposals registration phase
     */
    function endProposalsRegistration() external onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
        currentWorkflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
    }

    /**
     * @notice Starts the voting session
     * @dev Only the owner can start the voting session
     */
    function startVotingSession() external onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
        currentWorkflowStatus = WorkflowStatus.VotingSessionStarted;
    }

    /**
     * @notice Ends the voting session
     * @dev Only the owner can end the voting session
     */
    function endVotingSession() external onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
        currentWorkflowStatus = WorkflowStatus.VotingSessionEnded;
    }

    /**
     * @notice Tallies the votes
     * @dev Only the owner can tally the votes
     */
    function tallyVotes() external onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        currentWorkflowStatus = WorkflowStatus.VotesTallied;
    }

    /**
     * @notice Casts a vote for a proposal
     * @dev A voter must be registered, in the whitelist, and the voting session must be active
     * @param _proposalId The ID of the proposal to vote for
     */
    function vote(uint _proposalId) public {
        require(currentWorkflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(voterAdress[msg.sender].isRegistered, "Voter not registered");
        require(whiteList[msg.sender], "Voter is not in the whitelist");
        require(!voterAdress[msg.sender].hasVoted, "Voter already voted");
        require(_proposalId < proposals.length, "Invalid proposal id");
        proposals[_proposalId].voteCount++;
        voterAdress[msg.sender].hasVoted = true;
        voterAdress[msg.sender].votedProposalId = _proposalId;
        emit Voted(msg.sender, _proposalId);
    }

    /**
     * @notice Retrieves the winning proposal
     * @dev The votes must be tallied before retrieving the winning proposal
     * @return The description of the winning proposal
     */
    function getWinningProposal() public view returns (string memory) {
        require(currentWorkflowStatus == WorkflowStatus.VotesTallied, "Tallied session is not active");
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }
        return proposals[winningProposalIndex].description;
    }

    /**
     * @notice Retrieves all votes
     * @dev Only registered voters can retrieve all votes
     * @return An array of voter addresses and an array of their corresponding voted proposal IDs
     */
    function getAllVotes() public view returns (address[] memory, uint[] memory) {
        require(voterAdress[msg.sender].isRegistered, "Voter not registered");
        uint totalVoters = whiteListArray.length;
        address[] memory voters = new address[](totalVoters);
        uint[] memory votes = new uint[](totalVoters);
        uint index = 0;

        for (uint i = 0; i < whiteListArray.length; i++) {
            address voterAddress = whiteListArray[i];
            if (voterAdress[voterAddress].hasVoted) {
                voters[index] = voterAddress;
                votes[index] = voterAdress[voterAddress].votedProposalId;
                index++;
            }
        }
        return (voters, votes);
    }

    /**
     * @notice Cancels a vote
     * @dev A voter must be registered, in the whitelist, and have voted. The voting session must be active
     */
    function cancelVote() public {
        require(currentWorkflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(voterAdress[msg.sender].isRegistered, "Voter not registered");
        require(whiteList[msg.sender], "Voter is not in the whitelist");
        require(voterAdress[msg.sender].hasVoted, "Voter has not voted yet");

        uint votedProposalId = voterAdress[msg.sender].votedProposalId;
        proposals[votedProposalId].voteCount--;

        voterAdress[msg.sender].hasVoted = false;
        voterAdress[msg.sender].votedProposalId = 0;

        emit VoteCancelled(msg.sender, votedProposalId);
    }
}
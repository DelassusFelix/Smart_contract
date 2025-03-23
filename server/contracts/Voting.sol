// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Votereum
 * @dev Implements a voting system with proposals and votes
 * @author DELASSUS Félix & GILLET Victor
 */
contract Voting is Ownable {
    mapping(address => bool) public whiteList;
    address[] public whiteListArray;
    uint winningProposalId;

    mapping(address => Voter) public voterAddress;
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
     * @dev Initializes the contract and sets the initial workflow status
     */
    constructor() Ownable(msg.sender) {
        currentWorkflowStatus = WorkflowStatus.RegisteringVoters;
    }

    /**
     * @notice Registers a voter
     * @dev Only the owner can register a voter
     * @param _voterAddress The address of the voter to be registered
     */
    function registerVoter(address _voterAddress) public onlyOwner {
        require(!voterAddress[_voterAddress].isRegistered, "Voter already registered");
        whiteListArray.push(_voterAddress);
        whiteList[_voterAddress] = true;
        voterAddress[_voterAddress].isRegistered = true;
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
        require(!voterAddress[msg.sender].hasVoted, "Voter already voted");
        require(_proposalId < proposals.length, "Invalid proposal id");
        require(voterAddress[msg.sender].isRegistered, "Voter not registered");

        proposals[_proposalId].voteCount++;
        voterAddress[msg.sender].hasVoted = true;
        voterAddress[msg.sender].votedProposalId = _proposalId;

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
     * @notice Retrieves all proposals with their vote count and voters
     * @dev Returns an array of proposals, where each proposal includes its description, vote count, and the addresses of voters who voted for it
     * @return descriptions An array of proposal descriptions
     * @return voteCounts An array of vote counts corresponding to each proposal
     * @return votersPerProposal An array of arrays, where each inner array contains the addresses of voters for a proposal
     */
    function getAllProposalsWithVotes()
        public
        view
        returns (
            string[] memory descriptions,
            uint[] memory voteCounts,
            address[][] memory votersPerProposal
        )
    {
        uint proposalCount = proposals.length;

        descriptions = new string[](proposalCount);
        voteCounts = new uint[](proposalCount);
        votersPerProposal = new address[][](proposalCount);

        for (uint i = 0; i < proposalCount; i++) {
            descriptions[i] = proposals[i].description;
            voteCounts[i] = proposals[i].voteCount;

            uint voterCount = 0;

            for (uint j = 0; j < whiteListArray.length; j++) {
                if (
                    voterAddress[whiteListArray[j]].hasVoted &&
                    voterAddress[whiteListArray[j]].votedProposalId == i
                ) {
                    voterCount++;
                }
            }

            address[] memory voters = new address[](voterCount);
            uint voterIndex = 0;

            for (uint j = 0; j < whiteListArray.length; j++) {
                if (
                    voterAddress[whiteListArray[j]].hasVoted &&
                    voterAddress[whiteListArray[j]].votedProposalId == i
                ) {
                    voters[voterIndex] = whiteListArray[j];
                    voterIndex++;
                }
            }

            votersPerProposal[i] = voters;
        }

        return (descriptions, voteCounts, votersPerProposal);
    }

    /**
     * @notice Cancels a vote
     * @dev A voter must be registered, in the whitelist, and have voted. The voting session must be active
     */
    function cancelVote() public {
        require(currentWorkflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(voterAddress[msg.sender].isRegistered, "Voter not registered");
        require(voterAddress[msg.sender].hasVoted, "Voter has not voted yet");

        uint votedProposalId = voterAddress[msg.sender].votedProposalId;
        proposals[votedProposalId].voteCount--;

        voterAddress[msg.sender].hasVoted = false;
        voterAddress[msg.sender].votedProposalId = 0;

        emit VoteCancelled(msg.sender, votedProposalId);
    }

    /**
     * @notice Resets the voting session
     * @dev Only the owner can reset the session
     */
    function resetSession() public onlyOwner {
        currentWorkflowStatus = WorkflowStatus.RegisteringVoters;

        delete proposals;

        for (uint i = 0; i < whiteListArray.length; i++) {
            address voter = whiteListArray[i];
            voterAddress[voter].isRegistered = false;
            voterAddress[voter].hasVoted = false;
            voterAddress[voter].votedProposalId = 0;
        }
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    address[] whiteList;
    uint winningProposalId;

    mapping(address => Voter) public voterAdress; // Moved inside the contract
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

    // Constructor to initialize the Ownable contract
    constructor() Ownable(msg.sender) {
        currentWorkflowStatus = WorkflowStatus.RegisteringVoters;
    }

    function addVoterToWhiteList(address _voterAddress) public onlyOwner {
        whiteList.push(_voterAddress);
    }

    //-----------------------------------------User register------------------------------------------------

    function registerVoter(address _voterAddress) public onlyOwner {
        bool isInWhiteList = false;
        for (uint i = 0; i < whiteList.length; i++) {
            if (whiteList[i] == _voterAddress) {
                isInWhiteList = true;
                break;
            }
        }
        require(isInWhiteList, "Voter is not in the whitelist");
        require(!voterAdress[_voterAddress].isRegistered, "Voter already registered");
        voterAdress[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    //-----------------------------------------Proposals register------------------------------------------------

    function startProposalsRegistration() public onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
        currentWorkflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
    }

    function addProposal(string memory _description) public onlyOwner {
        require(currentWorkflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration session is not active");
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    function endProposalsRegistration() public onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationEnded);
        currentWorkflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
    }

    //-----------------------------------------Voting session------------------------------------------------

    function startVotingSession() public onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
        currentWorkflowStatus = WorkflowStatus.VotingSessionStarted;
    }

    function vote(uint _proposalId) public {
        require(currentWorkflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(voterAdress[msg.sender].isRegistered, "Voter not registered");
        require(!voterAdress[msg.sender].hasVoted, "Voter already voted");
        require(_proposalId < proposals.length, "Invalid proposal id");
        proposals[_proposalId].voteCount++;
        voterAdress[msg.sender].hasVoted = true;
        voterAdress[msg.sender].votedProposalId = _proposalId;
        emit Voted(msg.sender, _proposalId);
    }

    function endVotingSession() public onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
        currentWorkflowStatus = WorkflowStatus.VotingSessionEnded;
    }

    //-----------------------------------------Vote counter and analyse------------------------------------------------

    function tallyVotes() public onlyOwner {
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        currentWorkflowStatus = WorkflowStatus.VotesTallied;
    }

    function getWinningProposal() public view returns (string memory) {
        require(currentWorkflowStatus == WorkflowStatus.VotesTallied, "Tallied session is not active");
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0; // Use a local variable instead of modifying state
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }

        return proposals[winningProposalIndex].description;
    }

    function getAllVotes() public view returns (address[] memory, uint[] memory) {
        require(voterAdress[msg.sender].isRegistered, "You can't see it if you are not in the whitelist");
        uint totalVoters = whiteList.length;
        address[] memory voters = new address[](totalVoters);
        uint[] memory votes = new uint[](totalVoters);
        uint index = 0;

        for (uint i = 0; i < whiteList.length; i++) {
            address voterAddress = whiteList[i];
            if (voterAdress[voterAddress].hasVoted) {
                voters[index] = voterAddress;
                votes[index] = voterAdress[voterAddress].votedProposalId;
                index++;
            }
        }

        return (voters, votes);
    }

    //------------------------------------------Fonctionnalitées supplémentaires---------------------------------------------------------

    function cancelVote() public {
        require(currentWorkflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(voterAdress[msg.sender].isRegistered, "Voter not registered");
        require(voterAdress[msg.sender].hasVoted, "Voter has not voted yet");

        uint votedProposalId = voterAdress[msg.sender].votedProposalId;
        proposals[votedProposalId].voteCount--;

        voterAdress[msg.sender].hasVoted = false;
        voterAdress[msg.sender].votedProposalId = 0;

        emit Voted(msg.sender, votedProposalId);
    }
}
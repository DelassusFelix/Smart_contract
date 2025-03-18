pragma solidity ^0.8.21;
import "@openzeppelin/contracts/access/Ownable.sol";

address[] whiteList;
uint winningProposalId;

mapping(address => Voter) public voterAdress;

event VoterRegistered(address voterAddress);
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
event ProposalRegistered(uint proposalId);
event Voted (address voter, uint proposalId);

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
}

function addProposal(string memory _description) public onlyOwner {
    proposals.push(Proposal(_description, 0));
    emit ProposalRegistered(proposals.length - 1);
}  

function endProposalsRegistration() public onlyOwner {
    emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
}

//-----------------------------------------Voting session------------------------------------------------

function startVotingSession() public onlyOwner {
    emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
}

function vote(uint _proposalId) public {
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
}

//-----------------------------------------Vote counter and analyse------------------------------------------------

function tallyVotes() public onlyOwner {
    emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
}

function getWinningProposal() public view returns (string memory) {
    uint winningVoteCount = 0;
    for (uint i = 0; i < proposals.length; i++) {
        if (proposals[i].voteCount > winningVoteCount) {
            winningVoteCount = proposals[i].voteCount;
            winningProposalId = i;
        }
    }
    return proposals[winningProposalId].description;
}

function getAllVotes() public view returns (address[] memory, uint[] memory) {
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

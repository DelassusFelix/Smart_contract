"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum VotingPhase {
  RegisteringVoters = 0,
  ProposalsRegistrationStarted = 1,
  ProposalsRegistrationEnded = 2,
  VotingSessionStarted = 3,
  VotingSessionEnded = 4,
  VotesTallied = 5,
}

interface Voter {
  address: string;
  registeredAt: number;
}

interface Proposal {
  description: string;
  submitter: string;
  submittedAt: number;
}

interface Vote {
  voter: string;
  proposalId: number;
  votedAt: number;
}

interface VotingState {
  votingPhase: VotingPhase;
  voters: Voter[];
  proposals: Proposal[];
  votes: Vote[];

  // Admin actions
  addVoter: (address: string) => void;
  removeVoter: (address: string) => void;
  startProposalRegistration: () => void;
  endProposalRegistration: () => void;
  startVotingSession: () => void;
  endVotingSession: () => void;
  tallyVotes: () => void;

  // Voter actions
  addProposal: (submitter: string, description: string) => void;
  castVote: (voter: string, proposalId: number) => void;
  hasVoted: (voter: string) => boolean;

  resetSession: () => void;
}

export const useVotingStore = create<VotingState>()(
  persist(
    (set, get) => ({
      votingPhase: VotingPhase.RegisteringVoters,
      voters: [],
      proposals: [],
      votes: [],

      // Admin actions
      addVoter: (address) => {
        const { voters, votingPhase } = get();

        if (votingPhase !== VotingPhase.RegisteringVoters) {
          console.error("Cannot add voters in current phase");
          return;
        }

        if (voters.some((voter) => voter.address === address)) {
          console.error("Voter already registered");
          return;
        }

        set({
          voters: [...voters, { address, registeredAt: Date.now() }],
        });
      },

      removeVoter: (address) => {
        const { voters, votingPhase } = get();

        if (votingPhase !== VotingPhase.RegisteringVoters) {
          console.error("Cannot remove voters in current phase");
          return;
        }

        set({
          voters: voters.filter((voter) => voter.address !== address),
        });
      },

      startProposalRegistration: () => {
        const { votingPhase } = get();

        if (votingPhase !== VotingPhase.RegisteringVoters) {
          console.error("Cannot start proposal registration in current phase");
          return;
        }

        set({ votingPhase: VotingPhase.ProposalsRegistrationStarted });
      },

      endProposalRegistration: () => {
        const { votingPhase } = get();

        if (votingPhase !== VotingPhase.ProposalsRegistrationStarted) {
          console.error("Cannot end proposal registration in current phase");
          return;
        }

        set({ votingPhase: VotingPhase.ProposalsRegistrationEnded });
      },

      startVotingSession: () => {
        const { votingPhase } = get();

        if (votingPhase !== VotingPhase.ProposalsRegistrationEnded) {
          console.error("Cannot start voting session in current phase");
          return;
        }

        set({ votingPhase: VotingPhase.VotingSessionStarted });
      },

      endVotingSession: () => {
        const { votingPhase } = get();

        if (votingPhase !== VotingPhase.VotingSessionStarted) {
          console.error("Cannot end voting session in current phase");
          return;
        }

        set({ votingPhase: VotingPhase.VotingSessionEnded });
      },

      tallyVotes: () => {
        const { votingPhase } = get();

        if (votingPhase !== VotingPhase.VotingSessionEnded) {
          console.error("Cannot tally votes in current phase");
          return;
        }

        set({ votingPhase: VotingPhase.VotesTallied });
      },

      // Voter actions
      addProposal: (submitter, description) => {
        const { proposals, voters, votingPhase } = get();

        if (votingPhase !== VotingPhase.ProposalsRegistrationStarted) {
          console.error("Cannot add proposals in current phase");
          return;
        }

        if (!voters.some((voter) => voter.address === submitter)) {
          console.error("Submitter is not a registered voter");
          return;
        }

        set({
          proposals: [
            ...proposals,
            {
              description,
              submitter,
              submittedAt: Date.now(),
            },
          ],
        });
      },

      castVote: (voter, proposalId) => {
        const { votes, voters, proposals, votingPhase } = get();

        if (votingPhase !== VotingPhase.VotingSessionStarted) {
          console.error("Cannot vote in current phase");
          return;
        }

        if (!voters.some((v) => v.address === voter)) {
          console.error("Voter is not registered");
          return;
        }

        if (votes.some((vote) => vote.voter === voter)) {
          console.error("Voter has already voted");
          return;
        }

        if (proposalId < 0 || proposalId >= proposals.length) {
          console.error("Invalid proposal ID");
          return;
        }

        set({
          votes: [
            ...votes,
            {
              voter,
              proposalId,
              votedAt: Date.now(),
            },
          ],
        });
      },

      hasVoted: (voter) => {
        const { votes } = get();
        return votes.some((vote) => vote.voter === voter);
      },

      resetSession: () => {
        set({
          votingPhase: VotingPhase.RegisteringVoters,
          voters: [],
          proposals: [],
          votes: [],
        });
      },
    }),
    {
      name: "voting-storage",
    }
  )
);

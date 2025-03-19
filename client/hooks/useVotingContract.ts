import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const useVotingContract = (contractAddress: string, abi: any) => {
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        const initializeContract = async () => {
            if (window.ethereum) {
                const provider = new Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const votingContract = new ethers.Contract(contractAddress, abi, signer as unknown as ethers.ContractRunner);
                setContract(votingContract);
            } else {
                console.error("Ethereum object not found. Install MetaMask.");
            }
        };
        initializeContract();
    }, [contractAddress, abi]);

    const getProposals = async (): Promise<any[]> => {
        if (!contract) throw new Error("Contract not initialized");
        return await contract.getProposals();
    };

    const vote = async (proposalId: number): Promise<void> => {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.vote(proposalId);
        await tx.wait();
    };

    const getResults = async (): Promise<any> => {
        if (!contract) throw new Error("Contract not initialized");
        return await contract.getResults();
    };

    return { getProposals, vote, getResults };
};

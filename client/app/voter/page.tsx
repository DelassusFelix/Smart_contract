"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { VotingPhase, useVotingStore } from "@/lib/voting-store"
import { ProposalsList } from "@/components/proposals-list"
import { VotingInterface } from "@/components/voting-interface"

export default function VoterPage() {
  const { votingPhase, voters, addProposal, hasVoted } = useVotingStore()

  const [voterAddress, setVoterAddress] = useState("")
  const [proposal, setProposal] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)

  const checkRegistration = () => {
    if (!voterAddress) {
      setError("Please enter your address")
      return
    }

    const registered = voters.some((voter) => voter.address === voterAddress)
    setIsRegistered(registered)

    if (!registered) {
      setError("Your address is not registered as a voter")
    }
  }

  const handleSubmitProposal = () => {
    if (!isRegistered) {
      setError("You must be a registered voter")
      return
    }

    if (!proposal) {
      setError("Please enter a proposal")
      return
    }

    addProposal(voterAddress, proposal)
    setProposal("")
    setSuccess("Proposal submitted successfully")
    setTimeout(() => setSuccess(""), 3000)
  }

  const canSubmitProposal = isRegistered && votingPhase === VotingPhase.ProposalsRegistrationStarted
  const canVote = isRegistered && votingPhase === VotingPhase.VotingSessionStarted && !hasVoted(voterAddress)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Voter Interface</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 text-green-500">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Voter Registration</CardTitle>
          <CardDescription>Verify your voter registration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="voter-address">Your Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="voter-address"
                  placeholder="Enter your address"
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                />
                <Button onClick={checkRegistration}>Verify</Button>
              </div>
            </div>

            {isRegistered && (
              <Alert className="border-green-500 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Registered</AlertTitle>
                <AlertDescription>You are registered as a voter</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {isRegistered && (
        <Tabs defaultValue="proposals" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proposals">Submit Proposal</TabsTrigger>
            <TabsTrigger value="voting">Vote</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Proposal</CardTitle>
                <CardDescription>
                  {canSubmitProposal
                    ? "Enter your proposal for the voting session"
                    : "Proposal submission is currently closed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="proposal">Proposal</Label>
                    <Input
                      id="proposal"
                      placeholder="Enter your proposal"
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      disabled={!canSubmitProposal}
                    />
                  </div>
                  <Button onClick={handleSubmitProposal} disabled={!canSubmitProposal}>
                    Submit Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <h3 className="text-xl font-bold mb-4">All Proposals</h3>
              <ProposalsList />
            </div>
          </TabsContent>

          <TabsContent value="voting" className="pt-4">
            {votingPhase === VotingPhase.VotingSessionStarted ? (
              hasVoted(voterAddress) ? (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Already Voted</AlertTitle>
                  <AlertDescription>You have already cast your vote</AlertDescription>
                </Alert>
              ) : (
                <VotingInterface voterAddress={voterAddress} />
              )
            ) : (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Voting Not Active</AlertTitle>
                <AlertDescription>
                  {votingPhase < VotingPhase.VotingSessionStarted
                    ? "The voting session has not started yet"
                    : "The voting session has ended"}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}


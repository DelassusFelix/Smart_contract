"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useVotingStore } from "@/lib/voting-store"

interface VotersListProps {
  canRemove?: boolean
  onRemove?: (address: string) => void
}

export function VotersList({ canRemove = false, onRemove }: VotersListProps) {
  const { voters } = useVotingStore()

  if (voters.length === 0) {
    return <p className="text-muted-foreground">No voters registered yet.</p>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Registration Date</TableHead>
            {canRemove && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {voters.map((voter) => (
            <TableRow key={voter.address}>
              <TableCell className="font-mono">{voter.address}</TableCell>
              <TableCell>{new Date(voter.registeredAt).toLocaleString()}</TableCell>
              {canRemove && (
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onRemove?.(voter.address)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


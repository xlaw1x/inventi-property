"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { mutate } from "swr"

interface StatusSelectProps {
  ticketId: string
  currentStatus: "open" | "assigned" | "in_progress" | "resolved" | "closed"
  onStatusChange?: (newStatus: string) => void
}

export function StatusSelect({ ticketId, currentStatus, onStatusChange }: StatusSelectProps) {
  const handleStatusChange = async (newStatus: string) => {
    try {
      // Optimistic update
      onStatusChange?.(newStatus)

      await api.updateTicketStatus(ticketId, newStatus)

      // Revalidate tickets data
      mutate(["tickets"])
      mutate(["tickets", undefined])

      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      })
      // Revert optimistic update
      onStatusChange?.(currentStatus)
    }
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="assigned">Assigned</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  )
}

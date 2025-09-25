import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    open: "bg-red-100 text-red-800 hover:bg-red-100",
    assigned: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    resolved: "bg-green-100 text-green-800 hover:bg-green-100",
    closed: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  }

  const labels = {
    open: "Open",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  }

  return (
    <Badge variant="secondary" className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  )
}

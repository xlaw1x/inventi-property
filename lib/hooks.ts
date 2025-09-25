import useSWR from "swr"
import { api, withRetry } from "./api"

export function useTickets(status?: string) {
  return useSWR(["tickets", status], () => withRetry(() => api.getTickets(status)), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  })
}

export function useIncidents(severity?: string) {
  return useSWR(["incidents", severity], () => withRetry(() => api.getIncidents(severity)), {
    errorRetryCount: 1,
    shouldRetryOnError: false,
    refreshInterval: 60000, // Refresh every minute
  })
}

export function useServices(type?: string, status?: string) {
  return useSWR(["services", type, status], () => withRetry(() => api.getServices(type, status)), {
    refreshInterval: 45000, // Refresh every 45 seconds
    errorRetryCount: 2,
  })
}

export function useApiHealth() {
  return useSWR("api-health", () => api.healthCheck(), {
    refreshInterval: 60000,
    errorRetryCount: 1,
    shouldRetryOnError: false,
  })
}

export function useDeliveries(status?: string) {
  return useSWR(["deliveries", status], () => withRetry(() => api.getDeliveries(status)), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  })
}

export function useDeliveryStats() {
  return useSWR("delivery-stats", () => withRetry(() => api.getDeliveryStats()), {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    errorRetryCount: 2,
    errorRetryInterval: 3000,
  })
}

export function useOptimisticTickets() {
  const { data: tickets, mutate } = useTickets()

  const updateTicketOptimistically = async (ticketId: string, newStatus: string) => {
    if (!tickets) return

    // Optimistic update
    const optimisticTickets = tickets.map((ticket: any) =>
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket,
    )

    // Update cache immediately
    mutate(optimisticTickets, false)

    try {
      // Make API call
      await api.updateTicketStatus(ticketId, newStatus)
      // Revalidate to ensure consistency
      mutate()
    } catch (error) {
      // Revert on error
      mutate()
      throw error
    }
  }

  return {
    tickets,
    updateTicketOptimistically,
  }
}

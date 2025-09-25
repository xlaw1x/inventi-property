const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

import {
  mockTickets,
  mockIncidents,
  mockServices,
  mockDeliveries,
  mockTenants,
  mockAnnouncements,
  mockDashboardStats,
  mockChartData,
} from "./mock-data"

import { csvDataService } from "./csv-data-service"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`)
  }

  return response.json()
}

const DEMO_MODE = true // Set to false when connecting to real API

export const api = {
  // Maintenance tickets
  getTickets: async (status?: string) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      return status ? mockTickets.filter((t) => t.status === status) : mockTickets
    }
    return fetchApi(`/maintenance${status ? `?status=${status}` : ""}`)
  },

  updateTicketStatus: async (id: string, status: string) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const ticket = mockTickets.find((t) => t.id === id)
      if (ticket) {
        ticket.status = status
        ticket.updated_at = new Date().toISOString()
      }
      return { success: true, ticket }
    }
    return fetchApi(`/maintenance/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },

  createRoomTicket: async (formData: FormData) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newTicket = {
        id: String(mockTickets.length + 1),
        description: formData.get("description") as string,
        severity: formData.get("severity") as string,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        room_number: formData.get("room_number") as string,
        tenant_name: formData.get("tenant_name") as string,
        category: (formData.get("category") as string) || "general",
        assigned_to: null,
      }
      mockTickets.unshift(newTicket)
      return newTicket
    }
    return fetch(`${API_BASE}/maintenance/room`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new ApiError(res.status, res.statusText)
      return res.json()
    })
  },

  createBuildingTicket: async (formData: FormData) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newTicket = {
        id: String(mockTickets.length + 1),
        description: formData.get("description") as string,
        severity: formData.get("severity") as string,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        building_area: formData.get("building_area") as string,
        category: (formData.get("category") as string) || "general",
        assigned_to: null,
      }
      mockTickets.unshift(newTicket)
      return newTicket
    }
    return fetch(`${API_BASE}/maintenance/building`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new ApiError(res.status, res.statusText)
      return res.json()
    })
  },

  // Incidents
  getIncidents: async (severity?: string) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return severity ? mockIncidents.filter((i) => i.severity === severity) : mockIncidents
    }
    return fetchApi(`/incidents${severity ? `?severity=${severity}` : ""}`)
  },

  // Service requests
  getServices: async (type?: string, status?: string) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 450))
      let filtered = mockServices
      if (type) filtered = filtered.filter((s) => s.svc_type === type)
      if (status) filtered = filtered.filter((s) => s.status === status)
      return filtered
    }
    const params = new URLSearchParams()
    if (type) params.append("svc_type", type)
    if (status) params.append("status", status)
    return fetchApi(`/service${params.toString() ? `?${params}` : ""}`)
  },

  // Deliveries - Updated to use real CSV data
  getDeliveries: async (status?: string) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 450))
      try {
        const deliveries = await csvDataService.getDeliveryData()
        return status ? deliveries.filter((d) => d.status === status) : deliveries
      } catch (error) {
        console.error("[v0] Error fetching CSV deliveries, falling back to mock data:", error)
        return status ? mockDeliveries.filter((d) => d.status === status) : mockDeliveries
      }
    }
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    return fetchApi(`/deliveries${params.toString() ? `?${params}` : ""}`)
  },

  getDeliveryStats: async () => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      try {
        return await csvDataService.getDeliveryStats()
      } catch (error) {
        console.error("[v0] Error fetching CSV delivery stats, falling back to mock data:", error)
        // Fallback to mock stats
        return {
          totalDeliveries: mockDeliveries.length,
          completedDeliveries: mockDeliveries.filter((d) => d.status === "completed").length,
          overdueDeliveries: 2,
          onTimeDeliveries: 4,
          avgOverdueDays: 1.5,
        }
      }
    }
    return fetchApi("/deliveries/stats")
  },

  getTenants: async () => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      return mockTenants
    }
    return fetchApi("/tenants")
  },

  getAnnouncements: async () => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 350))
      return mockAnnouncements.filter((a) => !a.expires_at || new Date(a.expires_at) > new Date())
    }
    return fetchApi("/announcements")
  },

  getDashboardStats: async () => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 700))
      return mockDashboardStats
    }
    return fetchApi("/dashboard/stats")
  },

  getChartData: async () => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockChartData
    }
    return fetchApi("/dashboard/charts")
  },

  // Health check endpoint
  healthCheck: async () => {
    if (DEMO_MODE) {
      return { status: "ok", mode: "demo" }
    }
    return fetchApi("/health").catch(() => ({ status: "error" }))
  },
}

// Data validation utilities
export const validateTicketData = (data: any) => {
  const required = ["description", "severity"]
  const missing = required.filter((field) => !data[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`)
  }
  return true
}

// Simplified retry function without complex generics
export async function withRetry(operation: () => Promise<any>, maxRetries = 3, delay = 1000) {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxRetries) break

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

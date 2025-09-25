export interface PropertyTicket {
  dateSubmitted: string
  dateSubmittedWithTime: string
  ticketType: string
  ticketId: string
  property: string
  buildingTower: string
  floorNumber: string
  unitRoomNumber: string
  requestType: string
  category: string
  preferredDate: string
  preferredDateWithTime: string
  resolveDate?: string
  resolveDateWithTime?: string
  priority: string
  status: string
  statusDateChange: string
  shortTitle: string
  detailedDescription: string
}

export interface ProcessedDeliveryData {
  id: string
  svc_type: "delivery"
  description: string
  status: "pending" | "approved" | "completed" | "cancelled"
  created_at: string
  expected_delivery_date: string
  completed_at?: string
  requester_name?: string
  unit_id: string
  delivery_company?: string
  tracking_number?: string
  priority: string
  category: string
  isOverdue: boolean
  daysOverdue?: number
}

class CSVDataService {
  private csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smart_property_datasets_final-5epItiQcafof0sfmM5qsuDXBA5bF5w.csv"
  private cachedData: PropertyTicket[] | null = null
  private lastFetchTime = 0
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private parseDate(dateStr: string): string {
    if (!dateStr || dateStr.trim() === "") return new Date().toISOString()

    try {
      // Handle MM/DD/YYYY format
      const parts = dateStr.split("/")
      if (parts.length === 3) {
        const [month, day, year] = parts
        return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day)).toISOString()
      }

      // Fallback to direct parsing
      return new Date(dateStr).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  private parseDateWithTime(dateStr: string): string {
    if (!dateStr || dateStr.trim() === "") return new Date().toISOString()

    try {
      // Handle MM/DD/YYYY HH:MM format
      const [datePart, timePart] = dateStr.split(" ")
      if (datePart && timePart) {
        const [month, day, year] = datePart.split("/")
        const [hour, minute] = timePart.split(":")
        return new Date(
          Number.parseInt(year),
          Number.parseInt(month) - 1,
          Number.parseInt(day),
          Number.parseInt(hour),
          Number.parseInt(minute),
        ).toISOString()
      }

      return new Date(dateStr).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  async fetchCSVData(): Promise<PropertyTicket[]> {
    const now = Date.now()

    // Return cached data if still valid
    if (this.cachedData && now - this.lastFetchTime < this.cacheTimeout) {
      return this.cachedData
    }

    try {
      console.log("[v0] Fetching CSV data from:", this.csvUrl)
      const response = await fetch(this.csvUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`)
      }

      const csvText = await response.text()
      const lines = csvText.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("CSV file appears to be empty or invalid")
      }

      // Skip header row
      const dataLines = lines.slice(1)

      const tickets: PropertyTicket[] = dataLines.map((line, index) => {
        try {
          const columns = this.parseCSVLine(line)

          return {
            dateSubmitted: this.parseDate(columns[0] || ""),
            dateSubmittedWithTime: this.parseDateWithTime(columns[1] || ""),
            ticketType: columns[2] || "maintenance request",
            ticketId: columns[3] || `ticket_${index}`,
            property: columns[4] || "Property 1",
            buildingTower: columns[5] || "Building A",
            floorNumber: columns[6] || "1",
            unitRoomNumber: columns[7] || "101",
            requestType: columns[8] || "General Request",
            category: columns[9] || "Others",
            preferredDate: this.parseDate(columns[10] || ""),
            preferredDateWithTime: this.parseDateWithTime(columns[11] || ""),
            resolveDate: columns[12] ? this.parseDate(columns[12]) : undefined,
            resolveDateWithTime: columns[13] ? this.parseDateWithTime(columns[13]) : undefined,
            priority: columns[14] || "medium",
            status: columns[15] || "pending",
            statusDateChange: this.parseDateWithTime(columns[16] || ""),
            shortTitle: columns[17] || "Service Request",
            detailedDescription: columns[18] || "No description provided",
          }
        } catch (error) {
          console.warn(`[v0] Error parsing CSV line ${index + 1}:`, error)
          // Return a default ticket for failed parsing
          return {
            dateSubmitted: new Date().toISOString(),
            dateSubmittedWithTime: new Date().toISOString(),
            ticketType: "maintenance request",
            ticketId: `ticket_${index}`,
            property: "Property 1",
            buildingTower: "Building A",
            floorNumber: "1",
            unitRoomNumber: "101",
            requestType: "General Request",
            category: "Others",
            preferredDate: new Date().toISOString(),
            preferredDateWithTime: new Date().toISOString(),
            priority: "medium",
            status: "pending",
            statusDateChange: new Date().toISOString(),
            shortTitle: "Service Request",
            detailedDescription: "No description provided",
          }
        }
      })

      console.log(`[v0] Successfully parsed ${tickets.length} tickets from CSV`)

      this.cachedData = tickets
      this.lastFetchTime = now

      return tickets
    } catch (error) {
      console.error("[v0] Error fetching CSV data:", error)
      throw error
    }
  }

  async getDeliveryData(): Promise<ProcessedDeliveryData[]> {
    const tickets = await this.fetchCSVData()
    const now = new Date()

    // Filter for delivery-related tickets and transform to delivery format
    const deliveryTickets = tickets.filter(
      (ticket) =>
        ticket.requestType.toLowerCase().includes("delivery") ||
        ticket.category.toLowerCase().includes("delivery") ||
        ticket.ticketType.toLowerCase().includes("delivery") ||
        ticket.shortTitle.toLowerCase().includes("delivery") ||
        ticket.detailedDescription.toLowerCase().includes("delivery"),
    )

    return deliveryTickets.map((ticket) => {
      const expectedDate = new Date(ticket.preferredDateWithTime)
      const completedDate = ticket.resolveDateWithTime ? new Date(ticket.resolveDateWithTime) : null
      const isCompleted = ticket.status.toLowerCase() === "resolved" || ticket.status.toLowerCase() === "completed"

      // Calculate if overdue
      let isOverdue = false
      let daysOverdue = 0

      if (!isCompleted && expectedDate < now) {
        isOverdue = true
        daysOverdue = Math.ceil((now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Map status from CSV to our delivery status
      let deliveryStatus: "pending" | "approved" | "completed" | "cancelled"
      switch (ticket.status.toLowerCase()) {
        case "resolved":
        case "completed":
          deliveryStatus = "completed"
          break
        case "cancelled":
        case "closed":
          deliveryStatus = "cancelled"
          break
        case "acknowledge":
        case "approved":
        case "in_progress":
          deliveryStatus = "approved"
          break
        default:
          deliveryStatus = "pending"
      }

      return {
        id: ticket.ticketId,
        svc_type: "delivery" as const,
        description: ticket.shortTitle,
        status: deliveryStatus,
        created_at: ticket.dateSubmittedWithTime,
        expected_delivery_date: ticket.preferredDateWithTime,
        completed_at: completedDate?.toISOString(),
        requester_name: `Unit ${ticket.unitRoomNumber}`,
        unit_id: `${ticket.buildingTower}-${ticket.unitRoomNumber}`,
        delivery_company: ticket.category,
        tracking_number: ticket.ticketId,
        priority: ticket.priority,
        category: ticket.category,
        isOverdue,
        daysOverdue: isOverdue ? daysOverdue : undefined,
      }
    })
  }

  async getDeliveryStats() {
    const deliveries = await this.getDeliveryData()
    const now = new Date()

    const totalDeliveries = deliveries.length
    const completedDeliveries = deliveries.filter((d) => d.status === "completed").length
    const overdueDeliveries = deliveries.filter((d) => d.isOverdue).length
    const onTimeDeliveries =
      completedDeliveries -
      deliveries.filter(
        (d) =>
          d.status === "completed" &&
          d.completed_at &&
          d.expected_delivery_date &&
          new Date(d.completed_at) > new Date(d.expected_delivery_date),
      ).length

    const totalOverdueDays = deliveries
      .filter((d) => d.isOverdue && d.daysOverdue)
      .reduce((sum, d) => sum + (d.daysOverdue || 0), 0)

    const avgOverdueDays = overdueDeliveries > 0 ? totalOverdueDays / overdueDeliveries : 0

    return {
      totalDeliveries,
      completedDeliveries,
      overdueDeliveries,
      onTimeDeliveries,
      avgOverdueDays: Math.round(avgOverdueDays * 10) / 10,
    }
  }
}

export const csvDataService = new CSVDataService()

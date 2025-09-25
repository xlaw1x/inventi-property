"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { mutate } from "swr"
import { Plus, Upload } from "lucide-react"

interface NewTicketModalProps {
  children?: React.ReactNode
}

export function NewTicketModal({ children }: NewTicketModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticketType, setTicketType] = useState<"room" | "building">("room")

  // Room ticket form
  const [roomForm, setRoomForm] = useState({
    building: "",
    floor: "",
    room: "",
    description: "",
    severity: "",
    photo: null as File | null,
  })

  // Building ticket form
  const [buildingForm, setBuildingForm] = useState({
    building: "",
    area: "",
    description: "",
    severity: "",
    photo: null as File | null,
  })

  const resetForms = () => {
    setRoomForm({
      building: "",
      floor: "",
      room: "",
      description: "",
      severity: "",
      photo: null,
    })
    setBuildingForm({
      building: "",
      area: "",
      description: "",
      severity: "",
      photo: null,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      if (ticketType === "room") {
        formData.append("building", roomForm.building)
        formData.append("floor", roomForm.floor)
        formData.append("room", roomForm.room)
        formData.append("description", roomForm.description)
        formData.append("severity", roomForm.severity)
        if (roomForm.photo) {
          formData.append("photo", roomForm.photo)
        }
        await api.createRoomTicket(formData)
      } else {
        formData.append("building", buildingForm.building)
        formData.append("area", buildingForm.area)
        formData.append("description", buildingForm.description)
        formData.append("severity", buildingForm.severity)
        if (buildingForm.photo) {
          formData.append("photo", buildingForm.photo)
        }
        await api.createBuildingTicket(formData)
      }

      toast({
        title: "Ticket created",
        description: "Your maintenance ticket has been submitted successfully.",
      })

      // Refresh tickets data
      mutate(["tickets"])
      mutate(["tickets", undefined])

      resetForms()
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>Submit a new maintenance request for your property.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={ticketType} onValueChange={(value) => setTicketType(value as "room" | "building")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="room">Room Issue</TabsTrigger>
              <TabsTrigger value="building">Building Issue</TabsTrigger>
            </TabsList>

            <TabsContent value="room" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room-building">Building</Label>
                  <Input
                    id="room-building"
                    value={roomForm.building}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                    placeholder="Building A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-floor">Floor</Label>
                  <Input
                    id="room-floor"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    placeholder="3"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-room">Room</Label>
                <Input
                  id="room-room"
                  value={roomForm.room}
                  onChange={(e) => setRoomForm({ ...roomForm, room: e.target.value })}
                  placeholder="301A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-description">Description</Label>
                <Textarea
                  id="room-description"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  placeholder="Describe the issue..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-severity">Severity</Label>
                <Select
                  value={roomForm.severity}
                  onValueChange={(value) => setRoomForm({ ...roomForm, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-photo">Photo (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="room-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setRoomForm({ ...roomForm, photo: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("room-photo")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {roomForm.photo ? roomForm.photo.name : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="building" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="building-building">Building</Label>
                <Input
                  id="building-building"
                  value={buildingForm.building}
                  onChange={(e) => setBuildingForm({ ...buildingForm, building: e.target.value })}
                  placeholder="Building A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building-area">Area</Label>
                <Input
                  id="building-area"
                  value={buildingForm.area}
                  onChange={(e) => setBuildingForm({ ...buildingForm, area: e.target.value })}
                  placeholder="Lobby, Parking, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building-description">Description</Label>
                <Textarea
                  id="building-description"
                  value={buildingForm.description}
                  onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                  placeholder="Describe the issue..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building-severity">Severity</Label>
                <Select
                  value={buildingForm.severity}
                  onValueChange={(value) => setBuildingForm({ ...buildingForm, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="building-photo">Photo (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="building-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBuildingForm({ ...buildingForm, photo: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("building-photo")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {buildingForm.photo ? buildingForm.photo.name : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

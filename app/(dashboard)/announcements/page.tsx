"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MarkdownEditor } from "@/components/announcements/markdown-editor"
import { toast } from "@/hooks/use-toast"
import { Save, RotateCcw, Copy, ExternalLink } from "lucide-react"

const STORAGE_KEY = "pm_announcement_v1"
const DEFAULT_CONTENT = `# Welcome to Our Property

## Important Updates

We're committed to providing you with the best living experience. Please check back regularly for important announcements and updates.

### Contact Information

For maintenance requests, please use the Property Ops system or contact our office during business hours.

**Office Hours:** Monday - Friday, 9:00 AM - 5:00 PM

---

*Last updated: ${new Date().toLocaleDateString()}*`

export default function AnnouncementsPage() {
  const [content, setContent] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load content from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setContent(saved)
    } else {
      setContent(DEFAULT_CONTENT)
    }
    setIsLoading(false)
  }, [])

  // Track changes
  useEffect(() => {
    if (!isLoading) {
      const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT
      setHasUnsavedChanges(content !== saved)
    }
  }, [content, isLoading])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, content)
    setHasUnsavedChanges(false)
    toast({
      title: "Announcement saved",
      description: "Your announcement has been saved successfully.",
    })
  }

  const handleReset = () => {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT
    setContent(saved)
    setHasUnsavedChanges(false)
    toast({
      title: "Changes discarded",
      description: "Your unsaved changes have been discarded.",
    })
  }

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/announcements?view=public`
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Link copied",
      description: "Public announcement link copied to clipboard.",
    })
  }

  const handleViewPublic = () => {
    const publicUrl = `${window.location.origin}/announcements?view=public`
    window.open(publicUrl, "_blank")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyPublicLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Public Link
          </Button>
          <Button variant="outline" onClick={handleViewPublic}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Public
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Announcements</CardTitle>
          <CardDescription>
            Create and manage announcements for your tenants. Changes are saved locally and can be shared via public
            link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your announcement in Markdown..."
            />

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {hasUnsavedChanges ? "You have unsaved changes" : "All changes saved"}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset} disabled={!hasUnsavedChanges}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

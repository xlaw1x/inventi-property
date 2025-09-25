"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const STORAGE_KEY = "pm_announcement_v1"

export default function PublicAnnouncementsPage() {
  const searchParams = useSearchParams()
  const isPublicView = searchParams.get("view") === "public"
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setContent(saved)
    } else {
      setContent(`# Welcome to Our Property

## Important Updates

We're committed to providing you with the best living experience. Please check back regularly for important announcements and updates.

### Contact Information

For maintenance requests, please contact our office during business hours.

**Office Hours:** Monday - Friday, 9:00 AM - 5:00 PM

---

*Last updated: ${new Date().toLocaleDateString()}*`)
    }
    setIsLoading(false)
  }, [])

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-1">$1</li>')
      .replace(/^---$/gim, '<hr class="my-6 border-gray-200">')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|hr])/gim, '<p class="mb-4">')
      .replace(/$/gim, "</p>")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isPublicView) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Property Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Private view (requires authentication)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

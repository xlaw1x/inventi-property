"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Edit } from "lucide-react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit")

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l])/gim, '<p class="mb-4">')
      .replace(/$/gim, "</p>")
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your announcement in Markdown..."}
            className="min-h-[300px] font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground mt-2">
            Supports: # Headers, **bold**, *italic*, * bullet points, 1. numbered lists
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              {value.trim() ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
                />
              ) : (
                <p className="text-muted-foreground italic">Nothing to preview yet...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

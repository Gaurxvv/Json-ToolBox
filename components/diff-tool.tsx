"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import yaml from "js-yaml"
import { XMLParser } from "fast-xml-parser"

export default function DiffTool() {
  const [format, setFormat] = useState("json")
  const [leftInput, setLeftInput] = useState("")
  const [rightInput, setRightInput] = useState("")
  const [diffOutput, setDiffOutput] = useState("")
  const [error, setError] = useState("")
  const leftFileInputRef = useRef<HTMLInputElement>(null)
  const rightFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleLeftFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setLeftInput(content)
    }
    reader.readAsText(file)

    // Reset file input
    if (leftFileInputRef.current) {
      leftFileInputRef.current.value = ""
    }
  }

  const handleRightFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setRightInput(content)
    }
    reader.readAsText(file)

    // Reset file input
    if (rightFileInputRef.current) {
      rightFileInputRef.current.value = ""
    }
  }

  const generateDiff = () => {
    setError("")
    try {
      if (format === "json") {
        // In a real app, we'd use a proper diff library
        // This is a simplified example
        const leftObj = JSON.parse(leftInput)
        const rightObj = JSON.parse(rightInput)

        // Simple diff output for demonstration
        setDiffOutput(
          "Diff would be generated with a proper diff library\n\n" +
            "Left:\n" +
            JSON.stringify(leftObj, null, 2) +
            "\n\n" +
            "Right:\n" +
            JSON.stringify(rightObj, null, 2),
        )
        toast({
          variant: "success",
          description: "Diff generated successfully!",
        })
      } else if (format === "yaml") {
        // In a real app, we'd use js-yaml and a diff library
        const leftObj = yaml.load(leftInput)
        const rightObj = yaml.load(rightInput)
        setDiffOutput(
          "YAML diff would be implemented with js-yaml and a diff library\n\n" +
            "Left:\n" +
            yaml.dump(leftObj) +
            "\n\n" +
            "Right:\n" +
            yaml.dump(rightObj),
        )
        toast({
          variant: "success",
          description: "YAML diff generated successfully!",
        })
      } else if (format === "xml") {
        // In a real app, we'd use fast-xml-parser and a diff library
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        })
        const leftObj = parser.parse(leftInput)
        const rightObj = parser.parse(rightInput)
        setDiffOutput(
          "XML diff would be implemented with fast-xml-parser and a diff library\n\n" +
            "Left:\n" +
            JSON.stringify(leftObj, null, 2) +
            "\n\n" +
            "Right:\n" +
            JSON.stringify(rightObj, null, 2),
        )
        toast({
          variant: "success",
          description: "XML diff generated successfully!",
        })
      }
    } catch (err) {
      setError(`Error generating diff: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={format} onValueChange={setFormat} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="json"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            JSON
          </TabsTrigger>
          <TabsTrigger
            value="yaml"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            YAML
          </TabsTrigger>
          <TabsTrigger
            value="xml"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            XML
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Left Input</h2>
            <Button variant="outline" onClick={() => leftFileInputRef.current?.click()} className="border-2">
              <FileUp className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <input
              type="file"
              ref={leftFileInputRef}
              onChange={handleLeftFileUpload}
              className="hidden"
              accept=".json,.yaml,.yml,.xml,.txt"
            />
          </div>

          <Textarea
            value={leftInput}
            onChange={(e) => setLeftInput(e.target.value)}
            placeholder={`Paste your ${format.toUpperCase()} here...`}
            className="min-h-[300px] font-mono border-2 border-primary/20 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Right Input</h2>
            <Button variant="outline" onClick={() => rightFileInputRef.current?.click()} className="border-2">
              <FileUp className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <input
              type="file"
              ref={rightFileInputRef}
              onChange={handleRightFileUpload}
              className="hidden"
              accept=".json,.yaml,.yml,.xml,.txt"
            />
          </div>

          <Textarea
            value={rightInput}
            onChange={(e) => setRightInput(e.target.value)}
            placeholder={`Paste your ${format.toUpperCase()} here...`}
            className="min-h-[300px] font-mono border-2 border-primary/20 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={generateDiff} className="px-8 py-2 text-lg font-bold" disabled={!leftInput || !rightInput}>
          Generate Diff
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Diff Output</h2>

        {error ? (
          <Alert variant="destructive" className="border-2 border-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Textarea value={diffOutput} readOnly className="min-h-[300px] font-mono border-2 border-primary/20" />
        )}
      </div>
    </div>
  )
}

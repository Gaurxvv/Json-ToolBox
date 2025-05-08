"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, ArrowDownToLine, ClipboardCopy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import yaml from "js-yaml"

export default function MergeTool() {
  const [format, setFormat] = useState("json")
  const [leftInput, setLeftInput] = useState("")
  const [rightInput, setRightInput] = useState("")
  const [mergeOutput, setMergeOutput] = useState("")
  const [mergeStrategy, setMergeStrategy] = useState("deep")
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

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(mergeOutput)
    toast({
      variant: "success",
      description: "Copied to clipboard",
    })
  }

  const handleDownload = () => {
    let extension = ".txt"
    let mimeType = "text/plain"

    if (format === "json") {
      extension = ".json"
      mimeType = "application/json"
    } else if (format === "yaml") {
      extension = ".yaml"
      mimeType = "application/x-yaml"
    }

    const blob = new Blob([mergeOutput], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `merged-data${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      variant: "success",
      description: "File downloaded successfully",
    })
  }

  // Deep merge function for objects
  const deepMerge = (target: any, source: any, arrayStrategy = "replace") => {
    const output = { ...target }

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] })
          } else {
            output[key] = deepMerge(target[key], source[key], arrayStrategy)
          }
        } else if (Array.isArray(source[key])) {
          if (Array.isArray(target[key])) {
            if (arrayStrategy === "concat") {
              output[key] = [...target[key], ...source[key]]
            } else if (arrayStrategy === "merge") {
              output[key] = target[key].map((item: any, index: number) => {
                return source[key][index] !== undefined
                  ? isObject(item) && isObject(source[key][index])
                    ? deepMerge(item, source[key][index], arrayStrategy)
                    : source[key][index]
                  : item
              })

              // Add any additional items from source
              if (source[key].length > target[key].length) {
                output[key] = [...output[key], ...source[key].slice(target[key].length)]
              }
            } else {
              output[key] = source[key]
            }
          } else {
            output[key] = source[key]
          }
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }

    return output
  }

  const isObject = (item: any) => {
    return item && typeof item === "object" && !Array.isArray(item)
  }

  const generateMerge = () => {
    setError("")
    try {
      if (format === "json") {
        const leftObj = JSON.parse(leftInput)
        const rightObj = JSON.parse(rightInput)

        let result
        if (mergeStrategy === "deep") {
          result = deepMerge(leftObj, rightObj)
        } else if (mergeStrategy === "left-priority") {
          result = deepMerge(rightObj, leftObj)
        } else if (mergeStrategy === "array-concat") {
          result = deepMerge(leftObj, rightObj, "concat")
        }

        setMergeOutput(JSON.stringify(result, null, 2))
        toast({
          variant: "success",
          description: "JSON merged successfully!",
        })
      } else if (format === "yaml") {
        const leftObj = yaml.load(leftInput)
        const rightObj = yaml.load(rightInput)

        let result
        if (mergeStrategy === "deep") {
          result = deepMerge(leftObj, rightObj)
        } else if (mergeStrategy === "left-priority") {
          result = deepMerge(rightObj, leftObj)
        } else if (mergeStrategy === "array-concat") {
          result = deepMerge(leftObj, rightObj, "concat")
        }

        setMergeOutput(yaml.dump(result))
        toast({
          variant: "success",
          description: "YAML merged successfully!",
        })
      }
    } catch (err) {
      setError(`Error generating merge: ${(err as Error).message}`)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={format} onValueChange={setFormat} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
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
              accept=".json,.yaml,.yml,.txt"
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
              accept=".json,.yaml,.yml,.txt"
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

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Merge Strategy</h2>
        <RadioGroup value={mergeStrategy} onValueChange={setMergeStrategy} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deep" id="deep" />
            <Label htmlFor="deep" className="font-medium">
              Deep Merge (right overwrites left)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="left-priority" id="left-priority" />
            <Label htmlFor="left-priority" className="font-medium">
              Left Priority (left overwrites right)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="array-concat" id="array-concat" />
            <Label htmlFor="array-concat" className="font-medium">
              Concatenate Arrays
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-center">
        <Button onClick={generateMerge} className="px-8 py-2 text-lg font-bold" disabled={!leftInput || !rightInput}>
          Merge Data
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Merge Output</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleCopyOutput} className="border-2">
              <ClipboardCopy className="h-4 w-4" />
              <span className="sr-only">Copy to clipboard</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload} className="border-2">
              <ArrowDownToLine className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive" className="border-2 border-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Textarea value={mergeOutput} readOnly className="min-h-[300px] font-mono border-2 border-primary/20" />
        )}
      </div>
    </div>
  )
}

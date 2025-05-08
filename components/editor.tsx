"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowDownToLine, ClipboardCopy, FileUp, RotateCcw, RotateCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import yaml from "js-yaml"
import { XMLParser, XMLBuilder } from "fast-xml-parser"

export default function Editor() {
  const [inputFormat, setInputFormat] = useState("json")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (value: string) => {
    setInput(value)
    // Add to history for undo/redo
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(value)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setInput(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setInput(history[historyIndex + 1])
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setInput(content)
      handleInputChange(content)
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output)
    toast({
      variant: "success",
      description: "Copied to clipboard",
    })
  }

  const handleDownload = () => {
    let extension = ".txt"
    let mimeType = "text/plain"

    if (inputFormat === "json") {
      extension = ".json"
      mimeType = "application/json"
    } else if (inputFormat === "yaml") {
      extension = ".yaml"
      mimeType = "application/x-yaml"
    } else if (inputFormat === "xml") {
      extension = ".xml"
      mimeType = "application/xml"
    }

    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `data-toolbox-output${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      variant: "success",
      description: "File downloaded successfully",
    })
  }

  const parseInput = () => {
    setError("")
    try {
      if (inputFormat === "json") {
        const parsed = JSON.parse(input)
        setOutput(JSON.stringify(parsed, null, 2))
        toast({
          variant: "success",
          description: "JSON parsed successfully!",
        })
      } else if (inputFormat === "yaml") {
        const parsed = yaml.load(input)
        setOutput(yaml.dump(parsed))
        toast({
          variant: "success",
          description: "YAML parsed successfully!",
        })
      } else if (inputFormat === "xml") {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        })
        const builder = new XMLBuilder({
          format: true,
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        })
        const parsed = parser.parse(input)
        setOutput(builder.build(parsed))
        toast({
          variant: "success",
          description: "XML parsed successfully!",
        })
      }
    } catch (err) {
      setError(`Error parsing ${inputFormat.toUpperCase()}: ${(err as Error).message}`)
    }
  }

  const convertYamlToJson = () => {
    setError("")
    try {
      const parsed = yaml.load(input)
      setOutput(JSON.stringify(parsed, null, 2))
      toast({
        variant: "success",
        description: "YAML converted to JSON successfully!",
      })
    } catch (err) {
      setError(`Error converting YAML to JSON: ${(err as Error).message}`)
    }
  }

  const convertJsonToYaml = () => {
    setError("")
    try {
      const parsed = JSON.parse(input)
      setOutput(yaml.dump(parsed))
      toast({
        variant: "success",
        description: "JSON converted to YAML successfully!",
      })
    } catch (err) {
      setError(`Error converting JSON to YAML: ${(err as Error).message}`)
    }
  }

  const convertJsonToXml = () => {
    setError("")
    try {
      const parsed = JSON.parse(input)
      const builder = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
      })
      setOutput(builder.build(parsed))
      toast({
        variant: "success",
        description: "JSON converted to XML successfully!",
      })
    } catch (err) {
      setError(`Error converting JSON to XML: ${(err as Error).message}`)
    }
  }

  const convertXmlToJson = () => {
    setError("")
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      })
      const parsed = parser.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      toast({
        variant: "success",
        description: "XML converted to JSON successfully!",
      })
    } catch (err) {
      setError(`Error converting XML to JSON: ${(err as Error).message}`)
    }
  }

  const encodeBase64 = () => {
    setError("")
    try {
      const encoded = btoa(input)
      setOutput(encoded)
      toast({
        variant: "success",
        description: "Text encoded to Base64 successfully!",
      })
    } catch (err) {
      setError(`Error encoding to Base64: ${(err as Error).message}`)
    }
  }

  const decodeBase64 = () => {
    setError("")
    try {
      const decoded = atob(input)
      setOutput(decoded)
      toast({
        variant: "success",
        description: "Base64 decoded successfully!",
      })
    } catch (err) {
      setError(`Error decoding from Base64: ${(err as Error).message}`)
    }
  }

  const minify = () => {
    setError("")
    try {
      if (inputFormat === "json") {
        const parsed = JSON.parse(input)
        setOutput(JSON.stringify(parsed))
        toast({
          variant: "success",
          description: "JSON minified successfully!",
        })
      } else if (inputFormat === "xml") {
        // Simple XML minification by removing whitespace between tags
        setOutput(input.replace(/>\s+</g, "><").trim())
        toast({
          variant: "success",
          description: "XML minified successfully!",
        })
      } else if (inputFormat === "yaml") {
        // For YAML, convert to JSON and back to get a compact representation
        const obj = yaml.load(input)
        setOutput(yaml.dump(obj, { flowLevel: 1 }))
        toast({
          variant: "success",
          description: "YAML minified successfully!",
        })
      }
    } catch (err) {
      setError(`Error minifying: ${(err as Error).message}`)
    }
  }

  const validate = () => {
    setError("")
    try {
      if (inputFormat === "json") {
        JSON.parse(input)
        setOutput("JSON is valid")
        toast({
          variant: "success",
          description: "JSON is valid!",
        })
      } else if (inputFormat === "yaml") {
        yaml.load(input)
        setOutput("YAML is valid")
        toast({
          variant: "success",
          description: "YAML is valid!",
        })
      } else if (inputFormat === "xml") {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        })
        parser.parse(input)
        setOutput("XML is valid")
        toast({
          variant: "success",
          description: "XML is valid!",
        })
      }
    } catch (err) {
      setError(`Invalid ${inputFormat.toUpperCase()}: ${(err as Error).message}`)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Input</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="border-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="border-2"
            >
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Redo</span>
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-2">
              <FileUp className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".json,.yaml,.yml,.xml,.txt"
            />
          </div>
        </div>

        <Tabs value={inputFormat} onValueChange={setInputFormat} className="w-full">
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

          <TabsContent value="json" className="mt-2">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your JSON here..."
              className="min-h-[400px] font-mono border-2 border-primary/20 focus-visible:ring-primary"
            />
          </TabsContent>

          <TabsContent value="yaml" className="mt-2">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your YAML here..."
              className="min-h-[400px] font-mono border-2 border-primary/20 focus-visible:ring-primary"
            />
          </TabsContent>

          <TabsContent value="xml" className="mt-2">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your XML here..."
              className="min-h-[400px] font-mono border-2 border-primary/20 focus-visible:ring-primary"
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <Button onClick={parseInput} className="font-bold">
            Parse
          </Button>
          <Button onClick={validate} className="font-bold">
            Validate
          </Button>
          <Button onClick={minify} className="font-bold">
            Minify
          </Button>

          {inputFormat === "yaml" && (
            <Button onClick={convertYamlToJson} className="font-bold">
              YAML → JSON
            </Button>
          )}

          {inputFormat === "json" && (
            <>
              <Button onClick={convertJsonToYaml} className="font-bold">
                JSON → YAML
              </Button>
              <Button onClick={convertJsonToXml} className="font-bold">
                JSON → XML
              </Button>
            </>
          )}

          {inputFormat === "xml" && (
            <Button onClick={convertXmlToJson} className="font-bold">
              XML → JSON
            </Button>
          )}

          <Button onClick={encodeBase64} className="font-bold">
            Encode Base64
          </Button>
          <Button onClick={decodeBase64} className="font-bold">
            Decode Base64
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Output</h2>
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
          <Textarea value={output} readOnly className="min-h-[400px] font-mono border-2 border-primary/20" />
        )}
      </div>
    </div>
  )
}

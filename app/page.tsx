import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Editor from "@/components/editor"
import DiffTool from "@/components/diff-tool"
import MergeTool from "@/components/merge-tool"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="relative py-6">
  {/* Theme toggle at top-right */}
  <div className="absolute top-6 right-6">
    <ThemeToggle />
  </div>

  {/* Centered content */}
  <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
    <div className="bg-primary rounded-md px-4 py-2 mb-2">
  <span className="text-primary-foreground font-bold text-2xl">JSON Toolbox</span>
</div>
    <p className="text-xl text-muted-foreground">
      Powerful JSON, YAML, and XML manipulation at your fingertips. Parse, convert, minify, and merge with ease. Our intuitive interface supports file uploads, undo/redo, and instant validation for seamless data handling.
    </p>
  </div>
</header>


        <Tabs defaultValue="editor" className="w-full ">
          <TabsList className="grid w-full grid-cols-3 h-11 mb-8">
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-3"
            >
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="diff"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-3"
            >
              Diff Tool
            </TabsTrigger>
            <TabsTrigger
              value="merge"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-3"
            >
              Merge Tool
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-0">
            <Editor />
          </TabsContent>

          <TabsContent value="diff" className="mt-0">
            <DiffTool />
          </TabsContent>

          <TabsContent value="merge" className="mt-0">
            <MergeTool />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

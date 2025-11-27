import { ResumeAgent } from "@/features/resume-agent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { GlobalToolbar } from "@/shared/components/global-toolbar";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Jobz</h1>
        <GlobalToolbar />
        <Tabs defaultValue="resume-agent" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="resume-agent">Resume Agent</TabsTrigger>
          </TabsList>
          <TabsContent value="resume-agent">
            <ResumeAgent />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

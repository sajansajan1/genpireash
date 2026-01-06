"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentTestHarness, StoreInspector } from "@/modules/ai-designer/test-setup";

export default function TestAIDesigner() {
  const [showInspector, setShowInspector] = useState(false);
  const testProjectId = "test-project-123"; // Replace with a real project ID for testing

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Designer Testing Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scenarios" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
              <TabsTrigger value="components">Component Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Test Scenarios:</h3>
                <div className="space-y-2">
                  {/* Test: Open AI Designer without project */}
                  <Link href="/ai-designer">
                    <Button variant="outline" className="w-full justify-start">
                      1. Open AI Designer (No Project) - Original Version
                    </Button>
                  </Link>

                  {/* Test: Open with project ID */}
                  <Link href={`/ai-designer?projectId=${testProjectId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      2. Open with Project ID - Toggle Available
                    </Button>
                  </Link>

                  {/* Test: Auto-generate flow */}
                  <Link
                    href={`/ai-designer?projectId=${testProjectId}&prompt=Create a modern t-shirt design&autoGenerate=true`}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      3. Auto-Generate with Prompt
                    </Button>
                  </Link>

                  {/* Test: Upload design flow */}
                  <Link href={`/ai-designer?projectId=${testProjectId}&type=upload&autoGenerate=true`}>
                    <Button variant="outline" className="w-full justify-start">
                      4. Upload Design Flow
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Testing Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click any button above to open AI Designer</li>
                  <li>Look for the toggle button in the top-right corner</li>
                  <li>Switch between "Original" and "Modular" versions</li>
                  <li>
                    Test the following in both versions:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Chat interface - send messages</li>
                      <li>Zoom controls - zoom in/out</li>
                      <li>Revision history - view past edits</li>
                      <li>Edit prompt - enter design changes</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-[#1C1917]">
                  💡 <strong>Pro Tip:</strong> Open DevTools console to see debug logs and state changes.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              <div className="mb-4">
                <Button onClick={() => setShowInspector(!showInspector)} variant="outline" className="mb-4">
                  {showInspector ? "Hide" : "Show"} Store Inspector
                </Button>
                <p className="text-sm text-[#1C1917]">Test individual components in isolation below:</p>
              </div>

              <ComponentTestHarness />
              {showInspector && <StoreInspector />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

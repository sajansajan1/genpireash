"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testAnalysisDirect, forceCreateAnalysisTable } from "@/app/actions/test-analysis-direct";
import { Loader2 } from "lucide-react";

export default function TestAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await testAnalysisDirect(productId || undefined);
      setResult(res);
      console.log("Test result:", res);
    } finally {
      setLoading(false);
    }
  };

  const handleForceCreate = async () => {
    setLoading(true);
    try {
      const res = await forceCreateAnalysisTable();
      setResult(res);
      console.log("Force create result:", res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Image Analysis Test & Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Product ID (optional)"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <Button onClick={handleTest} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Analysis
            </Button>
            <Button onClick={handleForceCreate} disabled={loading} variant="outline">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Force Create Table
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              <h3 className="font-semibold mb-2">{result.success ? "✅ Success" : "❌ Error"}</h3>

              {result.message && <p className="mb-2">{result.message}</p>}

              {result.error && <p className="text-red-600 mb-2">Error: {result.error}</p>}

              {result.savedInDb !== undefined && <p className="mb-2">Saved in DB: {result.savedInDb} entries</p>}

              {result.sampleProductId && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p>Sample Product ID: {result.sampleProductId}</p>
                  <p>Product Name: {result.sampleProductName}</p>
                  <p className="text-sm mt-1">{result.suggestion}</p>
                </div>
              )}

              {result.analysisResult && (
                <div className="mt-2">
                  <h4 className="font-semibold">Analysis Result:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(result.analysisResult, null, 2)}
                  </pre>
                </div>
              )}

              {result.savedAnalyses && result.savedAnalyses.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold">Saved Analyses:</h4>
                  {result.savedAnalyses.map((analysis: any, i: number) => (
                    <div key={i} className="text-sm bg-gray-50 p-2 rounded mb-1">
                      <p>URL: {analysis.image_url.substring(0, 50)}...</p>
                      <p>Model: {analysis.model_used}</p>
                      <p>Created: {new Date(analysis.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Stack trace</summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{result.stack}</pre>
                </details>
              )}
            </div>
          )}

          <div className="text-sm text-[#1C1917]">
            <p>This page helps debug the image analysis caching system.</p>
            <p>1. First, check if the table exists</p>
            <p>2. Enter a product ID to test analysis for that product</p>
            <p>3. Check console for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkImageAnalysisCache, triggerAnalysisForProduct } from "@/app/actions/debug-analysis";
import { Loader2 } from "lucide-react";

export function TestImageAnalysis({ productId }: { productId?: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cacheStatus, setCacheStatus] = useState<any>(null);

  const handleCheckCache = async () => {
    setLoading(true);
    try {
      const status = await checkImageAnalysisCache();
      setCacheStatus(status);
      console.log("Cache status:", status);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!productId) {
      setResult({ error: "No product ID provided" });
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await triggerAnalysisForProduct(productId);
      setResult(analysisResult);
      console.log("Analysis result:", analysisResult);

      // Refresh cache status
      const status = await checkImageAnalysisCache();
      setCacheStatus(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Image Analysis Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleCheckCache} disabled={loading} variant="outline">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Check Cache Status
          </Button>

          {productId && (
            <Button onClick={handleTriggerAnalysis} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze This Product
            </Button>
          )}
        </div>

        {cacheStatus && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="font-semibold">Cache Status:</p>
            <p>Table exists: {cacheStatus.tableExists ? "✅" : "❌"}</p>
            <p>Total entries: {cacheStatus.totalEntries || 0}</p>
            {cacheStatus.recentEntries?.length > 0 && (
              <div>
                <p className="font-semibold mt-2">Recent entries:</p>
                {cacheStatus.recentEntries.map((entry: any, i: number) => (
                  <div key={i} className="text-sm">
                    {new Date(entry.created_at).toLocaleString()} - {entry.model_used}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? "bg-green-50" : "bg-red-50"}`}>
            <p className="font-semibold">{result.success ? "✅ Analysis Complete" : "❌ Analysis Failed"}</p>
            {result.message && <p>{result.message}</p>}
            {result.error && <p className="text-red-600">{result.error}</p>}
            {result.analysisResults && (
              <p className="mt-2">
                Analyzed views:{" "}
                {Object.keys(result.analysisResults)
                  .filter((k) => k !== "combinedAnalysis")
                  .join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="text-sm text-[#1C1917]">
          <p>Product ID: {productId || "Not provided"}</p>
          <p>Use this panel to debug image analysis caching.</p>
        </div>
      </CardContent>
    </Card>
  );
}

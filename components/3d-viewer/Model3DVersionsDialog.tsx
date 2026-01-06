"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Model3DVersion {
  id: string;
  version: number;
  is_active: boolean;
  status: string;
  thumbnail_url?: string;
  model_urls: {
    glb?: string;
    fbx?: string;
    usdz?: string;
    obj?: string;
    mtl?: string;
  };
  created_at: string;
  finished_at?: string;
}

interface Model3DVersionsDialogProps {
  open: boolean;
  onClose: () => void;
  sourceType: "product" | "collection";
  sourceId: string;
  sourceName: string;
  onVersionSelected?: (version: Model3DVersion) => void;
}

export function Model3DVersionsDialog({
  open,
  onClose,
  sourceType,
  sourceId,
  sourceName,
  onVersionSelected,
}: Model3DVersionsDialogProps) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Model3DVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, sourceId, sourceType]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/product-3d-models?sourceType=${sourceType}&sourceId=${sourceId}&includeAll=true`
      );
      const result = await response.json();

      if (result.success) {
        setVersions(result.models || []);
      } else {
        throw new Error(result.error || "Failed to fetch versions");
      }
    } catch (error) {
      console.error("Error fetching 3D model versions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load 3D model versions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (modelId: string) => {
    setActionLoading(modelId);
    try {
      const response = await fetch("/api/product-3d-models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          action: "set_active",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Version set as active successfully",
        });
        await fetchVersions(); // Refresh the list
      } else {
        throw new Error(result.error || "Failed to set active version");
      }
    } catch (error) {
      console.error("Error setting active version:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set active version",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (modelId: string) => {
    if (!confirm("Are you sure you want to delete this 3D model version?")) {
      return;
    }

    setActionLoading(modelId);
    try {
      const response = await fetch(
        `/api/product-3d-models?modelId=${modelId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "3D model version deleted successfully",
        });
        await fetchVersions(); // Refresh the list
      } else {
        throw new Error(result.error || "Failed to delete version");
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete version",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (version: Model3DVersion) => {
    if (onVersionSelected) {
      onVersionSelected(version);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">3D Model Versions</DialogTitle>
          <DialogDescription className="text-sm">
            All generated 3D model versions for <strong>{sourceName}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No 3D model versions found
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`border rounded-lg p-3 sm:p-4 ${
                  version.is_active
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {version.thumbnail_url ? (
                      <img
                        src={version.thumbnail_url}
                        alt={`Version ${version.version}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No preview
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm sm:text-base text-[rgb(24,24,27)]">
                        Version {version.version}
                      </h4>
                      {version.is_active && (
                        <Badge className="bg-emerald-600 text-white text-xs">Active</Badge>
                      )}
                      <Badge
                        variant={
                          version.status === "SUCCEEDED"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {version.status}
                      </Badge>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p>
                        Created:{" "}
                        {format(new Date(version.created_at), "PP")}
                      </p>
                      {version.finished_at && (
                        <p>
                          Finished:{" "}
                          {format(new Date(version.finished_at), "PP")}
                        </p>
                      )}
                      <p>
                        Formats:{" "}
                        {Object.keys(version.model_urls || {}).join(", ").toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(version)}
                      disabled={version.status !== "SUCCEEDED"}
                      className="flex-1 sm:flex-none border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View
                    </Button>

                    {!version.is_active && version.status === "SUCCEEDED" && (
                      <Button
                        size="sm"
                        onClick={() => handleSetActive(version.id)}
                        disabled={actionLoading === version.id}
                        className="flex-1 sm:flex-none bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90 text-xs sm:text-sm"
                      >
                        {actionLoading === version.id ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        )}
                        Set Active
                      </Button>
                    )}

                    {!version.is_active && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(version.id)}
                        disabled={actionLoading === version.id}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        {actionLoading === version.id ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, Upload, X, Trash2, AlertCircle, UploadCloud, Sparkles } from "lucide-react";
import { uploadFileToSupabase } from "@/lib/supabase/file_upload";
import { getUserUploads, saveUserUpload } from "@/app/actions/media-library";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useGetTryOnHistoryStore } from "@/lib/zustand/try-on/getTryOnhistory";
import { ImageDropzone, type UploadedFile } from "@/components/ui/image-dropzone";

interface MediaUploadModalProps {
  trigger?: React.ReactNode;
  selectionMode?: boolean;
  onImageSelect?: (imageUrl: string) => void;
}

interface SelectedFile {
  file: File;
  preview: string;
}

type GalleryTab = "media" | "Studio";

export function MediaUploadModal({ trigger, selectionMode = false, onImageSelect }: MediaUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GalleryTab>("media");

  // Studio history store
  const { GetTryOnHistory, loadingGetTryOnHistory, fetchTryOnHistory } = useGetTryOnHistoryStore();

  useEffect(() => {
    if (isOpen) {
      fetchUploads();
      fetchTryOnHistory();
    } else {
      // Cleanup previews
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);
    }
  }, [isOpen]);

  const fetchUploads = async () => {
    setIsLoading(true);
    const result = await getUserUploads();
    if (result.success && result.data) {
      setUploads(result.data);
    }
    setIsLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];

    // Loop through all selected files
    Array.from(files).forEach((file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileTypeValid = validTypes.includes(file.type);
      const extensionValid = validExtensions.includes(fileExtension);

      // Basic MIME + extension validation
      if (!fileTypeValid || !extensionValid) {
        setUploadError("Please upload a PNG, JPG or JPEG file");
        return;
      }

      // Size validation
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }

      // Deep validation using signature
      const reader = new FileReader();

      reader.onloadend = () => {
        const buffer = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 8);
        let header = "";
        buffer.forEach((b) => (header += b.toString(16).padStart(2, "0")));

        const isJPEG = header.startsWith("ffd8ff");
        const isPNG = header.startsWith("89504e470d0a1a0a");

        if ((fileExtension === "jpg" || fileExtension === "jpeg") && !isJPEG) {
          setUploadError(
            "File extension is .jpg/.jpeg but file content is not a valid JPEG image."
          );
          return;
        }

        if (fileExtension === "png" && !isPNG) {
          setUploadError(
            "File extension is .png but file content is not a valid PNG image."
          );
          return;
        }

        // Passed all validation → add to preview list
        setSelectedFiles((prev) => [
          ...prev,
          {
            file,
            preview: URL.createObjectURL(file),
          },
        ]);
      };

      reader.readAsArrayBuffer(file); // Trigger signature validation
    });

    // Reset input after processing
    e.target.value = "";
  };

    const validateFileSignature = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
            const reader = new FileReader();

            reader.onloadend = () => {
                const buffer = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 8);
                let header = "";
                buffer.forEach((b) => (header += b.toString(16).padStart(2, "0")));

                const isJPEG = header.startsWith("ffd8ff");
                const isPNG = header.startsWith("89504e470d0a1a0a");

                if ((fileExtension === "jpg" || fileExtension === "jpeg") && !isJPEG) {
                    setUploadError("File extension is .jpg/.jpeg but file content is not a valid JPEG image.");
                    resolve(false);
                    return;
                }

                if (fileExtension === "png" && !isPNG) {
                    setUploadError("File extension is .png but file content is not a valid PNG image.");
                    resolve(false);
                    return;
                }

                resolve(true);
            };

            reader.readAsArrayBuffer(file);
        });
    };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

      const handleFilesSelect = useCallback(async (files: File[]) => {
        setUploadError(null);

        // Validate each file's signature
        for (const file of files) {
            const isValid = await validateFileSignature(file);
            if (isValid) {
                const preview = URL.createObjectURL(file);
                setSelectedFiles((prev) => [...prev, { file, preview }]);
            }
        }
    }, []);

    const handleFileRemoveAt = useCallback((index: number) => {
        setSelectedFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

  
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newUploads = [];
    let successCount = 0;

    try {
      for (const item of selectedFiles) {
        const { file } = item;

        // Upload to storage
        const publicUrl = await uploadFileToSupabase(file);

        if (publicUrl) {
          // Save to database
          const saveResult = await saveUserUpload({
            fileUrl: publicUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });

          if (saveResult.success) {
            newUploads.push(saveResult.data);
            successCount++;
          } else {
            console.error("Failed to save DB record", saveResult.error);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} images`);
        fetchUploads();
        setSelectedFiles([]); // Clear selection
      } else if (selectedFiles.length > 0) {
        toast.error("Failed to upload images");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectionMode && onImageSelect) {
      onImageSelect(imageUrl);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="sm:gap-2 flex items-center gap-1 px-2 py-1 border rounded-full text-xs font-medium h-7  transition-colors">
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Media Uploads</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add your brand assets</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Upload Area */}
          <div className="space-y-3">
                        <ImageDropzone
                            multiple
                            values={selectedFiles}
                            onFilesSelect={handleFilesSelect}
                            onFileRemoveAt={handleFileRemoveAt}
                            disabled={isUploading}
                            placeholder="Drag & drop or click to upload"
                            helperText="PNG, JPG up to 5MB - Upload sketches, logos, and references"
                            gridCols={6}
                            showFileName={false}
                        />

                        {/* Upload button */}
                        {selectedFiles.length > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    onClick={handleUploadFiles}
                                    disabled={isUploading}
                                    size="sm"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Image' : 'Images'}`
                                    )}
                                </Button>
                            </div>
                        )}

                        {uploadError && (
                            <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 justify-center">
                                <AlertCircle className="h-3 w-3" /> {uploadError}
                            </p>
                        )}
                    </div>

          <div className="flex-1 overflow-hidden">
            {/* Toggle Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-medium mr-2">Recent Images</h4>
              <div className="flex rounded-lg border p-0.5 bg-muted/50">
                <button
                  onClick={() => setActiveTab("media")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "media"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Media Uploads
                </button>
                <button
                  onClick={() => setActiveTab("Studio")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "Studio"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Studio Images
                </button>
              </div>
            </div>

            {/* Media Uploads Gallery */}
            {activeTab === "media" && (
              <>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : uploads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No images uploaded yet.
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4 pb-4">
                      {uploads.map((item) => (
                        <div
                          key={item.id}
                          className={`group relative aspect-square border rounded-md overflow-hidden bg-muted ${selectionMode ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2' : ''}`}
                          onClick={() => handleImageSelect(item.file_url)}
                        >
                          <Image
                            src={item.file_url}
                            alt={item.file_name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {selectionMode && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">Select</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}

            {/* Studio Images Gallery */}
            {activeTab === "Studio" && (
              <>
                {loadingGetTryOnHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !GetTryOnHistory || GetTryOnHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No Studio images yet. Generate some in the Studio!
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4 pb-4">
                      {GetTryOnHistory.map((item: any) => (
                        <div
                          key={item.id}
                          className={`group relative aspect-square border rounded-md overflow-hidden bg-muted ${selectionMode ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2' : ''}`}
                          onClick={() => handleImageSelect(item.url || "")}
                        >
                          <Image
                            src={item.url || "/placeholder.png"}
                            alt={item.prompt || "Studio image"}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {/* Overlay with prompt info on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-white text-xs line-clamp-2">
                                {selectionMode ? "Click to Select" : (item.image_type || "Generated")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

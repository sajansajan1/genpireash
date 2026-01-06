"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface UploadedFile {
  file: File;
  preview: string;
}

export interface ImageDropzoneProps {
  /** Callback when file(s) are selected/dropped - single file mode */
  onFileSelect?: (file: File) => void;
  /** Callback when files are selected/dropped - multiple files mode */
  onFilesSelect?: (files: File[]) => void;
  /** Callback when file is removed (single mode) */
  onFileRemove?: () => void;
  /** Callback when file is removed (multiple mode) - passes index */
  onFileRemoveAt?: (index: number) => void;
  /** Currently uploaded file (controlled mode - single) */
  value?: UploadedFile | null;
  /** Currently uploaded files (controlled mode - multiple) */
  values?: UploadedFile[];
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Whether multiple files are allowed */
  multiple?: boolean;
  /** Disable the dropzone */
  disabled?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Aspect ratio for preview (default: "video" = 16:9) */
  previewAspect?: "video" | "square";
  /** Show file name below preview */
  showFileName?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom helper text */
  helperText?: string;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Grid columns for multiple files preview */
  gridCols?: number;
}

export function ImageDropzone({
  onFileSelect,
  onFilesSelect,
  onFileRemove,
  onFileRemoveAt,
  value,
  values,
  accept = "image/png,image/jpeg,image/jpg",
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  disabled = false,
  className,
  previewAspect = "video",
  showFileName = true,
  placeholder = "Drag & drop or click to upload",
  helperText = "PNG, JPG up to 5MB",
  compact = false,
  gridCols = 4,
}: ImageDropzoneProps) {
  const [internalFile, setInternalFile] = useState<UploadedFile | null>(null);
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const uploadedFile = value !== undefined ? value : internalFile;
  const uploadedFiles = values !== undefined ? values : internalFiles;

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (internalFile?.preview) {
        URL.revokeObjectURL(internalFile.preview);
      }
      internalFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const validateFile = (file: File): boolean => {
    // Validate file type
    const allowedTypes = accept.split(",").map((t) => t.trim());
    if (!allowedTypes.includes(file.type)) {
      alert(`Please upload a valid image file (${accept})`);
      return false;
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      alert(`Image size must be less than ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const validateAndSetFile = (file: File) => {
    if (!validateFile(file)) return;

    // Revoke previous preview URL if exists (only for internal state)
    if (internalFile?.preview && value === undefined) {
      URL.revokeObjectURL(internalFile.preview);
    }

    // Create preview and store file
    const preview = URL.createObjectURL(file);
    const newFile = { file, preview };

    // Update internal state if not controlled
    if (value === undefined) {
      setInternalFile(newFile);
    }

    // Notify parent
    onFileSelect?.(file);
  };

  const validateAndSetFiles = (files: File[]) => {
    const validFiles: UploadedFile[] = [];
    const rawFiles: File[] = [];

    files.forEach((file) => {
      if (validateFile(file)) {
        const preview = URL.createObjectURL(file);
        validFiles.push({ file, preview });
        rawFiles.push(file);
      }
    });

    if (validFiles.length === 0) return;

    // Update internal state if not controlled
    if (values === undefined) {
      setInternalFiles((prev) => [...prev, ...validFiles]);
    }

    // Notify parent
    onFilesSelect?.(rawFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      validateAndSetFiles(Array.from(files));
    } else {
      const file = files[0];
      validateAndSetFile(file);
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      validateAndSetFiles(Array.from(files));
    } else {
      validateAndSetFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Revoke preview URL if using internal state
    if (internalFile?.preview && value === undefined) {
      URL.revokeObjectURL(internalFile.preview);
    }

    // Update internal state if not controlled
    if (value === undefined) {
      setInternalFile(null);
    }

    // Notify parent
    onFileRemove?.();
  };

  const handleRemoveAt = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();

    // Revoke preview URL if using internal state
    if (values === undefined && internalFiles[index]?.preview) {
      URL.revokeObjectURL(internalFiles[index].preview);
    }

    // Update internal state if not controlled
    if (values === undefined) {
      setInternalFiles((prev) => prev.filter((_, i) => i !== index));
    }

    // Notify parent
    onFileRemoveAt?.(index);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const aspectClass = previewAspect === "square" ? "aspect-square" : "aspect-video";

  // Multiple files mode
  if (multiple) {
    const hasFiles = uploadedFiles.length > 0;

    return (
      <div className={cn("space-y-3", className)}>
        {/* Drag and drop area - always visible in multiple mode */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg text-center transition-all",
            compact ? "p-4" : "p-6",
            disabled
              ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
              : isDragging
                ? "border-gray-400 bg-gray-100 cursor-copy"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={cn("bg-gray-100 rounded-full", compact ? "p-2" : "p-2.5")}>
              <Upload className={cn("text-gray-500", compact ? "h-4 w-4" : "h-5 w-5")} />
            </div>
            <div className="space-y-1">
              <p className={cn("font-medium text-gray-700", compact ? "text-xs" : "text-sm")}>
                {isDragging ? "Drop images here" : placeholder}
              </p>
              <p className={cn("text-gray-400", compact ? "text-[10px]" : "text-xs")}>
                {helperText}
              </p>
            </div>
          </div>
        </div>

        {/* Grid preview of uploaded files */}
        {hasFiles && (
          <div className={cn(
            "grid gap-3",
            gridCols === 2 && "grid-cols-2",
            gridCols === 3 && "grid-cols-3",
            gridCols === 4 && "grid-cols-4",
            gridCols === 5 && "grid-cols-5",
            gridCols === 6 && "grid-cols-6"
          )}>
            {uploadedFiles.map((item, idx) => (
              <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={item.preview}
                  alt={`Preview ${idx + 1}`}
                  fill
                  className="object-contain"
                />
                <button
                  onClick={(e) => handleRemoveAt(e, idx)}
                  disabled={disabled}
                  className={cn(
                    "absolute top-1 right-1 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-0.5 transition-colors",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
                {showFileName && item.file && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                    <p className="text-[10px] text-white truncate">
                      {item.file.name}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    );
  }

  // Single file mode
  return (
    <div className={cn("space-y-2", className)}>
      {uploadedFile ? (
        // Show uploaded image preview
        <div className="relative">
          <div
            className={cn(
              "relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50",
              aspectClass
            )}
          >
            <Image
              src={uploadedFile.preview}
              alt="Uploaded preview"
              fill
              className="object-contain"
            />
            <button
              onClick={handleRemove}
              disabled={disabled}
              className={cn(
                "absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-1 transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {showFileName && uploadedFile.file && (
            <p className="text-xs text-gray-500 mt-1.5 truncate">
              {uploadedFile.file.name}
            </p>
          )}
        </div>
      ) : (
        // Show drag and drop area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg text-center transition-all",
            compact ? "p-4" : "p-6",
            disabled
              ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
              : isDragging
                ? "border-gray-400 bg-gray-100 cursor-copy"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={cn("bg-gray-100 rounded-full", compact ? "p-2" : "p-2.5")}>
              <Upload className={cn("text-gray-500", compact ? "h-4 w-4" : "h-5 w-5")} />
            </div>
            <div className="space-y-1">
              <p className={cn("font-medium text-gray-700", compact ? "text-xs" : "text-sm")}>
                {isDragging ? "Drop image here" : placeholder}
              </p>
              <p className={cn("text-gray-400", compact ? "text-[10px]" : "text-xs")}>
                {helperText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}

export default ImageDropzone;

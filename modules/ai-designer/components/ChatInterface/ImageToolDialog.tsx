/**
 * Image Tool Selection Dialog
 * Allows users to specify the purpose of their image upload
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PenTool, Badge, Image as ImageIcon, Upload, ImagePlus, Loader2, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserUploads } from "@/app/actions/media-library";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { ImageDropzone, type UploadedFile } from "@/components/ui/image-dropzone";

export type ImageToolType = "logo" | "sketch" | "reference" | "model";

export type LogoPosition =
  | "front-left"
  | "front-right"
  | "front-center"
  | "back-left"
  | "back-right"
  | "back-center"
  | "side-left"
  | "side-right"
  | "top"
  | "bottom"
  | "custom";

export interface ImageToolSelection {
  toolType: ImageToolType;
  note?: string;
  logoPosition?: LogoPosition;
}

type ImageSourceType = "upload" | "library";

interface MediaUpload {
  id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

interface ImageToolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: ImageToolSelection) => void;
  onFileSelect?: (file: File, selection: ImageToolSelection) => void;
  onLibrarySelect?: (imageUrl: string, selection: ImageToolSelection) => void;
}

const TOOL_OPTIONS: {
  type: ImageToolType;
  label: string;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  promptEnhancement: string;
}[] = [
  {
    type: "logo",
    label: "Logo",
    description: "Your brand logo to apply on the design",
    icon: Badge,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
    borderColor: "border-gray-300",
    promptEnhancement:
      "Apply this logo to the design. Place it prominently on the product.",
  },
  {
    type: "sketch",
    label: "Sketch",
    description: "Hand-drawn sketch or concept art",
    icon: PenTool,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
    borderColor: "border-gray-300",
    promptEnhancement:
      "Use this sketch as the design concept. Recreate this design professionally on the product.",
  },
  {
    type: "reference",
    label: "Reference Image",
    description: "Inspiration or style reference",
    icon: ImageIcon,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
    borderColor: "border-gray-300",
    promptEnhancement:
      "Use this as a reference for the style, colors, and overall aesthetic of the design.",
  },
  {
    type: "model",
    label: "Virtual Try-On",
    description: "Show the product on a person/model",
    icon: User,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
    borderColor: "border-gray-300",
    promptEnhancement:
      "Show the current product design being worn by the person in this image.",
  },
];

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: "front-left", label: "Front Left" },
  { value: "front-center", label: "Front Center" },
  { value: "front-right", label: "Front Right" },
  { value: "back-left", label: "Back Left" },
  { value: "back-center", label: "Back Center" },
  { value: "back-right", label: "Back Right" },
  { value: "side-left", label: "Side Left" },
  { value: "side-right", label: "Side Right" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "custom", label: "Custom (specify in notes)" },
];

export function ImageToolDialog({
  isOpen,
  onClose,
  onConfirm,
  onFileSelect,
  onLibrarySelect,
}: ImageToolDialogProps) {
  const [selectedTool, setSelectedTool] = useState<ImageToolType | null>(null);
  const [note, setNote] = useState("");
  const [logoPosition, setLogoPosition] =
    useState<LogoPosition>("front-center");
  const [imageSource, setImageSource] = useState<ImageSourceType>("upload");
  const [libraryImages, setLibraryImages] = useState<MediaUpload[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedLibraryImage, setSelectedLibraryImage] = useState<MediaUpload | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // Fetch library images when switching to library tab
  useEffect(() => {
    if (imageSource === "library" && libraryImages.length === 0 && isOpen) {
      fetchLibraryImages();
    }
  }, [imageSource, isOpen]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedLibraryImage(null);
      setImageSource("upload");
      if (uploadedFile?.preview) {
        URL.revokeObjectURL(uploadedFile.preview);
      }
      setUploadedFile(null);
    }
  }, [isOpen]);

  const fetchLibraryImages = async () => {
    setIsLoadingLibrary(true);
    try {
      const result = await getUserUploads();
      if (result.success && result.data) {
        setLibraryImages(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch library images:", error);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const preview = URL.createObjectURL(file);
    setUploadedFile({ file, preview });
  };

  const handleFileRemove = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  };

  const handleConfirmUpload = () => {
    if (!selectedTool || !uploadedFile) {
      alert("Please select a tool type and upload an image");
      return;
    }

    // Build the selection object
    const selection: ImageToolSelection = {
      toolType: selectedTool,
      note: note.trim() || undefined,
      logoPosition: selectedTool === "logo" ? logoPosition : undefined,
    };

    // Pass selection to parent (for backward compatibility)
    onConfirm(selection);

    // Pass file AND selection to parent
    if (onFileSelect) {
      onFileSelect(uploadedFile.file, selection);
    }

    // Reset state
    setSelectedTool(null);
    setNote("");
    setLogoPosition("front-center");
    setUploadedFile(null);
    onClose();
  };

  const handleLibraryImageSelect = () => {
    if (!selectedTool || !selectedLibraryImage) {
      alert("Please select a tool type and an image");
      return;
    }

    // Build the selection object
    const selection: ImageToolSelection = {
      toolType: selectedTool,
      note: note.trim() || undefined,
      logoPosition: selectedTool === "logo" ? logoPosition : undefined,
    };

    // Pass selection to parent
    onConfirm(selection);

    // Pass image URL and selection to parent
    if (onLibrarySelect) {
      onLibrarySelect(selectedLibraryImage.file_url, selection);
    }

    // Reset state
    setSelectedTool(null);
    setNote("");
    setLogoPosition("front-center");
    setSelectedLibraryImage(null);
    setImageSource("upload");
    onClose();
  };

  const handleCancel = () => {
    setSelectedTool(null);
    setNote("");
    setLogoPosition("front-center");
    setSelectedLibraryImage(null);
    setImageSource("upload");
    handleFileRemove();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="overflow-y-auto p-4 sm:p-6"
        style={{
          maxWidth:
            window.innerWidth >= 1024
              ? "50vw"
              : window.innerWidth >= 640
                ? "480px"
                : "100vw",
          maxHeight: window.innerWidth >= 640 ? "70vh" : "100vh",
          width:
            window.innerWidth >= 1024
              ? "50vw"
              : window.innerWidth >= 640
                ? "480px"
                : "100vw",
          height: window.innerWidth >= 640 ? "auto" : "100vh",
          left: window.innerWidth >= 640 ? "50%" : "0",
          top: window.innerWidth >= 640 ? "50%" : "0",
          transform:
            window.innerWidth >= 640 ? "translate(-50%, -50%)" : "none",
          position: "fixed" as any,
        }}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg">Select Image Tool</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Choose the type of image you want to upload
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Tool Selection */}
          <div className="space-y-2">
            <div className="grid gap-2">
              {TOOL_OPTIONS.map((tool) => {
                const Icon = tool.icon as React.ComponentType<{
                  className?: string;
                }>;
                const isSelected = selectedTool === tool.type;

                return (
                  <button
                    key={tool.type}
                    onClick={() => setSelectedTool(tool.type)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full",
                      "hover:shadow-sm hover:border-gray-300",
                      isSelected
                        ? `${tool.bgColor} ${tool.borderColor} shadow-sm`
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center",
                        isSelected ? "bg-white shadow-sm" : "bg-gray-50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isSelected ? tool.iconColor : "text-gray-400"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium mb-0.5",
                          isSelected ? "text-gray-900" : "text-gray-700"
                        )}
                      >
                        {tool.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tool.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo Position Selector - Only for Logo */}
          {selectedTool === "logo" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Logo Position
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {LOGO_POSITIONS.map((position) => (
                  <button
                    key={position.value}
                    type="button"
                    onClick={() => setLogoPosition(position.value)}
                    className={cn(
                      "px-3 py-2 text-xs rounded-lg border transition-all text-left",
                      logoPosition === position.value
                        ? "bg-gray-50 border-gray-300 font-medium"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {position.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Note */}
          {selectedTool && (
            <div className="space-y-1.5">
              <Label
                htmlFor="note"
                className="text-xs font-medium text-gray-700"
              >
                Additional Notes{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="note"
                placeholder="Add any specific instructions about how to use this image..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="resize-none border-gray-200 focus:border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          {/* Image Source Selection - Show after tool is selected */}
          {selectedTool && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-medium text-gray-700">
                Image Source
              </Label>
              <div className="flex rounded-lg border p-0.5 bg-gray-50">
                <button
                  onClick={() => setImageSource("upload")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                    imageSource === "upload"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload New
                </button>
                <button
                  onClick={() => setImageSource("library")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                    imageSource === "library"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Media Library
                </button>
              </div>

              {/* Upload New - Drag and Drop Area */}
              {imageSource === "upload" && (
                <ImageDropzone
                  value={uploadedFile}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  previewAspect="video"
                />
              )}

              {/* Library Image Picker */}
              {imageSource === "library" && (
                <div className="space-y-2">
                  {isLoadingLibrary ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : libraryImages.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      No images in your library yet.
                      <br />
                      <span className="text-gray-400">Upload images from the Media Uploads button in the header.</span>
                    </div>
                  ) : (
                    <ScrollArea className="h-[140px]">
                      <div className="grid grid-cols-4 gap-2 pr-2">
                        {libraryImages.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedLibraryImage(img)}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden border transition-all",
                              selectedLibraryImage?.id === img.id
                                ? "border-gray-900 ring-2 ring-gray-300"
                                : "border-gray-200 hover:border-gray-400"
                            )}
                          >
                            <Image
                              src={img.file_url}
                              alt={img.file_name}
                              fill
                              className="object-contain bg-gray-50"
                            />
                            {selectedLibraryImage?.id === img.id && (
                              <div className="absolute top-1 right-1 bg-gray-900 rounded-full p-0.5">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-lg h-9 text-sm"
          >
            Cancel
          </Button>
          {imageSource === "upload" ? (
            <Button
              onClick={handleConfirmUpload}
              disabled={!selectedTool || !uploadedFile}
              className="rounded-lg gap-2 h-9 text-sm"
            >
              <Check className="h-3.5 w-3.5" />
              Use Image
            </Button>
          ) : (
            <Button
              onClick={handleLibraryImageSelect}
              disabled={!selectedTool || !selectedLibraryImage}
              className="rounded-lg gap-2 h-9 text-sm"
            >
              <Check className="h-3.5 w-3.5" />
              Use Selected
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper function to enhance prompt based on tool type
 */
export function enhancePromptWithTool(
  originalPrompt: string,
  toolSelection: ImageToolSelection
): string {
  const toolOption = TOOL_OPTIONS.find(
    (t) => t.type === toolSelection.toolType
  );
  if (!toolOption) return originalPrompt;

  let enhancedPrompt = "";

  // Build tool-specific prompt
  switch (toolSelection.toolType) {
    case "logo":
      // Build powerful logo placement prompt
      const parts: string[] = [];

      // Strong base instruction
      parts.push("🎯 LOGO PLACEMENT MODE ACTIVATED");
      parts.push(
        "CRITICAL INSTRUCTIONS: The attached image contains a brand logo/graphic that MUST be extracted and precisely applied to the product design"
      );
      parts.push("REQUIREMENTS:");
      parts.push(
        "1. Extract ONLY the logo/graphic from the uploaded image (ignore any background)"
      );
      parts.push(
        "2. Preserve the logo's original colors, proportions, and design integrity exactly as shown"
      );
      parts.push(
        "3. Apply the logo cleanly onto the product with proper contrast and visibility"
      );
      parts.push(
        "4. Ensure the logo appears professional with appropriate sizing for the product"
      );
      parts.push(
        "5. If the logo has transparency or needs background removal, handle it intelligently"
      );

      // Add position with strong emphasis and detailed instructions
      if (
        toolSelection.logoPosition &&
        toolSelection.logoPosition !== "custom"
      ) {
        const positionText = LOGO_POSITIONS.find(
          (p) => p.value === toolSelection.logoPosition
        )?.label;
        if (positionText) {
          // Build position-specific detailed instructions
          let positionDetails = "";
          switch (toolSelection.logoPosition) {
            case "front-left":
              positionDetails =
                "Place the logo on the FRONT of the product, on the LEFT side (left chest area for apparel). This is typically the left chest pocket area.";
              break;
            case "front-center":
              positionDetails =
                "Place the logo on the FRONT of the product, CENTERED horizontally in the middle of the chest area.";
              break;
            case "front-right":
              positionDetails =
                "Place the logo on the FRONT of the product, on the RIGHT side (right chest area for apparel). This is typically the right chest pocket area.";
              break;
            case "back-left":
              positionDetails =
                "Place the logo on the BACK of the product, positioned on the LEFT side (viewer's left when looking at the back). Upper back left area, between the left shoulder and spine.";
              break;
            case "back-center":
              positionDetails =
                "Place the logo on the BACK of the product, CENTERED horizontally between the shoulder blades in the upper-middle back area.";
              break;
            case "back-right":
              positionDetails =
                "Place the logo on the BACK of the product, positioned on the RIGHT side (viewer's right when looking at the back). Upper back right area, between the right shoulder and spine.";
              break;
            case "side-left":
              positionDetails =
                "Place the logo on the LEFT SIDE/SLEEVE of the product (left sleeve for apparel, left side panel for other products).";
              break;
            case "side-right":
              positionDetails =
                "Place the logo on the RIGHT SIDE/SLEEVE of the product (right sleeve for apparel, right side panel for other products).";
              break;
            case "top":
              positionDetails =
                "Place the logo at the TOP area of the product (neckline area for apparel, top edge for other products).";
              break;
            case "bottom":
              positionDetails =
                "Place the logo at the BOTTOM area of the product (hem area for apparel, bottom edge for other products).";
              break;
            default:
              positionDetails = `Position the logo at: ${positionText}`;
          }

          parts.push(
            `📍 LOGO PLACEMENT REQUIREMENT - ${positionText.toUpperCase()}`
          );
          parts.push(`EXACT POSITIONING: ${positionDetails}`);
          parts.push(
            `CRITICAL: The logo MUST appear at this specific location. Do NOT place it in the center or any other position unless specifically instructed above.`
          );
        }
      }

      // Add notes if provided
      if (toolSelection.note?.trim()) {
        parts.push(`⚠️ SPECIAL INSTRUCTIONS: ${toolSelection.note.trim()}`);
      }

      // Add original prompt as the main design context
      if (originalPrompt.trim()) {
        parts.push(`🎨 DESIGN CONTEXT: ${originalPrompt.trim()}`);
      }

      parts.push(
        "DELIVERABLE: Product mockup with the logo professionally applied maintaining brand integrity and visual appeal"
      );

      enhancedPrompt = parts.join("\n") + "\n";
      break;

    case "sketch":
      // Build powerful sketch recreation prompt
      const sketchParts: string[] = [];

      sketchParts.push("✏️ SKETCH-TO-DESIGN MODE ACTIVATED");
      sketchParts.push(
        "CRITICAL INSTRUCTIONS: The attached image is a hand-drawn sketch/concept art that needs to be professionally recreated and applied to the product"
      );
      sketchParts.push("REQUIREMENTS:");
      sketchParts.push(
        "1. Analyze the sketch carefully to understand the intended design, composition, and key elements"
      );
      sketchParts.push(
        "2. Recreate this sketch as a polished, professional, production-ready design"
      );
      sketchParts.push(
        "3. Maintain the core concept, composition, and artistic intent from the sketch"
      );
      sketchParts.push(
        "4. Enhance the design quality while preserving the original creative vision"
      );
      sketchParts.push(
        "5. Apply the finalized design professionally onto the product"
      );
      sketchParts.push(
        "6. Ensure all elements are clear, well-defined, and print-ready"
      );
      sketchParts.push(
        "7. If the sketch shows specific placement on the product, honor that positioning"
      );

      // Add notes if provided
      if (toolSelection.note?.trim()) {
        sketchParts.push(
          `⚠️ SPECIAL INSTRUCTIONS: ${toolSelection.note.trim()}`
        );
      }

      // Add original prompt
      if (originalPrompt.trim()) {
        sketchParts.push(`🎨 DESIGN CONTEXT: ${originalPrompt.trim()}`);
      }

      sketchParts.push(
        "DELIVERABLE: Product mockup with the sketch transformed into a professional, refined design that honors the original concept"
      );

      enhancedPrompt = sketchParts.join("\n") + "\n";
      break;

    case "reference":
      // Build powerful reference-based prompt
      const refParts: string[] = [];

      refParts.push("🖼️ REFERENCE-INSPIRED DESIGN MODE ACTIVATED");
      refParts.push(
        "CRITICAL INSTRUCTIONS: The attached image is a REFERENCE/INSPIRATION image - DO NOT copy or directly apply this image to the product"
      );
      refParts.push("REQUIREMENTS:");
      refParts.push(
        "1. Analyze the reference image for its style, aesthetic, color palette, mood, and design approach"
      );
      refParts.push(
        "2. Extract the key visual themes, artistic direction, and design principles"
      );
      refParts.push(
        "3. Use these insights to CREATE AN ORIGINAL DESIGN inspired by the reference"
      );
      refParts.push(
        "4. Apply the inspired aesthetic to the product design in a creative, unique way"
      );
      refParts.push(
        "5. DO NOT directly replicate or copy the reference image - use it only as stylistic guidance"
      );
      refParts.push(
        "6. Ensure the final design has the same 'feel' and 'vibe' while being completely original"
      );

      // Add notes if provided
      if (toolSelection.note?.trim()) {
        refParts.push(`⚠️ SPECIAL INSTRUCTIONS: ${toolSelection.note.trim()}`);
      }

      // Add original prompt
      if (originalPrompt.trim()) {
        refParts.push(`🎨 DESIGN CONTEXT: ${originalPrompt.trim()}`);
      }

      refParts.push(
        "DELIVERABLE: Product mockup with an original design that captures the essence, style, and aesthetic of the reference image"
      );

      enhancedPrompt = refParts.join("\n") + "\n";
      break;

    case "model":
      // Build powerful virtual try-on prompt
      const modelParts: string[] = [];

      modelParts.push("👤 VIRTUAL TRY-ON MODE ACTIVATED");
      modelParts.push(
        "CRITICAL INSTRUCTIONS: The attached image shows a PERSON/MODEL. Your task is to show the EXISTING PRODUCT being WORN by this person."
      );
      modelParts.push("REQUIREMENTS:");
      modelParts.push(
        "1. DO NOT create a new product design - use the EXACT product that already exists in this conversation"
      );
      modelParts.push(
        "2. The current product design (from the reference/previous view) should be realistically placed ON the model/person"
      );
      modelParts.push(
        "3. Maintain the EXACT product design, colors, materials, patterns, logos, and all visual details"
      );
      modelParts.push(
        "4. Make the virtual try-on look natural and realistic - the product should fit the person's body naturally"
      );
      modelParts.push(
        "5. Adjust the product's perspective to match the model's pose and body position"
      );
      modelParts.push(
        "6. Ensure proper lighting and shadows for a realistic composite"
      );
      modelParts.push(
        "7. The person should be clearly visible wearing the product"
      );
      modelParts.push(
        "8. This is about showing the SAME product on a different person, NOT designing a new product"
      );
      modelParts.push(
        "9. If the product has any branding, logos, or specific design elements, they MUST appear exactly as in the original"
      );

      // Add notes if provided
      if (toolSelection.note?.trim()) {
        modelParts.push(`⚠️ SPECIAL INSTRUCTIONS: ${toolSelection.note.trim()}`);
      }

      // Add original prompt
      if (originalPrompt.trim()) {
        modelParts.push(`🎨 CONTEXT: ${originalPrompt.trim()}`);
      }

      modelParts.push(
        "DELIVERABLE: A realistic image showing the person/model WEARING the exact current product design - preserving every detail of the product"
      );

      enhancedPrompt = modelParts.join("\n") + "\n";
      break;

    default:
      enhancedPrompt = originalPrompt;
  }

  return enhancedPrompt;
}

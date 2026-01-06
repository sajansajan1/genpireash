"use client";

/**
 * ProductMetadataEditor - Inline editable metadata fields for product page
 * Includes: Product Name, Description, Status, SKU, Reference Number, Target Price
 * All fields are editable inline with autosave functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Pencil,
  Check,
  X,
  Loader2,
  Tag,
  Hash,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  updateProductMetadata,
  ProductStatus,
} from "@/app/actions/product-metadata";
import type { ProductMetadataFields } from "@/lib/zustand/product/productPageStore";
import { formatDate } from "@/app/product/shared/utils";

// Status options with colors - Genpire warm beige palette
const STATUS_OPTIONS: { value: ProductStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "bg-secondary text-secondary-foreground" },
  { value: "in_review", label: "In Review", color: "bg-amber-100 text-amber-900" },
  { value: "approved", label: "Approved", color: "bg-emerald-50 text-emerald-800" },
  { value: "in_production", label: "In Production", color: "bg-accent/30 text-accent-foreground" },
  { value: "completed", label: "Completed", color: "bg-primary text-primary-foreground" },
  { value: "archived", label: "Archived", color: "bg-muted text-muted-foreground" },
];

// Extended metadata type that includes productName and description for local updates
interface ExtendedMetadata extends Partial<ProductMetadataFields> {
  productName?: string;
  description?: string;
}

interface ProductMetadataEditorProps {
  productId: string;
  productName: string;
  description?: string;
  category?: string;
  createdAt?: string;
  sku?: string | null;
  referenceNumber?: string | null;
  targetConsumerPriceUsd?: number | null;
  status?: ProductStatus;
  onMetadataUpdate?: (metadata: ExtendedMetadata) => void;
}

interface EditableFieldProps {
  value: string;
  placeholder: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  prefix?: string;
  type?: "text" | "number";
  multiline?: boolean;
  wideInput?: boolean;
}

function EditableField({
  value,
  placeholder,
  onSave,
  className,
  icon,
  label,
  prefix,
  type = "text",
  multiline = false,
  wideInput = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", (multiline || wideInput) && "w-full")}>
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {prefix && <span className="text-muted-foreground text-sm">{prefix}</span>}
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            "h-8 px-2",
            (multiline || wideInput) ? "flex-1 min-w-[300px] max-w-[600px]" : "w-auto min-w-[80px]",
            className
          )}
          placeholder={placeholder}
          disabled={isSaving}
        />
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSave}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCancel}
            >
              <X className="h-3.5 w-3.5 text-red-600" />
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              "text-sm hover:bg-muted/50 rounded px-1.5 py-0.5 transition-colors group text-left",
              multiline ? "block w-full" : "flex items-center gap-1",
              !value && "text-muted-foreground italic",
              className
            )}
          >
            {icon && <span className="text-muted-foreground">{icon}</span>}
            {prefix && <span className="text-muted-foreground">{prefix}</span>}
            <span className={cn(multiline && "line-clamp-2")}>{value || placeholder}</span>
            <Pencil className={cn(
              "h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity",
              multiline ? "inline-block ml-1" : ""
            )} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to edit {label || "field"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ProductMetadataEditor({
  productId,
  productName,
  description,
  category,
  createdAt,
  sku,
  referenceNumber,
  targetConsumerPriceUsd,
  status = "draft",
  onMetadataUpdate,
}: ProductMetadataEditorProps) {
  const [currentStatus, setCurrentStatus] = useState<ProductStatus>(status);
  const [isStatusSaving, setIsStatusSaving] = useState(false);

  const displayDate = createdAt ? formatDate(createdAt) : "Recently";
  const statusOption = STATUS_OPTIONS.find((s) => s.value === currentStatus);

  const handleFieldUpdate = useCallback(
    async (field: keyof ExtendedMetadata, value: any) => {
      const result = await updateProductMetadata({
        productId,
        metadata: { [field]: value },
      });

      if (result.success) {
        toast({
          title: "Updated",
          description: `${String(field).replace(/([A-Z])/g, " $1").trim()} has been updated.`,
        });
        onMetadataUpdate?.({ [field]: value });
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
        throw new Error(result.error);
      }
    },
    [productId, onMetadataUpdate]
  );

  const handleStatusChange = async (newStatus: ProductStatus) => {
    setIsStatusSaving(true);
    try {
      await handleFieldUpdate("status", newStatus);
      setCurrentStatus(newStatus);
    } finally {
      setIsStatusSaving(false);
    }
  };

  return (
    <div className="bg-muted/30 border-b px-4 py-3">
      {/* Row 1: Product Name, Category Badge, and Status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Product Name - Large, editable */}
          <div className="flex items-center gap-2 flex-wrap">
            <EditableField
              value={productName}
              placeholder="Enter product name"
              onSave={(value) => handleFieldUpdate("productName", value)}
              className="text-lg font-semibold"
              label="product name"
              wideInput
            />
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
          </div>

          {/* Description - Editable */}
          <div className="mt-0.5">
            <EditableField
              value={description || ""}
              placeholder="Add a description..."
              onSave={(value) => handleFieldUpdate("description", value)}
              className="text-sm text-muted-foreground"
              label="description"
              multiline
            />
          </div>

          {/* Creation date */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {displayDate}
            </span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(value as ProductStatus)}
            disabled={isStatusSaving}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-[140px] text-xs font-medium border-0",
                statusOption?.color
              )}
            >
              {isStatusSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                >
                  <span className={cn("px-2 py-0.5 rounded", option.color)}>
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Metadata fields - SKU, Reference Number, Target Price */}
      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/50">
        {/* SKU */}
        <EditableField
          value={sku || ""}
          placeholder="Add SKU"
          onSave={(value) => handleFieldUpdate("sku", value || null)}
          icon={<Tag className="h-3.5 w-3.5" />}
          label="SKU"
        />

        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Reference Number */}
        <EditableField
          value={referenceNumber || ""}
          placeholder="Add Ref #"
          onSave={(value) => handleFieldUpdate("referenceNumber", value || null)}
          icon={<Hash className="h-3.5 w-3.5" />}
          label="reference number"
        />

        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Target Consumer Price */}
        <EditableField
          value={targetConsumerPriceUsd?.toString() || ""}
          placeholder="Add target price"
          onSave={(value) =>
            handleFieldUpdate(
              "targetConsumerPriceUsd",
              value ? parseFloat(value) : null
            )
          }
          icon={<DollarSign className="h-3.5 w-3.5" />}
          prefix="USD"
          type="number"
          label="target price"
        />
      </div>
    </div>
  );
}

export default ProductMetadataEditor;

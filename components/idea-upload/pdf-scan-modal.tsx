"use client";

import { useState, useCallback, useEffect } from "react";
import {
    X,
    FileText,
    Palette,
    Ruler,
    Package,
    Image as ImageIcon,
    Check,
    Edit2,
    Sparkles,
    AlertCircle,
    ChevronRight,
    Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PDFExtractedData } from "@/lib/services/pdf-extraction-service";

interface PDFScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    extractedData: PDFExtractedData | null;
    isLoading?: boolean;
    onUseForProduct: (data: PDFExtractedData) => void;
    onGenerateProduct: (data: PDFExtractedData) => void;
}

export function PDFScanModal({
    isOpen,
    onClose,
    extractedData,
    isLoading = false,
    onUseForProduct,
    onGenerateProduct,
}: PDFScanModalProps) {
    const [editedData, setEditedData] = useState<PDFExtractedData | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedImageIndices, setSelectedImageIndices] = useState<Set<number>>(new Set());

    // Initialize edited data and selected images when extracted data changes
    useEffect(() => {
        if (extractedData) {
            setEditedData({ ...extractedData });
            // By default select all images
            if (extractedData.designImages) {
                const allIndices = new Set(extractedData.designImages.map((_, i) => i));
                setSelectedImageIndices(allIndices);
            }
        }
    }, [extractedData]);

    const data = editedData || extractedData;

    const handleFieldChange = useCallback((field: keyof PDFExtractedData, value: any) => {
        setEditedData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });
    }, []);

    const toggleImageSelection = (index: number) => {
        const newSelected = new Set(selectedImageIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedImageIndices(newSelected);
    };

    const getFilteredData = useCallback(() => {
        if (!data) return null;

        // Filter images based on selection
        const filteredImages = data.designImages.filter((_, index) => selectedImageIndices.has(index));

        return {
            ...data,
            designImages: filteredImages
        };
    }, [data, selectedImageIndices]);

    const handleUseForProduct = useCallback(() => {
        const filteredData = getFilteredData();
        if (filteredData) {
            onUseForProduct(filteredData);
            onClose();
        }
    }, [getFilteredData, onUseForProduct, onClose]);

    const handleGenerateProduct = useCallback(() => {
        const filteredData = getFilteredData();
        if (filteredData) {
            onGenerateProduct(filteredData);
            onClose();
        }
    }, [getFilteredData, onGenerateProduct, onClose]);

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-lg font-semibold text-stone-900">PDF Scan Results</AlertDialogTitle>
                            <p className="text-sm text-stone-500">
                                {isLoading ? "Extracting data..." : `${data?.pageCount || 0} page(s) analyzed`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {data && (
                            <Badge
                                variant="secondary"
                                className={`${(data.extractionConfidence || 0) > 0.7
                                    ? "bg-green-100 text-green-700"
                                    : (data.extractionConfidence || 0) > 0.4
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {Math.round((data.extractionConfidence || 0) * 100)}% Confidence
                            </Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center p-8 min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin" />
                                <Sparkles className="h-6 w-6 text-stone-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-stone-900">Analyzing PDF with AI</p>
                                <p className="text-sm text-stone-500">Extracting product specifications...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {!isLoading && data && (
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="px-4 sm:px-6 pt-4 border-b border-stone-100 pb-0">
                                <TabsList className="grid grid-cols-5 w-full">
                                    <TabsTrigger value="overview" className="text-xs sm:text-sm">
                                        <Package className="h-4 w-4 mr-1.5 hidden sm:inline" />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="materials" className="text-xs sm:text-sm">
                                        <Layers className="h-4 w-4 mr-1.5 hidden sm:inline" />
                                        Materials
                                    </TabsTrigger>
                                    <TabsTrigger value="colors" className="text-xs sm:text-sm">
                                        <Palette className="h-4 w-4 mr-1.5 hidden sm:inline" />
                                        Colors
                                    </TabsTrigger>
                                    <TabsTrigger value="sizing" className="text-xs sm:text-sm">
                                        <Ruler className="h-4 w-4 mr-1.5 hidden sm:inline" />
                                        Sizing
                                    </TabsTrigger>
                                    <TabsTrigger value="images" className="text-xs sm:text-sm">
                                        <ImageIcon className="h-4 w-4 mr-1.5 hidden sm:inline" />
                                        Images
                                        {selectedImageIndices.size > 0 && (
                                            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                                                {selectedImageIndices.size}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0">
                                <div className="p-4 sm:p-6">
                                    {/* Overview Tab */}
                                    <TabsContent value="overview" className="mt-0 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Product Name</Label>
                                                <Input
                                                    value={data.productName}
                                                    onChange={(e) => handleFieldChange("productName", e.target.value)}
                                                    placeholder="Enter product name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reference Number</Label>
                                                <Input
                                                    value={data.referenceNumber}
                                                    onChange={(e) => handleFieldChange("referenceNumber", e.target.value)}
                                                    placeholder="SKU or style number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Product Type</Label>
                                                <Input
                                                    value={data.productType}
                                                    onChange={(e) => handleFieldChange("productType", e.target.value)}
                                                    placeholder="e.g., T-Shirt, Hoodie"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Input
                                                    value={data.category}
                                                    onChange={(e) => handleFieldChange("category", e.target.value)}
                                                    placeholder="e.g., Apparel, Accessories"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={data.description}
                                                onChange={(e) => handleFieldChange("description", e.target.value)}
                                                placeholder="Product description"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                                            <Card className="bg-stone-50">
                                                <CardContent className="p-3 text-center">
                                                    <div className="text-2xl font-bold text-stone-900">{data.materials?.length || 0}</div>
                                                    <div className="text-xs text-stone-500">Materials</div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-stone-50">
                                                <CardContent className="p-3 text-center">
                                                    <div className="text-2xl font-bold text-stone-900">{data.colorPalette?.length || 0}</div>
                                                    <div className="text-xs text-stone-500">Colors</div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-stone-50">
                                                <CardContent className="p-3 text-center">
                                                    <div className="text-2xl font-bold text-stone-900">{data.availableSizes?.length || 0}</div>
                                                    <div className="text-xs text-stone-500">Sizes</div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-stone-50">
                                                <CardContent className="p-3 text-center">
                                                    <div className="text-2xl font-bold text-stone-900">{data.designImages?.length || 0}</div>
                                                    <div className="text-xs text-stone-500">Images</div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Materials Tab */}
                                    <TabsContent value="materials" className="mt-0 space-y-4">
                                        {data.materials && data.materials.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.materials.map((material, index) => (
                                                    <Card key={index}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="font-medium text-stone-900">{material.name}</div>
                                                                    {material.percentage && (
                                                                        <Badge variant="secondary" className="mt-1">
                                                                            {material.percentage}
                                                                        </Badge>
                                                                    )}
                                                                    {material.placement && (
                                                                        <p className="text-sm text-stone-500 mt-1">{material.placement}</p>
                                                                    )}
                                                                    {material.description && (
                                                                        <p className="text-sm text-stone-600 mt-2">{material.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-stone-500">
                                                <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                <p>No materials found in this PDF</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Colors Tab */}
                                    <TabsContent value="colors" className="mt-0 space-y-4">
                                        {data.colorPalette && data.colorPalette.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {data.colorPalette.map((color, index) => (
                                                    <Card key={index} className="overflow-hidden">
                                                        <div
                                                            className="h-16 w-full"
                                                            style={{ backgroundColor: color.hex || "#e5e5e5" }}
                                                        />
                                                        <CardContent className="p-3">
                                                            <div className="font-medium text-sm text-stone-900">{color.name}</div>
                                                            {color.hex && (
                                                                <div className="text-xs text-stone-500 font-mono">{color.hex}</div>
                                                            )}
                                                            {color.pantone && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    {color.pantone}
                                                                </Badge>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-stone-500">
                                                <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                <p>No colors found in this PDF</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Sizing Tab */}
                                    <TabsContent value="sizing" className="mt-0 space-y-4">
                                        {data.availableSizes && data.availableSizes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {data.availableSizes.map((size) => (
                                                    <Badge key={size} variant="secondary" className="text-sm">
                                                        {size}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {data.sizingGrading && data.sizingGrading.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-stone-200">
                                                            <th className="text-left py-2 px-3 font-medium text-stone-600">Size</th>
                                                            {Object.keys(data.sizingGrading[0]?.measurements || {}).map((key) => (
                                                                <th key={key} className="text-left py-2 px-3 font-medium text-stone-600 capitalize">
                                                                    {key.replace(/_/g, " ")}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.sizingGrading.map((row, index) => (
                                                            <tr key={index} className="border-b border-stone-100">
                                                                <td className="py-2 px-3 font-medium text-stone-900">{row.size}</td>
                                                                {Object.values(row.measurements).map((value, i) => (
                                                                    <td key={i} className="py-2 px-3 text-stone-600">
                                                                        {value as React.ReactNode}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-stone-500">
                                                <Ruler className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                <p>No sizing information found in this PDF</p>
                                            </div>
                                        )}

                                        {/* Dimensions */}
                                        {data.dimensions && Object.keys(data.dimensions).length > 0 && (
                                            <Card className="mt-4">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Dimensions</CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {Object.entries(data.dimensions).map(([key, value]) => (
                                                        <div key={key}>
                                                            <div className="text-xs text-stone-500 capitalize">{key.replace(/_/g, " ")}</div>
                                                            <div className="font-medium text-stone-900">{value as React.ReactNode}</div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    {/* Images Tab */}
                                    <TabsContent value="images" className="mt-0">
                                        <div className="mb-4">
                                            <p className="text-sm text-stone-500">
                                                Select the images you want to import for your product.
                                            </p>
                                        </div>
                                        {data.designImages && data.designImages.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {data.designImages.map((image, index) => {
                                                    const isSelected = selectedImageIndices.has(index);
                                                    return (
                                                        <Card
                                                            key={index}
                                                            className={`overflow-hidden cursor-pointer transition-all ${isSelected
                                                                    ? "ring-2 ring-stone-900 border-stone-900"
                                                                    : "hover:border-stone-400"
                                                                }`}
                                                            onClick={() => toggleImageSelection(index)}
                                                        >
                                                            <div className="aspect-square bg-stone-100 relative group">
                                                                <img
                                                                    src={image.imageData}
                                                                    alt={`${image.view} view`}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                                <div className="absolute top-2 left-2">
                                                                    <div className={`
                                                                        h-6 w-6 rounded-md border shadow-sm flex items-center justify-center transition-colors
                                                                        ${isSelected
                                                                            ? "bg-stone-900 border-stone-900 text-white"
                                                                            : "bg-white border-stone-300 text-transparent hover:border-stone-400"}
                                                                    `}>
                                                                        <Check className="h-4 w-4" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <CardContent className="p-3">
                                                                <Badge variant="secondary" className="capitalize">
                                                                    {image.view} View
                                                                </Badge>
                                                                {image.description && (
                                                                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{image.description}</p>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-stone-500">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                <p>No product images found in this PDF</p>
                                                <p className="text-xs mt-1">Upload images separately or extract from the PDF viewer</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t border-stone-200 bg-stone-50">
                                <div className="text-sm text-stone-500 hidden sm:block">
                                    {data.materials?.length > 0 || data.colorPalette?.length > 0 ? (
                                        <span className="flex items-center gap-1">
                                            <Check className="h-4 w-4 text-green-600" />
                                            Data ready to use
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            Limited data extracted
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                    <Button variant="outline" onClick={handleUseForProduct}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Use for Product
                                    </Button>
                                    <Button onClick={handleGenerateProduct} className="bg-stone-900 hover:bg-stone-800">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Product
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </Tabs>
                    </div>
                )}

                {/* No Data State */}
                {!isLoading && !data && (
                    <div className="flex-1 flex items-center justify-center p-8 min-h-[300px]">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-stone-400 mx-auto mb-3" />
                            <p className="font-medium text-stone-900">No data extracted</p>
                            <p className="text-sm text-stone-500">Please try uploading a different PDF file</p>
                            <Button variant="outline" onClick={onClose} className="mt-4">
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default PDFScanModal;

"use client";
interface ColorSection {
  styleNotes: string;
  trendAlignment: string;
  primaryColors: string[];
  accentColors: string[];
}

interface FormData {
  productName: string;
  colors: ColorSection;
}
const initialColors: ColorSection = {
  styleNotes: "",
  trendAlignment: "",
  primaryColors: [],
  accentColors: [],
};
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  Download,
  Edit,
  FileText,
  Share,
  X,
  Edit2,
  Check,
  NotepadText,
  ArrowRight,
  DownloadCloudIcon,
  RefreshCw,
  MoreVertical,
  ArrowDown,
  MoveDownIcon,
  ChevronDown,
  Shirt,
  Footprints,
  ShoppingBag,
  Armchair,
  Baby,
  Gem,
  PawPrint,
  Home,
  Package,
  Palette,
  FolderOpen,
  Paperclip,
  Box,
  Eye,
  BookImage,
  Images,
  File,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Margin, usePDF } from "react-to-pdf";
import { useGetTechPackStore } from "@/lib/zustand/techpacks/getTechPack";
import { generatePdfBase64, generatePdffromTechpack } from "@/components/pdf-generator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ComponentMeasurementGrid } from "@/components/ui/component-measurement-table";
import { useUserStore } from "@/lib/zustand/useStore";
import { toast } from "@/hooks/use-toast";
import { DeductCredits, RefundCredits } from "@/lib/supabase/payments";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateTechPackStore } from "@/lib/zustand/techpacks/updateTechPack";
import { generateExcelFromData } from "@/components/excel-generator";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/utils/formatUsd";
import { useCreateNotificationStore } from "@/lib/zustand/notifications/createNotification";
import { useGetNotificationsStore } from "@/lib/zustand/notifications/getNotification";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import Link from "next/link";
import { generateTechPackForProduct } from "@/app/actions/create-product-entry";
import { getUserProjectIdea } from "@/lib/supabase/productIdea";
import dynamic from "next/dynamic";
import { generateProductFilesfromTechpack } from "@/components/productFilesGenerator";
// Dynamically import 3D components (client-side only)
const Model3DViewer = dynamic(
  () =>
    import("@/components/3d-viewer/Model3DViewer").then((mod) => ({
      default: mod.Model3DViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);
const ExportOptions = dynamic(
  () =>
    import("@/components/3d-viewer/ExportOptions").then((mod) => ({
      default: mod.ExportOptions,
    })),
  {
    ssr: false,
  }
);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import JSZip from "jszip";
import { getsampleByID } from "@/lib/supabase/demoProducts";

const loadingSteps = [
  { emoji: "🧠", text: "Analyzing your idea and product intent…" },
  { emoji: "🛠", text: "Designing your concept and preparing dimensions…" },
  { emoji: "🎨", text: "Rendering sample views and color options…" },
  { emoji: "📦", text: "Packing your product into a factory-ready tech pack…" },
];
export default function TechPackDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState(searchParams.get("tab") || "guidelines" || "technical");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [imageloader, setImageLoader] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [modalImage, setModalImage] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<any>>({
    productName: "",
    colors: initialColors,
  });
  const [isEditingProductName, setIsEditingProductName] = useState(false);
  const [pdfLoader, setPdfLoader] = useState<boolean>(false);
  const [pngLoader, setPngLoader] = useState<boolean>(false);
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const refetch = refresCreatorCredits;
  const [loadingPrintFiles, setLoadingPrintFiles] = useState<boolean>(false);
  const [productFileLoader, setProductFileLoader] = useState<boolean>(false);
  const [getTechPack, setGetTechPack] = useState<any>(null);

  useEffect(() => {
    const loadTechpack = async () => {
      if (id) {
        const data = await getsampleByID(id);
        console.log("data ==> ", data);
        setGetTechPack(data);
      }
    };
    loadTechpack();
  }, [id]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (getTechPack?.tech_pack) {
      setFormData({
        productName: getTechPack.tech_pack.productName || "",
        colors: getTechPack.tech_pack.colors || initialColors,
      });
    }
  }, [getTechPack]);

  if (!getTechPack) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Loading tech pack details...</span>
      </div>
    );
  }

  const excelGenerate = async () => {
    if (getTechPack?.tech_pack?.metadata) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Availabel!",
        description: "Generate Tech Pack First to download Excel sheet",
      });
      return;
    }
    try {
      const workbook = await generateExcelFromData({ tech_pack: getTechPack });

      // Convert workbook → buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Buffer → Blob
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "techpack.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel download failed:", error);
    }
  };

  const handlePdfDownload = async () => {
    if (getTechPack?.tech_pack?.metadata) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Availabel!",
        description: "Generate Tech Pack First to download pdf",
      });
      return;
    }
    try {
      setPdfLoader(true);
      await generatePdffromTechpack({ tech_pack: getTechPack });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfLoader(false);
    }
  };

  const viewOrder = ["front", "back", "bottom", "side", "illustration", "top"];
  const filteredViewOrder = viewOrder.filter((key) => {
    const img = (getTechPack.image_data as Record<string, any>)?.[key];
    return !!img?.url;
  });

  const sendPDF = async (techPack: any, options: { email?: string; phone?: string }) => {
    const { email, phone } = options;
    try {
      const pdfBase64 = await generatePdfBase64({ tech_pack: getTechPack });
      const fileName = `${techPack.tech_pack.productName}.pdf`;

      const tasks = [];

      // 2. Send email
      if (email) {
        tasks.push(
          fetch("/api/pdfSender/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              pdfBuffer: pdfBase64,
              fileName,
            }),
          })
        );
      }

      // 3. Send WhatsApp
      if (phone) {
        const tempUrl = "https://your-domain.com/temp-download-link"; // Replace with real URL logic
        tasks.push(
          fetch("/api/pdfSender/send-whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: phone,
              pdfUrl: tempUrl,
              fileName,
            }),
          })
        );
      }

      await Promise.all(tasks);

      alert("PDF sent successfully!");
    } catch (error) {
      console.error("Error sending PDF:", error);
      alert("Error sending PDF");
    }
  };

  const downloadPng = async (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Available!",
        description: "Generate a Tech Pack first to download the PNGs.",
      });
      return;
    }

    try {
      setPngLoader(true);

      const validUrls = imageUrls.filter((url) => !!url);

      if (validUrls.length === 0) {
        toast({
          variant: "destructive",
          title: "No Valid PNGs Found!",
          description: "Some images might be missing or corrupted.",
        });
        return;
      }

      if (validUrls.length === 1) {
        const url = validUrls[0];
        const response = await fetch(url);
        const blob = await response.blob();

        const fileName = url.split("/").pop() || `${getTechPack?.tech_pack?.productName || "techpack_image"}.png`;

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        toast({
          title: "PNG Downloaded!",
          description: `Downloaded PNG file.`,
          variant: "default",
        });
        return;
      }

      const zip = new JSZip();

      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i];
        const response = await fetch(url);
        const blob = await response.blob();
        const fileName = url.split("/").pop() || `image_${i + 1}.png`;
        zip.file(fileName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${getTechPack?.tech_pack?.productName || "techpack_images"}.zip`;

      const zipUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);

      toast({
        title: "PNGs Downloaded!",
        description: `Downloaded ${validUrls.length} PNG files as ZIP.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error downloading PNGs:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to download PNGs.",
      });
    } finally {
      setPngLoader(false);
    }
  };

  const handleGeneratePrintFiles = async () => {
    setLoadingPrintFiles(true);

    const res = await fetch(`/api/print-files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ techPack: getTechPack }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getTechPack?.tech_pack?.productName || "printfiles"}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
    setLoadingPrintFiles(false);
  };

  const handleProductFilesDownload = async () => {
    if (getTechPack?.tech_pack?.metadata) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Available!",
        description: "Generate Tech Pack first to download the files.",
      });
      return;
    }

    try {
      setProductFileLoader(true);

      const result = await generateProductFilesfromTechpack({
        tech_pack: getTechPack,
      });

      if (!result?.success) {
        toast({
          variant: "destructive",
          title: "Download Failed!",
          description: "Could not generate ZIP file",
        });
        return;
      }

      const { zipBlob, filename } = result;

      if (!zipBlob) {
        toast({
          variant: "destructive",
          title: "Download Failed!",
          description: "ZIP file could not be created.",
        });
        return;
      }

      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "product-files.zip";
      document.body.appendChild(link);
      link.click();

      link.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Ready",
        description: "Your product files ZIP has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating ZIP:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during ZIP generation.",
      });
    } finally {
      setProductFileLoader(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div
        className={`mb-6 flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 ${getTechPack.tech_pack?.metadata ? "lg:justify-end" : "lg:justify-between"
          }`}
      >
        {!getTechPack.tech_pack?.metadata && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Edit
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push(
                `/ai-designer?projectId=${id}&version=modular`
              )}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Product Editor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="flex flex-col space-y-2 gap-2 lg:flex-row sm:space-y-0 sm:space-x-2">
          {!getTechPack?.tech_pack?.metadata && (
            <>
              <Button variant="outline" onClick={() => handlePdfDownload()}>
                {pdfLoader ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => handleProductFilesDownload()}>
                {productFileLoader ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Product Files...
                  </>
                ) : (
                  <>
                    <File className="h-4 w-4" />
                    Product Files
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => excelGenerate()}>
                <NotepadText className="mr-2 h-4 w-4" /> Download Excel
              </Button>
            </>
          )}
          {getTechPack.tech_pack?.metadata && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Edit
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Product Editor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="mb-8">
        {isEditingProductName ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsEditingProductName(false);
            }}
          >
            <div className="flex items-center gap-2">
              <Input
                name="productName"
                value={formData.productName}
                className="text-3xl font-bold border-none p-0 h-auto bg-transparent"
                onBlur={() => {
                  setIsEditingProductName(false);
                }}
                autoFocus
              />
              <Button type="submit" size="sm" variant="ghost">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {getTechPack?.tech_pack?.productName || getTechPack?.product_name || "Name Not Available"}
            </h1>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  productName: getTechPack?.tech_pack?.productName,
                }));
                setIsEditingProductName(true);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="mt-2 flex items-center flex-wrap">
          <span className="text-gray-500">
            Created: {getTechPack.tech_pack ? new Date(getTechPack.created_at).toLocaleDateString() : "N/A"}
          </span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-gray-500">
            Last updated: {getTechPack.tech_pack ? new Date(getTechPack.updated_at).toLocaleDateString() : "N/A"}
          </span>
          {/* Status Badge - Commented out as requested */}
          {/* <span className="mx-2 text-gray-300">•</span>
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              getTechPack?.status === "Completed"
                ? "bg-green-100 text-green-800"
                : getTechPack?.status
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {getTechPack?.status || "Draft"}
          </span> */}
        </div>
      </div>

      {/* data */}

      <Tabs
        value={currentTab}
        onValueChange={(val) => {
          setCurrentTab(val);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-2  h-auto p-1 gap-1 sm:gap-0">
          <TabsTrigger
            value="guidelines"
            className="text-xs sm:text-sm px-3 py-3 sm:px-4 sm:py-3 data-[state=active]:bg-white rounded-md lg:rounded-md whitespace-nowrap"
          >
            <span className="hidden md:inline-flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Product & Manufactory Guidelines
            </span>
            <span className="hidden sm:inline-flex md:hidden items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Product Guidelines
            </span>
            <span className="sm:hidden inline-flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Guidelines
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="text-xs sm:text-sm px-3 py-3 sm:px-4 sm:py-3 data-[state=active]:bg-white rounded-md lg:rounded-md"
          >
            <span className="hidden md:inline-flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Technical Specification Files
            </span>
            <span className="hidden sm:inline-flex md:hidden items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Tech Specifications
            </span>
            <span className="sm:hidden inline-flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Tech Spec
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines" className="mt-4 sm:mt-6">
          <div
            className={`flex flex-col gap-4 sm:gap-6 lg:grid-cols-2 ${getTechPack.tech_pack?.metadata ? "filter blur-sm" : null
              }`}
          >
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Basic information about the product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-500">Product Name</h3>
                    </div>
                    <p className="font-semibold text-lg">
                      {getTechPack?.tech_pack?.productName || getTechPack?.product_name || "No Product Name provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Description</h3>
                    <p>
                      {getTechPack?.tech_pack?.productOverview ||
                        getTechPack?.product_description ||
                        "No description provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Product Notes</h3>
                    <p>{getTechPack?.tech_pack?.productionNotes || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Category & Subcategory</h3>
                    <p>{getTechPack?.tech_pack?.category_Subcategory || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Colorways */}
            <Card>
              <CardHeader>
                <CardTitle>Colorways</CardTitle>
                <CardDescription>Available color options</CardDescription>
              </CardHeader>

              <CardContent>
                {getTechPack.tech_pack?.colors ? (
                  <div className="space-y-4">
                    {/* notes */}
                    {getTechPack?.tech_pack?.colors?.styleNotes && (
                      <p className="text-sm text-gray-700 italic">{getTechPack?.tech_pack?.colors?.styleNotes}</p>
                    )}
                    {getTechPack?.tech_pack?.colors?.trendAlignment && (
                      <p className="text-sm text-gray-500">
                        Trend Alignment: {getTechPack?.tech_pack?.colors?.trendAlignment}
                      </p>
                    )}

                    {/* primary colors */}
                    <div>
                      <h4 className="font-semibold text-gray-800">Primary Colors</h4>
                      {getTechPack?.tech_pack?.colors?.primaryColors?.length ? (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {getTechPack?.tech_pack?.colors?.primaryColors?.map(
                            (color: { name: string; hex: string }, idx: number) => (
                              <div key={idx} className="flex items-center">
                                <div
                                  className="h-6 w-6 rounded-full mr-2 border border-gray-200"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span>
                                  {color.name} ({color.hex})
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No primary colors specified</p>
                      )}
                    </div>

                    {/* accent colors */}
                    <div>
                      <h4 className="font-semibold text-gray-800">Accent Colors</h4>
                      {getTechPack.tech_pack.colors.accentColors?.length ? (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {getTechPack.tech_pack.colors.accentColors.map(
                            (color: { name: string; hex: string }, idx: number) => (
                              <div key={idx} className="flex items-center">
                                <div
                                  className="h-6 w-6 rounded-full mr-2 border border-gray-200"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span>
                                  {color.name} ({color.hex})
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No accent colors specified</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No colorways specified</p>
                )}
              </CardContent>
            </Card>

            {/* second material */}
            {getTechPack.tech_pack?.materials?.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Bill of Materials (BOM)</CardTitle>
                  <CardDescription>Materials used in this product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Component Name</th>
                          <th className="py-2 text-left">Material</th>
                          <th className="py-2 text-left">Specification</th>
                          <th className="py-2 text-left">Qty per unit</th>
                          <th className="py-2 text-left">Unit Cost</th>
                          <th className="py-2 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTechPack.tech_pack.materials.map((item: any, key: any) => (
                          <tr key={key}>
                            <td className="py-2">{item.component}</td>
                            <td className="py-2">{item.material}</td>
                            <td className="py-2">{item.specification}</td>
                            <td className="py-2">{item.quantityPerUnit}</td>
                            <td className="py-2">{item.unitCost}</td>
                            <td className="py-2">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hardware */}

            {getTechPack.tech_pack.hardwareComponents?.hardware?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hardware</CardTitle>
                  <CardDescription>Hardware components and finishes</CardDescription>
                </CardHeader>
                <CardContent>
                  {getTechPack.tech_pack.hardwareComponents &&
                    getTechPack.tech_pack.hardwareComponents.hardware?.length > 0 ? (
                    <div className="space-y-2">
                      {getTechPack.tech_pack.hardwareComponents.description && (
                        <p className="text-sm text-gray-700 italic mb-2">
                          {getTechPack.tech_pack.hardwareComponents.description}
                        </p>
                      )}
                      <ul className="list-inside list-disc space-y-1">
                        {getTechPack.tech_pack.hardwareComponents.hardware.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">No hardware specified</p>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Care Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Care Instruction</CardTitle>
                <CardDescription>Care Instruction of the product</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Display Sizes */}
                {getTechPack.tech_pack.careInstructions ? (
                  <p className="whitespace-pre-line">{getTechPack.tech_pack.careInstructions}</p>
                ) : (
                  <p className="text-gray-500">No Care Instructions information provided</p>
                )}
              </CardContent>
            </Card>
            {/* Construction Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Construction Details</CardTitle>
                <CardDescription>How the product is constructed</CardDescription>
              </CardHeader>
              <CardContent>
                {getTechPack.tech_pack.constructionDetails && getTechPack.tech_pack.constructionDetails.description ? (
                  <div className="space-y-3">
                    {getTechPack.tech_pack.constructionDetails.description && (
                      <p className="whitespace-pre-line text-sm text-gray-700">
                        {getTechPack.tech_pack.constructionDetails.description}
                      </p>
                    )}
                    {getTechPack.tech_pack.constructionDetails.constructionFeatures?.length > 0 && (
                      <ul className="list-inside list-disc space-y-1">
                        {getTechPack.tech_pack.constructionDetails.constructionFeatures.map(
                          (item: any, index: number) => (
                            <li key={index}>
                              <strong>{item?.featureName}</strong>: {item?.details}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No construction details provided</p>
                )}
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Measurements & Tolerance</CardTitle>
                <CardDescription>Product measurements and specifications</CardDescription>
              </CardHeader>
              <CardContent>
                {getTechPack.tech_pack.dimensions && Object.keys(getTechPack.tech_pack.dimensions).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Measurement</th>
                          <th className="py-2 text-left">Value</th>
                          <th className="py-2 text-left">Unit</th>
                          <th className="py-2 text-left">Tolerance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(getTechPack.tech_pack.dimensions).map(
                          ([measurementName, measurementData]: [string, any]) => {
                            const value = measurementData?.value || "";
                            const tolerance = measurementData?.tolerance || "";

                            const valueParts = value?.toString().match(/^([\d.]+)\s*(.*)$/); // Extract number + unit
                            const numericValue = valueParts?.[1] || value;
                            const unit = valueParts?.[2] || "";

                            return (
                              <tr key={measurementName}>
                                <td className="py-2 capitalize">
                                  {measurementName === "width" ? "Breadth" : measurementName}
                                </td>
                                <td className="py-2">{numericValue || "N/A"}</td>
                                <td className="py-2">{unit || "N/A"}</td>
                                <td className="py-2">{tolerance || "N/A"}</td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No measurements provided</p>
                )}
              </CardContent>
            </Card>

            {getTechPack?.tech_pack?.labels && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Labelling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 p-4 border rounded bg-gray-50">
                    {/* Large Centered Logo */}
                    {getTechPack.tech_pack.labels.logo &&
                      getTechPack.tech_pack.labels.logo !== "Not available" &&
                      getTechPack.tech_pack.labels.logo !== "N/A" &&
                      getTechPack.tech_pack.labels.logo !== "Logo to be supplied." &&
                      getTechPack.tech_pack.labels.logo !== "Logo to be supplied" && (
                        <div className="flex justify-center mb-6">
                          <img
                            src={getTechPack.tech_pack.labels.logo}
                            alt="Label Logo"
                            className="h-40 w-auto object-contain"
                          />
                        </div>
                      )}

                    <h4 className="font-semibold mb-2">Label Details</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {/* Logo in list (small) */}
                      {(() => {
                        const logo = getTechPack.tech_pack.labels.logo;
                        const invalidLogos = [
                          "Not available",
                          "N/A",
                          "Logo to be supplied.",
                          "Logo to be supplied",
                          "",
                          null,
                          undefined,
                        ];

                        return !invalidLogos.includes(logo) ? (
                          <li>
                            <strong>Logo:</strong>
                            <img src={logo} alt="Label Logo" className="inline-block h-6 w-auto ml-2" />
                          </li>
                        ) : (
                          <li>
                            <strong>Logo:</strong> Not available
                          </li>
                        );
                      })()}

                      {/* Content */}
                      {getTechPack.tech_pack.labels.content && (
                        <li>
                          <strong>Content:</strong> {getTechPack.tech_pack.labels.content}
                        </li>
                      )}

                      {/* Preview */}
                      {getTechPack.tech_pack.labels.preview && (
                        <li>
                          <strong>Preview:</strong> {getTechPack.tech_pack.labels.preview}
                        </li>
                      )}

                      {/* Label Type */}
                      {getTechPack.tech_pack.labels.labelType && (
                        <li>
                          <strong>Label Type:</strong> {getTechPack.tech_pack.labels.labelType}
                        </li>
                      )}

                      {/* Placement */}
                      {getTechPack.tech_pack.labels.placement && (
                        <li>
                          <strong>Placement:</strong> {getTechPack.tech_pack.labels.placement}
                        </li>
                      )}

                      {/* Dimensions */}
                      {getTechPack.tech_pack.labels.dimensions && (
                        <li>
                          <strong>Dimensions:</strong> {getTechPack.tech_pack.labels.dimensions}
                        </li>
                      )}

                      {/* Color Reference */}
                      {getTechPack.tech_pack.labels.colorReference && (
                        <li>
                          <strong>Color Reference:</strong>
                          <span
                            className="inline-block w-4 h-4 ml-1 rounded border"
                            style={{
                              backgroundColor: getTechPack.tech_pack.labels.colorReference,
                            }}
                          ></span>{" "}
                          {getTechPack.tech_pack.labels.colorReference}
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Packaging */}
            <Card>
              <CardHeader>
                <CardTitle>Packaging</CardTitle>
                <CardDescription>Packaging specifications</CardDescription>
              </CardHeader>
              <CardContent>
                {getTechPack.tech_pack.packaging ? (
                  <div className="space-y-3">
                    {/* Packaging Description */}
                    {getTechPack.tech_pack.packaging.description && (
                      <p className="whitespace-pre-line text-sm text-gray-700">
                        {getTechPack.tech_pack.packaging.description}
                      </p>
                    )}

                    {/* Packaging Dimensions */}
                    {getTechPack.tech_pack.packaging.dimensions && (
                      <p className="text-sm text-gray-600">
                        <strong>Dimensions:</strong> {getTechPack.tech_pack.packaging.dimensions}
                      </p>
                    )}

                    {/* Packaging Materials */}
                    {getTechPack.tech_pack.packaging.materials?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Materials:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {getTechPack.tech_pack.packaging.materials.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {getTechPack.tech_pack.packaging.packagingDetails && (
                      <div>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          <li>
                            <strong>Packaging Type</strong>:{" "}
                            {getTechPack.tech_pack.packaging.packagingDetails.packagingType}
                          </li>
                          <li>
                            <strong>Material Spec</strong>:{" "}
                            {getTechPack.tech_pack.packaging.packagingDetails.materialSpec}
                          </li>
                          <li>
                            <strong>Closure Type</strong>:{" "}
                            {getTechPack.tech_pack.packaging.packagingDetails.closureType}
                          </li>
                          <li>
                            <strong>Artwork File Reference</strong>:{" "}
                            {getTechPack.tech_pack.packaging.packagingDetails.artworkFileReference}
                          </li>
                          <li>
                            <strong>Inner Packaging</strong>:{" "}
                            {getTechPack.tech_pack.packaging.packagingDetails.innerPackaging}
                          </li>
                          <li>
                            <strong>Barcode & Label Placement</strong>:{" "}
                            {getTechPack.tech_pack.packaging.packagingDetails.barcodeAndLabelPlacement}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No packaging details provided</p>
                )}
              </CardContent>
            </Card>

            {/* Sustainability */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Standards</CardTitle>
                <CardDescription>Details about the product's quality standards</CardDescription>
              </CardHeader>
              <CardContent>
                {getTechPack.tech_pack.qualityStandards ? (
                  <p className="whitespace-pre-line">{getTechPack.tech_pack.qualityStandards}</p>
                ) : (
                  <p className="text-gray-500">No Quality Standards information provided</p>
                )}
              </CardContent>
            </Card>

            {/* production logistics */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Production Logistics</CardTitle>
              </CardHeader>
              <CardContent>
                {getTechPack.tech_pack.productionLogistics &&
                  Object.values(getTechPack.tech_pack.productionLogistics).length > 0 ? (
                  <div className="space-y-3">
                    <ul className="list-inside list-disc space-y-1">
                      <li>
                        <strong className="capitalize">MOQ</strong>: {getTechPack.tech_pack.productionLogistics.MOQ}
                      </li>
                      <li>
                        <strong className="capitalize">Lead Time</strong>:{" "}
                        {getTechPack.tech_pack.productionLogistics.leadTime}
                      </li>
                      <li>
                        <strong className="capitalize">Sample Requirements</strong>:{" "}
                        {getTechPack.tech_pack.productionLogistics.sampleRequirements}
                      </li>
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500">No construction details provided</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sizes</CardTitle>
                <CardDescription>Sizes of the product</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Display Sizes */}
                {getTechPack.tech_pack.sizeRange ? (
                  <p className="whitespace-pre-line">{getTechPack.tech_pack.sizeRange.gradingLogic}</p>
                ) : (
                  <p className="text-gray-500">No Care Instructions information provided</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {getTechPack.tech_pack.sizeRange?.sizes?.map((size: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {size}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* image data */}
            {getTechPack.image_data && Object.values(getTechPack.image_data).length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Product images and references - This is an illustration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {filteredViewOrder
                      .filter((key) => key !== "illustration")
                      .map((key) => {
                        const index = viewOrder.indexOf(key);
                        const image = (getTechPack.image_data as Record<string, any>)?.[key];

                        return (
                          <div
                            key={key}
                            className="overflow-hidden rounded-md"
                            onClick={() => setModalImage(image.url || "/placeholder.svg")}
                          >
                            <div className="text-sm font-medium text-gray-600 mb-2 text-center">{viewOrder[index]}</div>
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={viewOrder[index]}
                              className="h-auto w-full object-cover"
                            />
                          </div>
                        );
                      })}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center italic">
                    These images are illustrations for reference purposes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="technical" className="mt-4 sm:mt-6">
          {/* Made coming soon overlay mobile responsive */}
          <div className={`relative ${getTechPack.tech_pack?.metadata ? "filter blur-sm" : null}`}>
            <Card>
              {/* <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Technical Specification Files</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Generate professional technical specification documents for manufacturing
                </CardDescription>
              </CardHeader> */}
              <CardContent>
                <div className="mt-4 mb-6 p-4 bg-cream rounded-lg border border-taupe overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
                    <div className="p-2 bg-taupe rounded-full shrink-0">
                      <FileText className="h-5 w-5 text-navy" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-navy mb-2 break-words">
                        Generate Technical Specification Files
                      </h3>

                      <p className="text-sm text-navy/80 mb-4 break-words">
                        Not all products require technical specification files. Generate one if your product falls into
                        the categories below.
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2 mb-4">
                        <div>
                          <h4 className="font-medium text-navy mb-2">Must-Have Tech Packs:</h4>
                          <ul className="text-sm text-navy/80 space-y-2">
                            <li className="flex items-center gap-2">
                              <Shirt className="h-4 w-4 text-navy/60" />
                              <span>Apparel</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Footprints className="h-4 w-4 text-navy/60" />
                              <span>Footwear</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-navy/60" />
                              <span>Bags</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Armchair className="h-4 w-4 text-navy/60" />
                              <span>Furniture/Upholstery</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Baby className="h-4 w-4 text-navy/60" />
                              <span>Toys/Plush</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Gem className="h-4 w-4 text-navy/60" />
                              <span>Jewelry (custom)</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-navy mb-2">Recommended:</h4>
                          <ul className="text-sm text-navy/80 space-y-2">
                            <li className="flex items-center gap-2">
                              <PawPrint className="h-4 w-4 text-navy/60" />
                              <span>Pet products</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-navy/60" />
                              <span>Home textiles</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-navy/60" />
                              <span>High-end packaging</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Palette className="h-4 w-4 text-navy/60" />
                              <span>Custom accessories</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      {!getTechPack?.tech_pack?.metadata && (
                        <div className="flex flex-col md:flex-row gap-4">
                          <Button variant="default" onClick={handleGeneratePrintFiles} disabled={loadingPrintFiles}>
                            {loadingPrintFiles ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating your print files…
                              </>
                            ) : (
                              <>
                                <DownloadCloudIcon className="h-4 w-4 shrink-0" />
                                Generate Print File
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-navy/70 mt-2 break-words">
                        Tech pack generation includes technical sketches, measurements, callouts, and manufacturing
                        specifications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <h3 className="font-semibold text-gray-600 mb-3 text-sm sm:text-base">
                    Technical Specification Files
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Professional technical files that communicate your design intent to manufacturers with precision and
                    clarity.
                  </p>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                      className="bg-white p-4 rounded border opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() =>
                        setModalImage(getTechPack.technical_images?.technicalImage?.url || "/placeholder.svg")
                      }
                    >
                      <div className="w-full h-32 mb-3 overflow-hidden rounded">
                        <img
                          src={getTechPack.technical_images?.technicalImage?.url || "/placeholder.svg"}
                          alt="Technical flat sketch"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Design Outline</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        A clean line drawing that shows your product’s full shape, seams, and proportions — perfect for
                        giving manufacturers a clear visual reference.
                      </p>
                    </div>
                    <div
                      className="bg-white p-4 rounded border opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() =>
                        setModalImage(getTechPack.technical_images?.vectorImage?.url || "/placeholder.svg")
                      }
                    >
                      <div className="w-full h-32 mb-3 overflow-hidden rounded">
                        <img
                          src={getTechPack.technical_images?.vectorImage?.url || "/placeholder.svg"}
                          alt="Vector illustration"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Final Product Front View</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        A realistic, full-color image of your product with fabric, print, and color — great for showing
                        how your design looks in real life.
                      </p>
                    </div>
                    <div
                      className="bg-white p-4 rounded border opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() =>
                        setModalImage(getTechPack.technical_images?.detailImage?.url || "/placeholder.svg")
                      }
                    >
                      <div className="w-full h-32 mb-3 overflow-hidden rounded">
                        <img
                          src={getTechPack.technical_images?.detailImage?.url || "/placeholder.svg"}
                          alt="Construction details"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Close-Up Details</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Zoomed-in images highlighting key areas like stitching, straps, or fastenings — helping
                        factories understand the build and finish.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    Generate these visuals automatically to complete your product's tech pack — clear, accurate, and
                    ready for production.
                  </p>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <DownloadCloudIcon className="h-4 w-4" />
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          disabled={pngLoader}
                          onClick={() =>
                            downloadPng([
                              getTechPack?.technical_images?.detailImage?.url,
                              getTechPack?.technical_images?.vectorImage?.url,
                              getTechPack?.technical_images?.technicalImage?.url,
                            ])
                          }
                        >
                          {pngLoader ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Downloading PNGs...
                            </>
                          ) : (
                            <>
                              {" "}
                              <Images className="h-4 w-4" /> PNG
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]}
                  className="w-full"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger>1. Multiple Views - Essential Product Perspectives</AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Why Multiple Views Matter</h4>
                        <p className="text-sm text-blue-800">
                          Multiple views eliminate guesswork for manufacturers by showing every angle of your design.
                          This prevents costly production errors and ensures your vision is accurately translated into
                          the final product.
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div
                          className="bg-gray-50 p-4 rounded border-2 border-dashed"
                          onClick={() =>
                            setModalImage(getTechPack.technical_images?.frontViewImage?.url || "/placeholder.svg")
                          }
                        >
                          <img
                            src={getTechPack.technical_images?.frontViewImage?.url || "/placeholder.svg"}
                            alt="Front view illustration"
                            className="object-cover mb-2"
                          />
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Front View</h5>
                          <p className="text-xs text-gray-600">
                            Complete front-facing view showing all visible design elements, pockets, seams, and trim
                            details
                          </p>
                        </div>
                        <div
                          className="bg-gray-50 p-4 rounded border-2 border-dashed"
                          onClick={() =>
                            setModalImage(getTechPack.technical_images?.backViewImage?.url || "/placeholder.svg")
                          }
                        >
                          <img
                            src={getTechPack.technical_images?.backViewImage?.url || "/placeholder.svg"}
                            alt="Back view illustration"
                            className="object-cover mb-2"
                          />
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Back View</h5>
                          <p className="text-xs text-gray-600">
                            Rear perspective revealing hidden construction details, closures, and design elements
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm mt-4">
                        <li>
                          • <strong>Front view</strong> – Complete outline showing pockets, seams, trims, and all
                          visible design elements
                        </li>
                        <li>
                          • <strong>Back view</strong> – Reveals construction details not visible from the front
                          perspective
                        </li>
                        <li>
                          • <strong>Side view</strong> – Optional profile view for products requiring depth
                          understanding
                        </li>
                        <li>
                          • <strong>Flat sketch style</strong> – Technical drawing without perspective, maintaining
                          accurate proportions
                        </li>
                      </ul>

                      <div className="mt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <DownloadCloudIcon className="h-4 w-4" />
                              Download
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              disabled={pngLoader}
                              onClick={() =>
                                downloadPng([
                                  getTechPack.technical_images?.backViewImage?.url,
                                  getTechPack.technical_images?.frontViewImage?.url,
                                ])
                              }
                            >
                              {pngLoader ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Downloading PNGs...
                                </>
                              ) : (
                                <>
                                  {" "}
                                  <Images className="h-4 w-4" /> PNG
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>2. Construction Details - Manufacturing Blueprint</AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-2">Purpose of Construction Details</h4>
                        <p className="text-sm text-green-800">
                          Construction details serve as the manufacturing roadmap, specifying exactly how each component
                          should be assembled. This level of detail ensures consistent quality and reduces production
                          time.
                        </p>
                      </div>
                      <div
                        className="bg-gray-50 p-4 rounded border-2 border-dashed mb-4"
                        onClick={() =>
                          setModalImage(getTechPack.technical_images?.constructionImage?.url || "/placeholder.svg")
                        }
                      >
                        <img
                          src={getTechPack.technical_images?.constructionImage?.url || "/placeholder.svg"}
                          alt="Construction details view"
                          className="object-cover w-full h-full mb-2"
                        />
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Construction Specifications</h5>
                        <p className="text-xs text-gray-600">
                          Detailed view of seam construction, stitching patterns, and assembly methods
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>
                          • <strong>Seam lines and panel divisions</strong> – Shows how pieces connect and where cuts
                          should be made
                        </li>
                        <li>
                          • <strong>Topstitching patterns</strong> – Dashed/dotted lines indicating decorative or
                          functional stitching
                        </li>
                        <li>
                          • <strong>Darts, pleats, and overlays</strong> – Shaping elements that create fit and form
                        </li>
                        <li>
                          • <strong>Functional hardware</strong> – Precise placement of zippers, buttons, snaps, and
                          closures
                        </li>
                      </ul>
                      <div className="mt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <DownloadCloudIcon className="h-4 w-4" />
                              Download
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              disabled={pngLoader}
                              onClick={() => downloadPng([getTechPack.technical_images?.constructionImage?.url])}
                            >
                              {pngLoader ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Downloading PNGs...
                                </>
                              ) : (
                                <>
                                  {" "}
                                  <Images className="h-4 w-4" /> PNG
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>3. Annotations & Callouts - Material Specifications</AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-900 mb-2">Why Callouts Are Critical</h4>
                        <p className="text-sm text-purple-800">
                          Use this image as your base reference for adding notes, comments, and material details. You
                          can manually mark fabric types, trims, stitching, and other specifications later when working
                          with your manufacturer to create full callouts and annotations.
                        </p>
                      </div>
                      <div
                        className="bg-gray-50 p-4 rounded border-2 border-dashed mb-4"
                        onClick={() =>
                          setModalImage(getTechPack.technical_images?.calloutImage?.url || "/placeholder.svg")
                        }
                      >
                        <img
                          src={getTechPack.technical_images?.calloutImage?.url || "/placeholder.svg"}
                          alt="Callout annotations view"
                          className="object-cover w-full h-full mb-2"
                        />
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Material Callouts</h5>
                        <p className="text-xs text-gray-600">
                          Numbered reference system linking design elements to material specifications
                        </p>
                      </div>
                      <p className="text-sm mb-2 font-medium">Numbered or lettered arrows pointing to:</p>
                      <ul className="space-y-2 text-sm ml-4">
                        <li>
                          • <strong>Fabric types and weights</strong> – Main materials, linings, interfacings
                        </li>
                        <li>
                          • <strong>Hardware and trims</strong> – Buttons, zippers, buckles, elastic, binding
                        </li>
                        <li>
                          • <strong>Embroidery or print placements</strong> – Logos, graphics, decorative elements
                        </li>
                        <li>
                          • <strong>Construction highlights</strong> – Special techniques or finishing details
                        </li>
                      </ul>

                      <div className="mt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <DownloadCloudIcon className="h-4 w-4" />
                              Download
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              disabled={pngLoader}
                              onClick={() => downloadPng([getTechPack.technical_images?.calloutImage?.url])}
                            >
                              {pngLoader ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Downloading PNGs...
                                </>
                              ) : (
                                <>
                                  {" "}
                                  <Images className="h-4 w-4" /> PNG
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-8 p-4 bg-cream rounded-lg border border-taupe">
                  <h3 className="font-semibold text-navy mb-2">🧾 What's Included in a Proper Tech Pack Sketch</h3>
                  <p className="text-sm text-navy/80">
                    A comprehensive tech pack sketch serves as the blueprint for manufacturers, ensuring accurate
                    production and minimizing costly revisions. Each element above contributes to clear communication
                    between designer and manufacturer.
                  </p>
                </div>
                {getTechPack.technical_images && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 relative z-10">
                    <Button
                      onClick={() => router.push(`/ai-designer?projectId=${id}&version=modular`)}
                      variant="outline"
                      className="flex-1 sm:flex-none sm:w-auto h-12 gap-2 bg-transparent text-sm px-4"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to edit mode
                    </Button>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none sm:w-auto h-12 gap-2 bg-transparent text-sm px-4"
                        onClick={() => handlePdfDownload()}
                      >
                        {pdfLoader ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download PDF
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => router.push(`/creator-dashboard/techpacks`)}
                        variant="default"
                        className="flex-1 sm:flex-none sm:w-auto h-12 gap-2 text-sm px-4"
                      >
                        Complete Tech-Pack
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {imageloader && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1C1917] p-6 sm:p-8 rounded-xl shadow-lg max-w-sm sm:max-w-md w-full"
          >
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white flex items-center justify-center p-2 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image src="/g-black.png" alt="Genpire" fill className="object-contain" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="h-10 sm:h-12">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm sm:text-lg font-medium text-[#1C1917]"
                  >
                    {loadingSteps[currentStep].text}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="w-full bg-gray-100 dark:bg-[#1C1917] h-1 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }}
                />
              </div>

              <p className="text-xs sm:text-sm text-[#1C1917] text-[#1C1917]">
                This may take a few minutes. Our AI is crafting something special. Please do not refresh the page until
                your tech-pack is ready.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          {/* Close button on the left */}
          <button
            onClick={() => setModalImage(null)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 bg-[#1C1917] rounded-full hover:bg-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Fullscreen Image */}
          <img
            src={modalImage || "/placeholder.svg"}
            alt="Full screen"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <AlertDialogHeader>
            <DialogTitle>Select Export Method</DialogTitle>
          </AlertDialogHeader>

          {!selectedMethod && (
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setSelectedMethod("gmail")}>
                Gmail
              </Button>
              {/* <Button variant="outline" onClick={() => setSelectedMethod("whatsapp")}>
                WhatsApp
              </Button> */}
            </div>
          )}

          {selectedMethod === "gmail" && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Enter Gmail Address</label>
              <Input
                type="email"
                placeholder="example@gmail.com"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          )}

          {selectedMethod === "whatsapp" && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Enter WhatsApp Number</label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          )}

          {selectedMethod && (
            <DialogFooter className="mt-4">
              <Button
                disabled={sending}
                onClick={async () => {
                  if (!inputValue) {
                    alert("Please enter a valid value.");
                    return;
                  }

                  setSending(true); // Start loader

                  try {
                    if (selectedMethod === "gmail") {
                      await sendPDF(getTechPack, { email: inputValue });
                    } else if (selectedMethod === "whatsapp") {
                      await sendPDF(getTechPack, { phone: inputValue });
                    }

                    setModalOpen(false); // Close modal after success
                  } catch (error) {
                    console.error("Error sending PDF:", error);
                    alert("Failed to send PDF");
                  } finally {
                    setSending(false); // Stop loader
                  }
                }}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={sending}>
                Cancel
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

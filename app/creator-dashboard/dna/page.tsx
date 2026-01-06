"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Sparkles,
  Upload,
  X,
  CheckCircle,
  Edit,
  Loader2,
  Crown,
  Plus,
  Eye,
  ImageIcon,
  Delete,
} from "lucide-react";
import { useCreateDnaStore } from "@/lib/zustand/brand-dna/createDna";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetCreatorDnaStore } from "@/lib/zustand/brand-dna/getDna";
import { useUpdateCreatorDnaStore } from "@/lib/zustand/brand-dna/updateDna";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { FormData, toneOptions } from "@/lib/types/brand_dna";
import { useDeleteDnaStore } from "@/lib/zustand/brand-dna/deleteDna";
import {
  formatTechpackJson,
  getCreatePayload,
  getUpdatedFields,
  initialFormData,
  mapCreatorDnaToForm,
  mapCreatorDnaToSuggestions,
  mapFormDataToSuggestedData,
} from "./utils";
import { extractCSV, extractExcel, handlePDFUpload } from "@/lib/utils/filesextracter";

export default function BrandDNAWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const brandAssetsInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const techPackfileRef = useRef<HTMLInputElement>(null);
  const { setCreateDna, loadingCreateDna } = useCreateDnaStore();
  const { setUpdateCreatorDna, loadingUpdateCreatorDna } = useUpdateCreatorDnaStore();
  const {
    fetchCreatorDna,
    getCreatorDna,
    refresCreatorDna,
    loadingGetCreatorDna,
    errorGetCreatorDna,
    FetchAgainCreatorDna,
    getActiveDna,
  } = useGetCreatorDnaStore();
  const { creatorProfile } = useUserStore();
  const [designFilePreviews, setDesignFilePreviews] = useState<(string | null)[]>([]);
  const [logoUrl, setlogoImage] = useState<string | null>("");
  const [brandAssetsImage, setbrandAssetsImage] = useState<(string | null)[]>([]);
  const [uploadErrors, setUploadErrors] = useState<{
    inspirationImages?: string;
    brandLogo?: string;
    brandAssets?: string;
  }>({});
  const [techPackFile, setTechPackFile] = useState<any>(null);
  const [TechpackuploadError, setTechpackuploadError] = useState("");
  const [newColor, setNewColor] = useState<any>();
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [suggestedData, setSuggestedData] = useState(mapFormDataToSuggestedData(formData));
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const { getCreatorCredits } = useGetCreditsStore();
  const { setDeleteDna } = useDeleteDnaStore();
  const [techPackFiles, setTechPackFiles] = useState<File[]>([]); // Local uploaded files
  const [techPackDataList, setTechPackDataList] = useState<any[]>([]); // store parsed JSON of each local file
  const [dbTechPackFiles, setDbTechPackFiles] = useState<any[]>([]); // Files from database
  const [selectedTechPackIndex, setSelectedTechPackIndex] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<"local" | "db">("local"); // Track which source is selected
  const [selectedDnaId, setSelectedDnaId] = useState<string | null>(null); // Track which DNA is being edited

  useEffect(() => {
    const initializeForm = async () => {
      if (!getCreatorDna && fetchCreatorDna) {
        fetchCreatorDna();
        return;
      }

      if (getCreatorDna && !isFormInitialized) {
        // If DNAs exist, show the list view
        if (Array.isArray(getCreatorDna) && getCreatorDna.length > 0) {
          setShowSuccess(true);
          setIsFormInitialized(true);
        }
        // If no DNAs exist, stay in wizard mode to create first one
        else {
          setShowSuccess(false);
          setIsFormInitialized(true);
        }
      }
    };

    initializeForm();
  }, [getCreatorDna, fetchCreatorDna, isFormInitialized]);

  const activateDna = async (dnaId: string) => {
    if (!Array.isArray(getCreatorDna)) return;

    setIsToggling(true);
    try {
      // Find the DNA to activate
      const dnaToActivate = getCreatorDna.find((dna: any) => dna.id === dnaId);
      if (!dnaToActivate) {
        throw new Error("DNA not found");
      }

      // If already active, do nothing
      if (dnaToActivate.status === true) {
        toast({
          title: "Already Active",
          description: "This Brand DNA is already active.",
        });
        setIsToggling(false);
        return;
      }

      // Deactivate all other DNAs and activate this one
      const updatePromises = getCreatorDna.map(async (dna: any) => {
        if (dna.id === dnaId) {
          // Activate this DNA
          const response = await fetch(`/api/brand-dna/update-dna`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: dna.id, status: true }),
          });
          if (!response.ok) throw new Error("Failed to activate DNA");
        } else if (dna.status === true) {
          // Deactivate other active DNAs
          const response = await fetch(`/api/brand-dna/update-dna`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: dna.id, status: false }),
          });
          if (!response.ok) throw new Error("Failed to deactivate DNA");
        }
      });

      await Promise.all(updatePromises);
      await refresCreatorDna();

      toast({
        title: "DNA Activated",
        description: `${dnaToActivate.brand_name} is now your active Brand DNA.`,
      });
    } catch (error) {
      console.error("Error activating DNA:", error);
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: "Unable to activate Brand DNA.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDesignFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "inspirationImages" | "brandLogo" | "brandAssets"
  ) => {
    const files = e.target.files;
    setUploadErrors((prev) => ({ ...prev, [fieldName]: undefined })); // clear error for this field

    if (!files || files.length === 0) return;

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];
    const maxSizeMB = 2;
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileTypeValid = validTypes.includes(file.type);
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const extensionValid = validExtensions.includes(fileExtension);

      if (!fileTypeValid || !extensionValid) {
        setUploadErrors((prev) => ({
          ...prev,
          [fieldName]: "Please upload PNG, JPG, or JPEG files only.",
        }));
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadErrors((prev) => ({
          ...prev,
          [fieldName]: "File size must be less than 2MB.",
        }));
        return;
      }

      try {
        const base64String = await convertFileToBase64(file);
        newPreviews.push(base64String);
      } catch (error) {
        console.error(error);
        setUploadErrors((prev) => ({
          ...prev,
          [fieldName]: "Failed to convert file to base64.",
        }));
        return;
      }
    }

    setFormData((prevForm) => {
      const updatedForm = { ...prevForm };

      switch (fieldName) {
        case "inspirationImages":
          updatedForm.inspirationImages = [...(prevForm.inspirationImages || []), ...newPreviews].filter(
            (img): img is string => !!img
          );
          setDesignFilePreviews(updatedForm.inspirationImages);
          break;

        case "brandLogo":
          updatedForm.logo_url = newPreviews[0] || "";
          setlogoImage(updatedForm.logo_url);
          break;

        case "brandAssets":
          updatedForm.brand_assets = [...(prevForm.brand_assets || []), ...newPreviews].filter(
            (img): img is string => !!img
          );
          setbrandAssetsImage(updatedForm.brand_assets);
          break;

        default:
          console.warn("Unknown upload field:", fieldName);
          break;
      }

      return updatedForm;
    });

    // Clear input so the same file can be reselected
    e.target.value = "";
  };

  const handleTechPackUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (dbTechPackFiles.length >= 3) {
      toast({
        variant: "destructive",
        title: "Max files reached",
        description: "You can only upload up to 3 files.",
      });
      return;
    }
    const allowedExtensions = [".pdf", ".csv", ".xlsx", ".xls"];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        setTechpackuploadError("Only PDF, CSV, and Excel files are allowed.");
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Only PDF, CSV, and Excel files are allowed.",
        });
        continue;
      }

      if (techPackFiles.length + newFiles.length >= 3 || dbTechPackFiles.length >= 3) {
        setTechpackuploadError("Maximum of 3 files allowed.");
        toast({
          variant: "destructive",
          title: "Max files reached",
          description: "You can only upload up to 3 files.",
        });
        break;
      }

      newFiles.push(file);
    }

    if (newFiles.length === 0) return;

    setTechpackuploadError("");

    // Process each file
    const newDataList: any[] = [];
    for (const file of newFiles) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      try {
        let data: any;
        if (ext === ".csv") data = await extractCSV(file);
        else if (ext === ".xlsx" || ext === ".xls") data = await extractExcel(file);
        else if (ext === ".pdf") data = await handlePDFUpload(file);

        newDataList.push(data || {});
        toast({
          variant: "default",
          title: "File Processed",
          description: `${file.name} processed successfully.`,
        });
      } catch (err: any) {
        console.error("File processing error:", err);
        toast({
          variant: "destructive",
          title: "Processing Failed",
          description: err.message || "Something went wrong.",
        });
      }
    }

    // Update state
    const previousLocalFileCount = techPackFiles.length;
    setTechPackFiles((prev) => [...prev, ...newFiles]);
    setTechPackDataList((prev) => [...prev, ...newDataList]);

    // Auto-select the first newly uploaded file
    if (newFiles.length > 0) {
      setSelectedTechPackIndex(previousLocalFileCount); // Select first new file
      setSelectedSource("local");
    }

    setFormData((prev) => ({
      ...prev,
      company_techpack: [...dbTechPackFiles, ...techPackDataList, ...newDataList], // store all JSON data (DB + local)
    }));
  };

  const removeImage = (
    fieldName: "inspirationImages" | "brandLogo" | "brandAssets" | "techpackFile",
    index?: number
  ) => {
    setFormData((prevForm) => {
      const updatedForm = { ...prevForm };

      switch (fieldName) {
        case "inspirationImages":
          if (!updatedForm.inspirationImages) return prevForm;
          updatedForm.inspirationImages = updatedForm.inspirationImages.filter((_, i) => i !== index);
          setDesignFilePreviews(updatedForm.inspirationImages);
          break;

        case "brandAssets":
          if (!updatedForm.brand_assets) return prevForm;
          updatedForm.brand_assets = updatedForm.brand_assets.filter((_, i) => i !== index);
          setbrandAssetsImage(updatedForm.brand_assets);
          break;

        case "techpackFile":
          setTechPackFile(null);
          if (techPackfileRef.current) {
            techPackfileRef.current.value = ""; // Clear input value
          }
          break;

        case "brandLogo":
          // For logo, just clear it if index matches 0 (since it's single)
          if (index === 0) {
            updatedForm.logo_url = "";
            setlogoImage("");
          }
          break;

        default:
          console.warn("Unknown field:", fieldName);
          break;
      }

      return updatedForm;
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleNext = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const analyzeWebsite = async () => {
    const hasSubscriptionHistory = getCreatorCredits?.hasEverHadSubscription;

    if (!hasSubscriptionHistory) {
      const errorMessage = "You need a plan to generate collections. Please subscribe to continue.";
      toast({
        title: "Subscription Required",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }

    let url = formData.websiteUrl?.trim();

    if (!url) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL to analyze.",
        variant: "destructive",
      });
      return null;
    }

    if (!url.startsWith("https://")) {
      toast({
        title: "Invalid URL",
        description: "Website URL must start with https://",
        variant: "destructive",
      });
      return null;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    setIsScanning(true);
    try {
      console.log("Analyzing URL:", url);
      const response = await fetch("/api/brand-dna/analyze-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formData.websiteUrl.trim() }),
      });

      if (!response.ok) {
        // throw new Error(data.error || "Analysis failed");
        toast({
          title: "Analysis Failed",
          description: "Unable to analyze the website.",
          variant: "destructive",
        });
        setIsScanning(false);
        return null;
      }

      const data = await response.json();

      setSuggestedData(data);

      setIsScanning(false);
      setShowSuggestions(true);
      setFormData((prev) => ({
        ...prev,
        brandName: data.brand_name || "Unknown Brand",
        category: data.category || "General",
        tagline: data.tagline || "Not specified",
        patterns: Array.isArray(data.patterns) ? data.patterns : [],
        targetAudience: data.audience ? data.audience : data.audience || "General audience",
        summary: data.summary || "",
        logo_url: data.logo_url || "",
        brand_title: data.brand_title || "",
        brand_subtitle: data.brand_subtitle || "",
      }));
      toast({
        title: "Analysis Complete",
        description: "Website analysis completed successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the website.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (loadingUpdateCreatorDna || loadingCreateDna) return;

    const isFormEmpty = (data: any) =>
      !Object.values(data).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));

    try {
      // If editing an existing DNA
      if (selectedDnaId) {
        const existingDna = Array.isArray(getCreatorDna)
          ? getCreatorDna.find((dna: any) => dna.id === selectedDnaId)
          : null;

        if (!existingDna) {
          toast({
            title: "Error",
            description: "DNA not found.",
            variant: "destructive",
          });
          return;
        }

        const updatedFields = getUpdatedFields(formData, existingDna);
        console.log("updatedFields ==> ", updatedFields);

        if (updatedFields && Object.keys(updatedFields).length === 0) {
          console.log("No changes detected.");
          setShowSuccess(true);
          setSelectedDnaId(null);
          return;
        }

        const response = await fetch(`/api/brand-dna/update-dna`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedDnaId, ...updatedFields }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast({
            title: "Update Failed",
            description: error.message || "There was an error updating your Brand DNA.",
            variant: "destructive",
          });
          return;
        }
      }
      // If creating a new Brand DNA
      else {
        if (isFormEmpty(formData)) {
          console.log("Form is empty. Skipping create.");
          return;
        }

        const payload = getCreatePayload(formData, creatorProfile);
        // Auto-activate new DNAs and deactivate existing active ones
        payload.status = true;
        console.log("payload ==> ", payload);

        const { error } = await setCreateDna(payload);
        if (error) {
          console.error("Error creating Brand DNA:", error);
          return;
        }
      }

      await refresCreatorDna();
      setShowSuccess(true);
      setCurrentPage(1);
      setShowSuggestions(false);
      setSelectedDnaId(null);
      setFormData(initialFormData);
      setSuggestedData(mapFormDataToSuggestedData(initialFormData));
      toast({
        title: "Brand DNA Saved!",
        description: "Your brand profile has been successfully saved.",
      });
    } catch (error) {
      console.error("Error saving Brand DNA:", error);
    }
  };

  const toggleArrayItem = (array: string[], item: string, field: keyof typeof formData) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
    setFormData({ ...formData, [field]: newArray });
  };

  const acceptSuggestion = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const acceptAllSuggestions = (category: string) => {
    switch (category) {
      case "colors":
        setFormData({
          ...formData,
          colorPalette: suggestedData?.color_palette?.map((c) => c),
        });
        break;
      case "keywords":
        setFormData({
          ...formData,
          styleKeywords: suggestedData?.style_keywords?.map((k) => k),
        });
        break;
      case "materials":
        setFormData({
          ...formData,
          materials: suggestedData?.materials?.map((m) => m),
        });
        break;
      case "patterns":
        setFormData({
          ...formData,
          patterns: suggestedData?.patterns?.map((p) => p),
        });
        break;
    }
  };

  const imageSlots = [...designFilePreviews];

  while (imageSlots.length < 6) {
    imageSlots.push(null);
  }

  const handleCreateNewDna = () => {
    setFormData(initialFormData);
    setSelectedDnaId(null);
    setShowSuccess(false);
    setCurrentPage(1);
    setSuggestedData(mapFormDataToSuggestedData(initialFormData));
    setTechPackFiles([]);
    setTechPackDataList([]);
    setDbTechPackFiles([]);
    setSelectedTechPackIndex(null);
    setSelectedSource("local");
  }

  const handleEditDna = (dnaId: string) => {
    if (!Array.isArray(getCreatorDna)) return;

    const dnaToEdit = getCreatorDna.find((dna: any) => dna.id === dnaId);
    if (!dnaToEdit) return;

    // Load the DNA data into the form
    const form = mapCreatorDnaToForm(dnaToEdit);
    setFormData(form);

    if (form.inspirationImages.length > 0) {
      setDesignFilePreviews(form.inspirationImages);
    }

    if (form.brand_assets && form.brand_assets.length > 0) {
      setbrandAssetsImage(form.brand_assets);
    }

    if (form.logo_url) {
      setlogoImage(form.logo_url);
    }

    // Load database tech pack files if they exist
    if (dnaToEdit.company_techpack && Array.isArray(dnaToEdit.company_techpack)) {
      setDbTechPackFiles(dnaToEdit.company_techpack);
      if (dnaToEdit.company_techpack.length > 0) {
        setSelectedTechPackIndex(0);
        setSelectedSource("db");
      }
    }

    setSuggestedData(mapCreatorDnaToSuggestions(dnaToEdit));

    // Set the selected DNA ID and switch to edit mode
    setSelectedDnaId(dnaId);
    setShowSuccess(false);
    setCurrentPage(1);
  };

  const handleDeleteDna = async (dnaId: string) => {
    if (!Array.isArray(getCreatorDna)) return;

    const dnaToDelete = getCreatorDna.find((dna: any) => dna.id === dnaId);
    if (!dnaToDelete) return;

    const result = await setDeleteDna(dnaId);

    if (!result.success) {
      console.error(result.message);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Unable to delete Brand DNA.",
      });
      return;
    }

    toast({
      title: "Brand DNA Deleted",
      description: "Your Brand DNA has been successfully deleted.",
    });

    await refresCreatorDna();
  };

  if (loadingGetCreatorDna || errorGetCreatorDna) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Loading Brand DNA</span>
      </div>
    );
  }

  if (showSuccess) {
    const activeDna = getActiveDna();
    const allDnas = Array.isArray(getCreatorDna) ? getCreatorDna : [];

    return (
      <div className="flex-1 space-y-8 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#f5f4f0] via-white to-[#f5f4f0] min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">

          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Brand DNA Library</h1>
            <p className="text-zinc-900/70 mt-1">Manage your brand identities</p>
          </div>

          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-end w-full">

              {activeDna && (
                <>
                  <Button
                    onClick={() => handleEditDna(activeDna.id)}
                    variant="outline"
                    className="border-zinc-300 text-zinc-900 hover:bg-zinc-50 w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Active DNA
                  </Button>

                  <Button
                    onClick={() => handleDeleteDna(activeDna.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 w-full sm:w-auto"
                  >
                    <Delete className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}

              <Button
                onClick={() => handleCreateNewDna()}
                disabled={allDnas.length >= 3}
                className="bg-zinc-900 hover:bg-zinc-900/90 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New DNA
              </Button>

            </div>

            {allDnas.length >= 3 && (
              <p className="text-xs text-zinc-500 italic">Maximum of 3 Brand DNAs reached</p>
            )}
          </div>

        </div>

        {/* Active DNA Display (if exists) */}
        {activeDna && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Active DNA Profile */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-zinc-200 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-zinc-900 text-white p-6">
                  <div className="flex items-center space-x-4">
                    {activeDna.logo_url ? (
                      <div className="p-2 bg-white rounded-xl">
                        <img src={activeDna.logo_url} alt="Profile" className="max-h-14 w-auto object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#d3c7b9] rounded-xl flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-zinc-900" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-2xl font-bold">{activeDna.brand_name}</CardTitle>
                        <Badge className="bg-green-500/20 text-green-600 border-0">✓ Active</Badge>
                      </div>
                      <p className="text-zinc-300 text-sm">{activeDna.tagline}</p>
                      <Badge variant="outline" className="mt-2">
                        {activeDna.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Brand Title & Subtitle */}
                  <div className="flex flex-col sm:flex-row justify-between sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-zinc-900 rounded-full flex-shrink-0"></span>
                        Brand Title
                      </h3>
                      <p className="text-md text-zinc-900 ml-4">{activeDna?.brand_title || "No Title Provided"}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-zinc-900 rounded-full flex-shrink-0"></span>
                        Brand Subtitle
                      </h3>
                      <p className="text-md text-zinc-900 ml-4">{activeDna?.brand_subtitle || "No Subtitle Provided"}</p>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                      Color Palette
                    </h3>
                    <div className="flex space-x-4">
                      {(activeDna?.colors || []).map((color: string, index: number) => (
                        <div key={index} className="text-center">
                          <div
                            className="w-16 h-16 rounded-full border-4 border-white shadow-lg transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-xs text-zinc-900/70 mt-2">{color}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Style Keywords & Materials */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                        Style Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(activeDna?.style_keyword || []).map((keyword: string) => (
                          <Badge key={keyword} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                        Materials
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(activeDna?.materials || []).map((material: string) => (
                          <Badge key={material} variant="outline">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Brand Assets */}
                  {(activeDna?.brand_assets?.length ?? 0) > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                        Brand Assets
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {activeDna?.brand_assets?.map((image: string, index: number) => (
                          <div
                            key={index}
                            className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ aspectRatio: "1 / 1" }}
                          >
                            {image ? (
                              <img src={image} alt={`Brand Asset ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No image
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Inspiration */}
                  {(activeDna?.mood_board?.length ?? 0) > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                        Product Inspiration
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {activeDna?.mood_board?.map((image: string, index: number) => (
                          <div
                            key={index}
                            className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ aspectRatio: "1 / 1" }}
                          >
                            {image ? (
                              <img src={image} alt={`Inspiration ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No image
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Panel - AI Summary & Actions */}
            <div className="space-y-6">
              {/* AI Brand Summary */}
              <Card className="bg-white border border-zinc-200 shadow-lg rounded-xl">
                <CardHeader className="border-b border-zinc-100 pb-4">
                  <CardTitle className="text-lg text-zinc-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-zinc-900" />
                    AI Brand Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-[#f 5f4f0] p-4 rounded-lg border border-[#d3c7b9]">
                    <p className="text-zinc-700 text-sm leading-relaxed">{activeDna.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 p-3 rounded-lg text-center border border-zinc-100">
                      <div className="text-2xl font-bold text-zinc-900">{activeDna.colors?.length || 0}</div>
                      <div className="text-xs text-zinc-500 font-medium mt-1">Colors</div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg text-center border border-zinc-100">
                      <div className="text-2xl font-bold text-zinc-900">{activeDna.materials?.length || 0}</div>
                      <div className="text-xs text-zinc-500 font-medium mt-1">Materials</div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg text-center border border-zinc-100">
                      <div className="text-2xl font-bold text-zinc-900">{activeDna.mood_board?.length || 0}</div>
                      <div className="text-xs text-zinc-500 font-medium mt-1">Inspiration</div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg text-center border border-zinc-100">
                      <div className="text-2xl font-bold text-zinc-900">1</div>
                      <div className="text-xs text-zinc-500 font-medium mt-1">Sources</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
            </div>
          </div>
        )}

        {/* All Brand DNAs Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">All Brand DNAs</h2>
              <p className="text-sm text-zinc-600 mt-1">{allDnas.length} {allDnas.length === 1 ? 'identity' : 'identities'} created</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allDnas.map((dna: any) => {
              const isActive = dna.status === true;
              return (
                <Card
                  key={dna.id}
                  className={`group relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden ${isActive
                    ? "bg-white shadow-lg ring-2 ring-zinc-900 ring-offset-2"
                    : "border border-zinc-200 bg-white hover:border-zinc-300 shadow-md"
                    }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`relative ${isActive ? 'ring-2 ring-green-400 ring-offset-2 rounded-xl' : ''
                          }`}>
                          {dna.logo_url ? (
                            <img
                              src={dna.logo_url}
                              alt={dna.brand_name}
                              className="w-14 h-14 rounded-xl object-contain"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-xl flex items-center justify-center shadow-sm">
                              <Sparkles className="h-7 w-7 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold truncate text-zinc-900">{dna.brand_name}</CardTitle>
                          <p className="text-xs text-zinc-500 truncate font-medium mt-0.5">{dna.category}</p>
                        </div>
                      </div>
                      {isActive && (
                        <Badge className="bg-green-500/20 text-green-600 border-0">✓ Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mini color palette */}
                    {dna.colors && dna.colors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Color Palette</p>
                        <div className="flex space-x-2">
                          {dna.colors.slice(0, 6).map((color: string, index: number) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                          {dna.colors.length > 6 && (
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                              +{dna.colors.length - 6}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 py-2">
                      <div className="text-center py-2 bg-zinc-50 rounded-lg">
                        <p className="text-lg font-bold text-zinc-900">{dna.colors?.length || 0}</p>
                        <p className="text-xs text-zinc-500">Colors</p>
                      </div>
                      <div className="text-center py-2 bg-zinc-50 rounded-lg">
                        <p className="text-lg font-bold text-zinc-900">{dna.materials?.length || 0}</p>
                        <p className="text-xs text-zinc-500">Materials</p>
                      </div>
                      <div className="text-center py-2 bg-zinc-50 rounded-lg">
                        <p className="text-lg font-bold text-zinc-900">{dna.style_keyword?.length || 0}</p>
                        <p className="text-xs text-zinc-500">Keywords</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {!isActive && (
                        <Button
                          size="sm"
                          onClick={() => activateDna(dna.id)}
                          disabled={isToggling}
                          className="flex-1 bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white shadow-md"
                        >
                          {isToggling ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDna(dna.id)}
                        className="flex-1 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDna(dna.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      >
                        <Delete className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border-2 border-stone-300 rounded-2xl p-6 text-center">
          <p className="text-zinc-900">
            <strong>Active Brand DNA will appear as a toggle on prompt screens.</strong> It will auto-apply to enhance your
            prompts with brand context. Only one DNA can be active at a time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 bg-[#f5f4f0] min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        {/* Back button when editing */}
        {selectedDnaId && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              // size="sm"
              onClick={() => {
                setShowSuccess(true);
                setSelectedDnaId(null);
              }}
              className="text-zinc-900 hover:bg-[#d3c7b9]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to DNA Library
            </Button>
          </div>
        )}
      </div>

      {/* Page 1 - Auto-Setup & Basics */}
      {currentPage === 1 && (
        <div className="space-y-4">
          {/* A. Source Inputs - Centered Hero Style */}
          {!showSuggestions ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
              <div className="space-y-4 max-w-3xl">
                <h2 className="text-5xl font-bold tracking-tight text-zinc-900">
                  Sync Your Brand Automatically
                </h2>
                <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
                  Connect your website or store URL, and Genpire’s AI will extract your visuals, palette, and messaging style to enhance your Brand DNA.
                </p>
              </div>

              <div className="w-full max-w-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-stone-200 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>

                {/* flex for desktop, column for mobile */}
                <div className="relative flex items-center max-md:flex-col max-md:gap-4">

                  <Globe className="absolute left-6 h-6 w-6 text-zinc-400 max-md:hidden" />

                  <Input
                    id="website"
                    placeholder="https://your-brand.com"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                    onKeyPress={(e) => e.key === "Enter" && analyzeWebsite()}
                    className="
        h-20 pl-16 pr-40 rounded-full border-0 shadow-2xl shadow-zinc-200/50 
        bg-white text-xl placeholder:text-zinc-300 focus-visible:ring-2 
        focus-visible:ring-zinc-900
        max-md:w-full max-md:pr-6 max-md:pl-12
      "
                  />

                  {/* button right side on desktop, below on mobile */}
                  <div className="absolute right-2 max-md:relative max-md:right-0 max-md:w-full">
                    <Button
                      onClick={() => analyzeWebsite()}
                      disabled={isScanning}
                      size="lg"
                      className="
          h-16 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white 
          text-lg font-medium transition-all shadow-lg hover:shadow-xl
          max-md:w-full
        "
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Scanning
                        </>
                      ) : (
                        <>
                          Scan Website
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Compact Input for when suggestions are shown */
            <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg mb-8">
              <CardContent className="p-6 flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="pl-10 border-[#d3c7b9]"
                  />
                </div>
                <Button
                  onClick={() => analyzeWebsite()}
                  disabled={isScanning}
                  className="bg-zinc-900 text-white"
                >
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rescan"}
                </Button>
              </CardContent>
            </Card>
          )}

          {showSuggestions && (
            <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-zinc-900">Detected Data Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo/Brand Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-zinc-900">Brand Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Brand Name</span>
                        <Badge variant="outline" className="text-xs">
                          From Website
                        </Badge>
                      </div>
                      <p className="text-zinc-900">{suggestedData.brand_name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Tagline</span>
                        <Badge variant="outline" className="text-xs">
                          From Website
                        </Badge>
                      </div>
                      <p className="text-zinc-900">{suggestedData.tagline}</p>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">Color Palette</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptAllSuggestions("colors")}>
                        Accept All
                      </Button>
                      <Button size="sm" variant="outline">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {suggestedData.color_palette.map((color, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="relative group">
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => acceptSuggestion("colorPalette", [...formData.colorPalette, color])}
                          />
                          <Badge className="absolute -top-2 -right-2 text-xs bg-white border">
                            {formData.colorPalette.includes(color) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Website
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style Keywords */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">Style Keywords</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptAllSuggestions("keywords")}>
                        Accept All
                      </Button>
                      <Button size="sm" variant="outline">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedData.style_keywords.map((keyword, index) => (
                      <div key={index} className="relative">
                        <Button
                          variant={formData.styleKeywords.includes(keyword) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem(formData.styleKeywords, keyword, "styleKeywords")}
                          className="pr-8"
                        >
                          {keyword}
                          {formData.styleKeywords.includes(keyword) && <Check className="h-3 w-3 ml-1" />}
                        </Button>
                        <Badge className="absolute -top-2 -right-2 text-xs bg-white border">
                          {keyword.slice(0, 2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">Materials</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptAllSuggestions("materials")}>
                        Accept All
                      </Button>
                      <Button size="sm" variant="outline">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedData.materials.map((material, index) => (
                      <div key={index} className="relative">
                        <Button
                          variant={formData.materials.includes(material) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem(formData.materials, material, "materials")}
                          className="pr-8"
                        >
                          {material}
                          {formData.materials.includes(material) && <Check className="h-3 w-3 ml-1" />}
                        </Button>
                        <Badge className="absolute -top-2 -right-2 text-xs bg-white border">
                          {material.slice(0, 2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* D. Basics Form */}
          <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900">Brand Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="Your Brand Name"
                    value={formData.brandName || suggestedData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="border-[#d3c7b9] placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category/Industry</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Fashion & Apparel"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="border-[#d3c7b9] placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand_title">Brand Title</Label>
                  <Input
                    id="brand_title"
                    placeholder="Your Brand Title"
                    value={formData.brand_title || suggestedData.brand_title}
                    onChange={(e) => setFormData({ ...formData, brand_title: e.target.value })}
                    className="border-[#d3c7b9] placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_subtitle">Brand Subtitle</Label>
                  <Input
                    id="brand_subtitle"
                    placeholder="Your Brand subtitle"
                    value={formData.brand_subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_subtitle: e.target.value,
                      })
                    }
                    className="border-[#d3c7b9] placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (Optional)</Label>
                <Input
                  id="tagline"
                  placeholder="Your brand tagline"
                  value={formData.tagline || suggestedData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="border-[#d3c7b9] placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page 2 - Style, Values & Confirm */}
      {currentPage === 2 && (
        <div className="space-y-8">
          {/* A. Style Guide */}
          <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-cl text-zinc-900">Brand Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Upload Your Logo (PNG/JPEG)
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Use a transparent background and high-resolution file for best AI recognition.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </Button>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={(e) => handleDesignFileUpload(e, "brandLogo")}
                  />

                  {uploadErrors.brandLogo && <p className="text-xs text-red-500 mt-1">{uploadErrors.brandLogo}</p>}
                </div>

                {(logoUrl || suggestedData.logo_url || formData.logo_url) && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div
                      className="relative group rounded-md overflow-hidden border border-gray-200"
                      key={logoUrl || suggestedData.logo_url || formData.logo_url} // ensures React handles re-render correctly
                    >
                      <img
                        src={logoUrl || suggestedData.logo_url || formData.logo_url}
                        alt="Brand Logo"
                        className="object-contain w-16 h-16 rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 w-5 h-5 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage("brandLogo", 0)}
                      >
                        <X className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900">Brand Style Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Palette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900">Color Palette</h3>
                  <div className="flex gap-2">
                    {/* Color Picker */}
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-10 h-10 p-0 border-2 border-gray-200 rounded-lg cursor-pointer"
                    />

                    {/* Add Color Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!formData.colorPalette.includes(newColor)) {
                          setFormData({
                            ...formData,
                            colorPalette: [...formData.colorPalette, newColor],
                          });
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add HEX
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.colorPalette.map((color, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            colorPalette: formData.colorPalette.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <ImageIcon className="h-4 w-4 font-semibold text-zinc-900" />
                  Brand Assets (PNG/JPEG)
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Use a transparent background and high-resolution file for best AI recognition.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => brandAssetsInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </Button>

                  <input
                    ref={brandAssetsInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple
                    className="hidden"
                    onChange={(e) => handleDesignFileUpload(e, "brandAssets")}
                  />

                  {/* Error Message */}
                  {uploadErrors.brandAssets && <p className="text-xs text-red-500 mt-1">{uploadErrors.brandAssets}</p>}
                </div>

                {/* Image Grid BELOW the upload button */}
                {brandAssetsImage.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {brandAssetsImage.map((image, index) => (
                      <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={image ?? undefined}
                          alt={`brandAssets ${index + 1}`}
                          className="object-contain w-16 h-16 rounded-md"
                        />
                        <button
                          className="absolute top-1 right-1 w-5 h-5 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage("brandAssets", index)}
                        >
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900">Products Inspiration</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Upload Insipiration images (PNG/JPEG)
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload images or PDFs of your latest or flagship collections (JPEG, PNG, or PDF) — including product
                  shots, lookbooks, or design boards.
                </p>

                {/* Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => inspirationInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload Images
                </Button>

                <input
                  ref={inspirationInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  multiple
                  className="hidden"
                  onChange={(e) => handleDesignFileUpload(e, "inspirationImages")}
                />

                {/* Error Message */}
                {uploadErrors.inspirationImages && (
                  <p className="text-xs text-red-500 mt-1">{uploadErrors.inspirationImages}</p>
                )}

                {/* Image Grid */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {designFilePreviews.map((image, index) => (
                    <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={image ?? undefined}
                        alt={`brandAssets ${index + 1}`}
                        className="object-contain w-16 h-16 rounded-md"
                      />
                      <button
                        className="absolute top-1 right-1 w-5 h-5 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage("inspirationImages", index)}
                      >
                        <X className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900">Company Tech Pack</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <>
                {/* <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Upload Your Company’s Tech Pack Format
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Help Genpire understand how your brand communicates product data. Upload your existing tech pack
                    template in CSV, PDF, or Excel format — this helps our AI learn your documentation structure and
                    align future outputs to your workflow.
                  </p> */}

                {/* Upload Button */}
                {/* <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => techPackfileRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button> */}

                {/* <input
                    ref={techPackfileRef}
                    type="file"
                    accept=".pdf,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden"
                    onChange={handleTechPackUpload}
                  /> */}

                {/* Error Message */}
                {/* {TechpackuploadError && <p className="text-xs text-red-500 mt-1">{TechpackuploadError}</p>} */}

                {/* Uploaded File Display */}
                {/* {techPackFile || formData.company_techpack ? (
                    <div className="relative flex items-center justify-between rounded-md border border-gray-200 p-2 mt-3 w-full max-w-xs">
                      <p className="truncate">{techPackFile ? techPackFile.name : "Uploaded Techpack Data"}</p>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => {
                          removeImage("techpackFile");
                          // Also clear the stored JSON if needed
                          setFormData((prev) => ({ ...prev, company_techpack: null }));
                        }}
                        aria-label={`Remove ${techPackFile ? techPackFile.name : "Techpack"}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-3">No file uploaded yet.</p>
                  )}
                </div> */}
                {/* <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm overflow-x-auto">
                  <pre className="text-zinc-900 whitespace-pre-wrap break-words">
                    {formatTechpackJson(formData?.company_techpack)}
                  </pre>
                </div> */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Upload Your Company’s Tech Pack Format
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload your existing tech pack template (CSV, PDF, Excel). Max 3 files.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => techPackfileRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>

                  <input
                    ref={techPackfileRef}
                    type="file"
                    accept=".pdf,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden"
                    onChange={handleTechPackUpload}
                    multiple
                  />

                  {TechpackuploadError && <p className="text-xs text-red-500 mt-1">{TechpackuploadError}</p>}

                  {/* List of files - DB + Local */}
                  {dbTechPackFiles.length > 0 || techPackFiles.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {/* Database Files */}
                      {dbTechPackFiles.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {dbTechPackFiles.map((file, index) => (
                              <button
                                key={`db-${index}`}
                                className={`text-left p-2 border rounded-md text-sm relative group ${selectedSource === "db" && selectedTechPackIndex === index
                                  ? "border-primary bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                                  }`}
                                onClick={() => {
                                  setSelectedTechPackIndex(index);
                                  setSelectedSource("db");
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{file.name || file.fileName || `Company Techpack ${index + 1}`}</span>
                                </div>

                                {/* Remove button replaced with a div acting as a button */}
                                <div
                                  role="button"
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove the file from DB files
                                    const updatedDbFiles = dbTechPackFiles.filter((_, i) => i !== index);
                                    setDbTechPackFiles(updatedDbFiles);

                                    // Reset selection if removing selected file
                                    if (selectedSource === "db" && selectedTechPackIndex === index) {
                                      setSelectedTechPackIndex(null);
                                    }

                                    // Update formData - will be saved when user clicks Save button
                                    setFormData((prev) => ({
                                      ...prev,
                                      company_techpack: [...updatedDbFiles, ...techPackDataList],
                                    }));

                                    toast({
                                      title: "File Marked for Removal",
                                      description: "Click 'Save Brand DNA' to apply changes.",
                                    });
                                  }}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Local Uploaded Files */}
                      {techPackFiles.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {techPackFiles.map((file, index) => (
                              <div
                                key={`local-${index}`}
                                role="button"
                                tabIndex={0}
                                className={`text-left p-2 border rounded-md text-sm relative group cursor-pointer ${selectedSource === "local" && selectedTechPackIndex === index
                                  ? "border-primary bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                                  }`}
                                onClick={() => {
                                  setSelectedTechPackIndex(index);
                                  setSelectedSource("local");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    setSelectedTechPackIndex(index);
                                    setSelectedSource("local");
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{file.name}</span>
                                </div>

                                {/* Remove button */}
                                <button
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTechPackFiles((prev) => prev.filter((_, i) => i !== index));
                                    setTechPackDataList((prev) => prev.filter((_, i) => i !== index));

                                    if (selectedSource === "local" && selectedTechPackIndex === index) {
                                      setSelectedTechPackIndex(null);
                                    }
                                  }}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-3">No files uploaded yet.</p>
                  )}
                </div>

                {/* Show JSON of selected file */}
                <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm overflow-x-auto mt-4">
                  <pre className="text-zinc-900 whitespace-pre-wrap break-words">
                    {selectedTechPackIndex !== null && selectedSource
                      ? formatTechpackJson(
                        selectedSource === "db"
                          ? dbTechPackFiles[selectedTechPackIndex]
                          : techPackDataList[selectedTechPackIndex]
                      )
                      : "Select a file to view its data"}
                  </pre>
                </div>
              </>
            </CardContent>
          </Card>

          {/* C. Live Summary */}
          <Card className="bg-white border-2 border-[#d3c7b9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900 flex flex-wrap items-center gap-2">
                <Eye className="h-5 w-5 shrink-0" />
                Live Summary
                <Badge className="bg-[#1C1917] text-white text-xs sm:text-sm text-center">
                  Will auto-apply to prompts (toggleable)
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm overflow-x-auto">
                <pre className="text-zinc-900 whitespace-pre-wrap break-words">
                  {`{
  "brand_name": "${formData.brandName}",
  "category": "${formData.category}",
  "style_keywords": [${formData.styleKeywords.map((k) => `"${k}"`).join(", ")}],
  "color_palette": [${formData.colorPalette.map((c) => `"${c}"`).join(", ")}],
  "materials": [${formData.materials.map((m) => `"${m}"`).join(", ")}],
  "patterns": [${formData.patterns.map((p) => `"${p}"`).join(", ")}],
  "audience": "${formData.targetAudience}",
  "inspiration_images": [${formData.inspirationImages.length} items]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-[#f5f4f0] border-t border-[#d3c7b9] p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button variant="outline" onClick={handleBack} disabled={currentPage === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentPage < 2 ? (
            <Button onClick={handleNext} variant="default">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} variant="default" disabled={loadingUpdateCreatorDna || loadingCreateDna}>
              {loadingUpdateCreatorDna || loadingCreateDna ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Brand Dna
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Brand DNA
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      {/* <LogoInstructionModal open={modalOpen} onClose={handleModalClose} /> */}
    </div>
  );
}

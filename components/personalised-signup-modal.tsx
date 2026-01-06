"use client";
import React, { useState } from "react";
import { AlertDialog, AlertDialogContent, VisuallyHidden, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  X,
  ArrowRight,
  Check,
  ArrowLeft,
  Search,
  Sparkles,
  Rocket,
  Building2,
  PartyPopper,
  SkipForward,
  Upload,
  Image as ImageIcon,
  ShoppingCart,
  Home,
  Smartphone,
  Watch,
  Flower2,
  Baby,
  Package,
  Armchair,
  Footprints,
  Shirt,
  Layers,
  Plus,
  TrendingUp,
  RefreshCw,
  FileText,
  GraduationCap,
  Store,
  User,
  Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import createPersonalisedCreatorProfile from "@/lib/supabase/creator";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface PersonalisedSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = {
  PERSONA: 1,
  CATEGORY: 2,
  GOAL: 3,
  EXPERIENCE: 4,
  LOGO: 5,
  OUTPUT: 6,
};

const PERSONAS = [
  { id: "exploring", label: "I'm exploring what Genpire can do", icon: Search },
  { id: "first_product", label: "I want to create my first product", icon: Sparkles },
  { id: "brand_line", label: "I have a brand and want to develop a new line", icon: Rocket },
  { id: "company", label: "I work at a company and want to speed up creation & specs", icon: Building2 },
];

const CATEGORIES = [
  { id: "consumer_goods", label: "Consumer goods", icon: ShoppingCart },
  { id: "home_lifestyle", label: "Home & lifestyle", icon: Home },
  { id: "tech_gadgets", label: "Tech & gadgets", icon: Smartphone },
  { id: "accessories", label: "Accessories", icon: Watch },
  { id: "beauty_wellness", label: "Beauty & wellness", icon: Flower2 },
  { id: "toys_kids", label: "Toys & kids", icon: Baby },
  { id: "packaging", label: "Packaging", icon: Package },
  { id: "furniture", label: "Furniture", icon: Armchair },
  { id: "footwear", label: "Footwear", icon: Footprints },
  { id: "apparel", label: "Apparel", icon: Shirt },
  { id: "other", label: "Other / mixed categories", icon: Layers },
];

const GOALS = [
  { id: "new_product", label: "Create a new product", icon: Plus },
  { id: "extend_line", label: "Build/extend a product line", icon: TrendingUp },
  { id: "improve", label: "Improve or iterate an existing product", icon: RefreshCw },
  { id: "specs", label: "Generate specifications / technical files", icon: FileText },
  { id: "learn", label: "Learn how Genpire works", icon: GraduationCap },
  { id: "new_brand", label: "Launch my own brand", icon: Store },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", description: "New to product dev", icon: User },
  { id: "intermediate", label: "Intermediate", description: "Have done this before", icon: Users },
  { id: "advanced", label: "Advanced", description: "Professional / Expert", icon: Briefcase },
];

const PersonalisedSignupModal: React.FC<PersonalisedSignupModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(STEPS.PERSONA);
  const [selections, setSelections] = useState<{
    persona: string;
    category: string[];
    goal: string;
    experience: string;
    avatar_url: string;
  }>({
    persona: "",
    category: [],
    goal: "",
    experience: "",
    avatar_url: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];

    const fileTypeValid = validTypes.includes(file.type);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const extensionValid = validExtensions.includes(fileExtension);

    if (!fileTypeValid || !extensionValid) {
      setUploadError("Please upload a PNG, JPG or JPEG file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    try {
      const base64String = await convertFileToBase64(file);
      setLogoPreview(base64String);
      setSelections((prev) => ({
        ...prev,
        avatar_url: base64String,
      }));
    } catch (error) {
      setUploadError("Failed to convert file to base64");
      console.error(error);
    }
  };

  const handleSelection = (key: string, value: string) => {
    if (key === "category") {
      setSelections((prev) => {
        const currentCategories = prev.category;
        if (currentCategories.includes(value)) {
          return { ...prev, category: currentCategories.filter((c) => c !== value) };
        } else {
          return { ...prev, category: [...currentCategories, value] };
        }
      });
    } else {
      setSelections((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleNext = () => {
    if (step < STEPS.OUTPUT) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > STEPS.PERSONA) {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Find labels from IDs
    const personaLabel = PERSONAS.find((p) => p.id === selections.persona)?.label || selections.persona;
    const goalLabel = GOALS.find((g) => g.id === selections.goal)?.label || selections.goal;
    const categoryLabels = selections.category
      .map((catId) => CATEGORIES.find((c) => c.id === catId)?.label)
      .filter(Boolean)
      .join(", ");

    // Save to database using createPersonalisedCreatorProfile
    try {
      const result = await createPersonalisedCreatorProfile({
        persona: personaLabel,
        categories: categoryLabels,
        goal: goalLabel,
        experience: selections.experience || "beginner",
        avatar_url: selections.avatar_url,
      });

      if (result.success) {
        console.log("Data saved successfully:", result.data);
        // toast({
        //   title: "Success",
        //   description: "Data saved successfully",
        //   variant: "default",
        // });
      } else {
        console.error("Failed to save data:", result.error);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }

    // Proceed to next step
    onComplete();
  };

  const isStepValid = () => {
    switch (step) {
      case STEPS.PERSONA:
        return !!selections.persona;
      case STEPS.CATEGORY:
        return selections.category.length > 0;
      case STEPS.GOAL:
        return !!selections.goal;
      case STEPS.EXPERIENCE:
        return !!selections.experience;
      case STEPS.LOGO:
        return true; // Logo upload is optional
      default:
        return true;
    }
  };

  // const getPersonalizedMessage = () => {
  //     const { persona, category } = selections;

  //     if (persona === "exploring" || selections.goal === "learn") {
  //         return "Awesome — let's play around with ideas and show you how Genpire works.";
  //     }
  //     if (persona === "brand_line" || category.includes("Home & lifestyle")) {
  //         return "Perfect. Let's shape your next product line and prepare everything your manufacturer needs.";
  //     }
  //     if (category.includes("Tech & gadgets")) {
  //         return "Great — I'll help you design your gadget, refine key details, and generate the specs for production.";
  //     }

  //     // Default fallback
  //     return "Great — I'll help you design your product, refine key details, and generate the specs for production.";
  // };

  const renderStep = () => {
    switch (step) {
      case STEPS.PERSONA:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 justify-center">
                <Image src="/favicon.png" alt="Gen-P" width={36} height={36} />
                <span>Welcome to Genpire</span>
              </h2>
              <p className="text-zinc-600 text-sm">
                You've just joined the world's first agentic platform for creating physical products — faster, smarter,
                and with real factory-ready results.
              </p>
            </div>
            <h3 className="text-xl font-semibold text-center text-zinc-900">What brings you to Genpire today?</h3>
            <div className="grid grid-cols-1 gap-3">
              {PERSONAS.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelection("persona", p.id)}
                    className={cn(
                      "flex items-center p-4 text-left border rounded-xl transition-all duration-200 hover:border-zinc-900 hover:bg-zinc-50",
                      selections.persona === p.id
                        ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                        : "border-zinc-200"
                    )}
                  >
                    <IconComponent className="h-6 w-6 mr-4 text-zinc-700" />
                    <span className="font-medium text-zinc-900">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case STEPS.CATEGORY:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-zinc-900">What type of product are you working on?</h2>
            <p className="text-center text-zinc-500 text-sm">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = selections.category.includes(cat.id);
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelection("category", cat.id)}
                    className={cn(
                      "p-3 text-left border rounded-xl transition-all duration-200 hover:border-zinc-900 hover:bg-zinc-50 text-sm font-medium relative flex items-center gap-2",
                      isSelected ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200"
                    )}
                  >
                    <IconComponent className="h-5 w-5 text-zinc-700 flex-shrink-0" />
                    <span className="flex-1">{cat.label}</span>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-zinc-900" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case STEPS.GOAL:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-zinc-900">What are you hoping to achieve right now?</h2>
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map((g) => {
                const IconComponent = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => handleSelection("goal", g.id)}
                    className={cn(
                      "flex items-center p-4 text-left border rounded-xl transition-all duration-200 hover:border-zinc-900 hover:bg-zinc-50",
                      selections.goal === g.id ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200"
                    )}
                  >
                    <IconComponent className="h-6 w-6 mr-4 text-zinc-700 flex-shrink-0" />
                    <span className="font-medium text-zinc-900 flex-1">{g.label}</span>
                    {selections.goal === g.id && <Check className="h-5 w-5 text-zinc-900" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case STEPS.EXPERIENCE:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-zinc-900">How familiar are you with product design?</h2>
            <div className="grid grid-cols-1 gap-3">
              {EXPERIENCE_LEVELS.map((l) => {
                const IconComponent = l.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleSelection("experience", l.id)}
                    className={cn(
                      "p-4 text-left border rounded-xl transition-all duration-200 hover:border-zinc-900 hover:bg-zinc-50 flex items-start gap-4",
                      selections.experience === l.id
                        ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                        : "border-zinc-200"
                    )}
                  >
                    <IconComponent className="h-6 w-6 text-zinc-700 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="font-bold text-zinc-900">{l.label}</div>
                      <div className="text-sm text-zinc-500">{l.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case STEPS.LOGO:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900">Upload Your Logo (Optional)</h2>
              <p className="text-zinc-500 text-sm">Add your brand logo to personalize your experience</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {/* Upload Area */}
              <label
                htmlFor="logo-upload"
                className={cn(
                  "w-full max-w-md border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 hover:border-zinc-900 hover:bg-zinc-50",
                  uploadError ? "border-red-500" : "border-zinc-300"
                )}
              >
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />

                {logoPreview ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-zinc-200">
                      <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                    </div>
                    <p className="text-sm text-zinc-600">Click to change logo</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <div className="p-4 bg-zinc-100 rounded-full">
                      <Upload className="h-8 w-8 text-zinc-600" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Click to upload</p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG or JPEG (max 5MB)</p>
                    </div>
                  </div>
                )}
              </label>

              {/* Error Message */}
              {uploadError && <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{uploadError}</div>}
            </div>
          </div>
        );
      case STEPS.OUTPUT:
        return (
          <div className="space-y-8 text-center py-8">
            <div className="space-y-4 text-center flex flex-col items-center">
              <div className="p-4 rounded-xl w-fit">
                <Image src="/g-black.png" alt="Gen-P" width={40} height={40} />
              </div>

              <h2 className="text-2xl font-semibold text-zinc-800">You're all set!</h2>

              <p className="text-zinc-500 max-w-sm text-lg font-medium">
                Choose a plan to begin your personalized workflow.
              </p>
            </div>

            <Button
              variant="default"
              onClick={handleComplete}
              className="w-full h-12 text-lg bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl"
            >
              Choose a Plan <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-xl bg-[#f5f4f0] rounded-2xl border p-0 shadow-xl overflow-hidden">
        <VisuallyHidden>
          <AlertDialogTitle>Personalized Onboarding</AlertDialogTitle>
        </VisuallyHidden>

        <div className="relative p-6 sm:p-8">
          {/* Progress Bar */}
          {step < STEPS.OUTPUT && (
            <div className="absolute top-0 left-0 w-full h-1 bg-[#f5f4f0]">
              <div
                className="h-full bg-zinc-900 transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px] flex flex-col justify-center"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < STEPS.OUTPUT && (
            <div className="flex justify-between mt-8 pt-4 border-t border-[#f5f4f0]">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === STEPS.PERSONA}
                className={cn("text-zinc-800 hover:text-zinc-900", step === STEPS.PERSONA && "invisible")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => handleComplete()}
                  className="text-zinc-800 hover:text-zinc-900 min-w-[100px]"
                  variant="ghost"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[100px]"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PersonalisedSignupModal;

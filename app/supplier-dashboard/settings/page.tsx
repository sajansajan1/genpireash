"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Upload, Building2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { createSupplierProfile, updateSupplierProfile } from "@/lib/supabase/supplier";
import { useUserStore } from "@/lib/zustand/useStore";
import { Manufacturing, supplierProfile } from "@/lib/types/tech-packs";
import PaypalCustomCard from "@/components/paypal-card/page";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelSubscription } from "@/app/actions/cancel-subscription";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import SupplierPlans from "@/components/modals/supplier-payment-card";
import {
  productCategoryOptions,
  capabilityOptions,
  materialOptions,
  certificationOptions,
  exportMarkets,
} from "@/lib/types/manufacturing_capability";

export default function SupplierSettingsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultTab = searchParams.get("tab") || "account";
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { user, supplierProfile, setSupplierProfile } = useUserStore();
  const [paymentsHistory, setPaymentsHistory] = useState<any>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  // Form state
  const [formData, setFormData] = useState<{
    company_name: string;
    full_name: string;
    email: string;
    contact: string;
    location: string;
    address: string;
    website: string;
    company_description: string;
    manufacturing: Manufacturing;
  }>({
    company_name: "",
    full_name: "",
    email: "",
    contact: "",
    location: "",
    address: "",
    website: "",
    company_description: "",
    manufacturing: {
      product_categories: [] as string[],
      product_capability: [] as string[],
      material_specialist: [] as string[],
      export_market: [] as string[],
      moq: "",
      leadTimeMin: "",
      leadTimeMax: "",
      samplePricing: "",
      productionCapacity: "",
      certifications: [] as string[],
      isExclusive: false,
      aboutFactory: "",
      created_at: "",
      updated_at: "",
      factory_gallery: null,
      id: "",
      product_images: null,
      manufacturingID: "",
      website: "",
    },
  });
  const [productCategories, setProductCategories] = useState<string[]>(
    formData.manufacturing?.product_categories || []
  );
  const [capabilities, setCapabilities] = useState<string[]>(formData.manufacturing?.product_capability || []);
  const [exportMarket, setExportMarket] = useState<string[]>(formData.manufacturing?.export_market || []);
  const [materialSpecialties, setMaterialSpecialties] = useState<string[]>(
    formData.manufacturing?.material_specialist || []
  );
  const [moq, setMoq] = useState(formData.manufacturing?.moq || "");
  const [leadTimeMin, setLeadTimeMin] = useState(formData.manufacturing?.leadTimeMin || "");
  const [leadTimeMax, setLeadTimeMax] = useState(formData.manufacturing?.leadTimeMax || "");
  const [samplePricing, setSamplePricing] = useState(formData.manufacturing?.samplePricing || "");
  const [productionCapacity, setProductionCapacity] = useState(formData.manufacturing?.productionCapacity || "");
  const [certifications, setCertifications] = useState<string[]>(formData.manufacturing?.certifications || []);
  const [aboutFactory, setAboutFactory] = useState(formData.manufacturing?.aboutFactory || "");
  useEffect(() => {
    if (supplierProfile) {
      setFormData({
        company_name: supplierProfile.company_name || "",
        full_name: supplierProfile.full_name || "",
        email: supplierProfile.email || "",
        contact: supplierProfile.contact || "",
        location: supplierProfile.location || "",
        address: supplierProfile.address || "",
        website: supplierProfile.website || "",
        company_description: supplierProfile.company_description || "",
        manufacturing: supplierProfile.manufacturing || {
          product_categories: [],
          product_capability: [],
          material_specialist: [],
          export_market: [],
          moq: "",
          leadTimeMin: "",
          leadTimeMax: "",
          samplePricing: "",
          productionCapacity: "",
          certifications: [],
          aboutFactory: "",
        },
      });

      setProductCategories(supplierProfile.manufacturing?.product_categories || []);
      setCapabilities(supplierProfile.manufacturing?.product_capability || []);
      setMaterialSpecialties(supplierProfile.manufacturing?.material_specialist || []);
      setExportMarket(supplierProfile.manufacturing?.export_market || []);

      setMoq(supplierProfile.manufacturing?.moq || "");
      setLeadTimeMin(supplierProfile.manufacturing?.leadTimeMin || "");
      setLeadTimeMax(supplierProfile.manufacturing?.leadTimeMax || "");
      setSamplePricing(supplierProfile.manufacturing?.samplePricing || "");
      setProductionCapacity(supplierProfile.manufacturing?.productionCapacity || "");

      setCertifications(supplierProfile.manufacturing?.certifications || []);
      setAboutFactory(supplierProfile.manufacturing?.aboutFactory || "");

      if (supplierProfile.company_logo) {
        setImagePreview(supplierProfile.company_logo);
      }
    }
  }, [supplierProfile]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, JPG)",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle manufacturing field changes
  const handleManufacturingInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      manufacturing: {
        ...prev.manufacturing,
        [field]: value,
      },
    }));
  };

  // Toggle checkbox values for arrays
  const toggleCheckboxValue = (
    currentArray: string[],
    value: string,
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    field: string
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    setArray(newArray);

    // Update formData manufacturing
    setFormData((prev) => ({
      ...prev,
      manufacturing: {
        ...prev.manufacturing,
        [field]: newArray,
      },
    }));
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare image data for upload
      let imageData = "";
      if (imageFile) {
        // Convert image file to base64 for upload
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      // Prepare the complete payload with manufacturing data
      const payload = {
        company_name: formData.company_name,
        full_name: formData.full_name,
        email: formData.email,
        contact: formData.contact,
        location: formData.location,
        address: formData.address,
        website: formData.website,
        company_description: formData.company_description,
        company_logo: imageData,
        manufacturing: {
          product_categories: productCategories,
          product_capability: capabilities,
          material_specialist: materialSpecialties,
          export_market: exportMarket,
          moq: moq,
          leadTimeMin: leadTimeMin,
          leadTimeMax: leadTimeMax,
          samplePricing: samplePricing,
          productionCapacity: productionCapacity,
          certifications: certifications,
          aboutFactory: aboutFactory,
        },
      };

      const result = await updateSupplierProfile(payload);

      if (result) {
        await setSupplierProfile(result ?? null);

        toast({ title: "Profile updated!" });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to update profile",
          description: "Failed to update profile!",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "There was an issue updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleCancelSubscription = async (des: string) => {
  //   const { success, data, error } = await cancelSubscription({
  //     subId: getCreatorCredits?.subscription_id,
  //     des: des
  //   });

  //   if (success) {
  //     toast({
  //       variant: "default",
  //       title: "Subscription Cancelled",
  //       description: "Your subscription has been cancelled",
  //     });
  //   }

  //   await refresCreatorCredits();
  //   setShowCancelModal(false);
  // };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company information and how it appears to creators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview} />
                    <AvatarFallback>
                      <Building2 className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <Input
                    ref={fileInputRef}
                    id="company-logo"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input
                      id="contactName"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  rows={4}
                  value={formData.company_description}
                  onChange={(e) => handleInputChange("company_description", e.target.value)}
                  placeholder="Describe your company, services, and expertise..."
                />
              </div>
              <div className="space-y-4">
                {/* Product Categories */}
                <div>
                  <Label className="text-base font-medium">Product Categories</Label>
                  <p className="text-sm text-[#1C1917] mb-3">Select all product types you can manufacture</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {productCategoryOptions.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={productCategories.includes(category)}
                          onCheckedChange={() =>
                            toggleCheckboxValue(productCategories, category, setProductCategories, "product_categories")
                          }
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-base font-medium">Capabilities</Label>
                  <p className="text-sm text-[#1C1917] mb-3">Select all capabilities your factory offers</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {capabilityOptions.map((capability) => (
                      <div key={capability} className="flex items-center space-x-2">
                        <Checkbox
                          id={`capability-${capability}`}
                          checked={capabilities.includes(capability)}
                          onCheckedChange={() =>
                            toggleCheckboxValue(capabilities, capability, setCapabilities, "product_capability")
                          }
                        />
                        <Label htmlFor={`capability-${capability}`}>{capability}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Specialties */}
                <div>
                  <Label className="text-base font-medium">Material Specialties</Label>
                  <p className="text-sm text-[#1C1917] mb-3">Select all materials you work with</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {materialOptions.map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={`material-${material}`}
                          checked={materialSpecialties.includes(material)}
                          onCheckedChange={() =>
                            toggleCheckboxValue(
                              materialSpecialties,
                              material,
                              setMaterialSpecialties,
                              "material_specialist"
                            )
                          }
                        />
                        <Label htmlFor={`material-${material}`}>{material}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                    <Input
                      id="moq"
                      type="number"
                      placeholder="e.g., 100"
                      value={moq}
                      onChange={(e) => {
                        setMoq(e.target.value);
                        handleManufacturingInputChange("moq", e.target.value);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lead Time (in days)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="leadTimeMin"
                        type="number"
                        placeholder="Min"
                        className="w-1/2"
                        value={leadTimeMin}
                        onChange={(e) => {
                          setLeadTimeMin(e.target.value);
                          handleManufacturingInputChange("leadTimeMin", e.target.value);
                        }}
                      />
                      <span>to</span>
                      <Input
                        id="leadTimeMax"
                        type="number"
                        placeholder="Max"
                        className="w-1/2"
                        value={leadTimeMax}
                        onChange={(e) => {
                          setLeadTimeMax(e.target.value);
                          handleManufacturingInputChange("leadTimeMax", e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="samplePricing">Sample Pricing</Label>
                    <Input
                      id="samplePricing"
                      placeholder="e.g., $50-100"
                      value={samplePricing}
                      onChange={(e) => {
                        setSamplePricing(e.target.value);
                        handleManufacturingInputChange("samplePricing", e.target.value);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productionCapacity">Monthly Production Capacity</Label>
                    <Input
                      id="productionCapacity"
                      placeholder="e.g., 5000 units"
                      value={productionCapacity}
                      onChange={(e) => {
                        setProductionCapacity(e.target.value);
                        handleManufacturingInputChange("productionCapacity", e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <Label className="text-base font-medium">Certifications</Label>
                  <p className="text-sm text-[#1C1917] mb-3">Select all certifications your facility has</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {certificationOptions.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${cert}`}
                          checked={certifications.includes(cert)}
                          onCheckedChange={() =>
                            toggleCheckboxValue(certifications, cert, setCertifications, "certifications")
                          }
                        />
                        <Label htmlFor={`cert-${cert}`}>{cert}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/*Export Market  */}
                <div>
                  <Label className="text-base font-medium">Export Market</Label>
                  <p className="text-sm text-[#1C1917] mb-3">Select all export markets you work with</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {exportMarkets.map((market) => (
                      <div key={market} className="flex items-center space-x-2">
                        <Checkbox
                          id={`market-${market}`}
                          checked={exportMarket.includes(market)}
                          onCheckedChange={() =>
                            toggleCheckboxValue(exportMarket, market, setExportMarket, "export_market")
                          }
                        />
                        <Label htmlFor={`market-${market}`}>{market}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About Factory */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="aboutFactory">About Your Factory</Label>
                  <Textarea
                    id="aboutFactory"
                    placeholder="Tell us more about your manufacturing facility, history, and what makes you unique..."
                    className="min-h-[100px]"
                    value={aboutFactory}
                    onChange={(e) => {
                      setAboutFactory(e.target.value);
                      handleManufacturingInputChange("aboutFactory", e.target.value);
                    }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          {/* Credits Balance Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Your Credits</h3>
                  <p className="text-[#1C1917]">Use credits to generate AI tech packs</p>

                  {/* Plan Info */}
                  <div className="mt-2 text-sm text-zinc-700 space-y-1">
                    <p>
                      <span className="font-medium">Plan Type:</span>{" "}
                      <strong>
                        {/* {getCreatorCredits?.planType?.charAt(0).toUpperCase() +
                          getCreatorCredits?.planType?.slice(1).toLowerCase() || "None"} */}
                      </strong>
                    </p>
                    <p>
                      <span className="font-medium">Membership:</span>{" "}
                      <strong>
                        {/* {getCreatorCredits?.membership?.charAt(0).toUpperCase() +
                          getCreatorCredits?.membership?.slice(1).toLowerCase() || "None"} */}
                      </strong>
                    </p>
                    <p>
                      <span className="font-medium">Next Billing Date:</span>{" "}
                      <strong>
                        {/* {getCreatorCredits?.expires_at
                          ? new Date(getCreatorCredits?.expires_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "none"} */}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* <div className="text-4xl font-bold text-zinc-900">{getCreatorCredits?.credits}</div> */}
                  <div className="text-sm text-[#1C1917]">
                    Credits
                    <br />
                    Remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Purchase Your Subscription</CardTitle>
              <CardDescription>
                Generate complete products and technical specification ready for the factory and access our innovative
                creation tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Simple, Flexible Plans</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Subscribe or buy credits once — no hidden fees, no expiration dates, cancel anytime.
                </p>
              </div>

              <SupplierPlans />

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-4 text-sm text-[#1C1917]">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    Instant Activation
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    No Expiration
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                    No Monthly Fees
                  </div>
                </div>
                <Button variant="link" onClick={() => router.push("/pricing")}>
                  View all plans and features →
                </Button>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payment history.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentsHistory?.length === 0 ? (
                  <p>No payment history found.</p>
                ) : (
                  paymentsHistory?.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="text-sm text-[#1C1917]">{payment?.quantity} Tech Pack Credits</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${payment.price}</p>
                        <p className="text-sm text-green-600">Paid</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-lg bg-[#f5f4f0] border border-[#d3c7b9] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black text-center">Cancel Subscription</DialogTitle>
            <DialogDescription className="text-center text-black/70 mt-2">
              We're sorry to see you go! Please let us know why you're cancelling.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium text-black mb-2">Reason for Cancellation</label>
            <Textarea
              placeholder="Let us know why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-[#d3c7b9] focus:ring-2 focus:ring-black placeholder:text-[#0e2a47]/50"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCancelModal(false)} className="text-black border-black">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

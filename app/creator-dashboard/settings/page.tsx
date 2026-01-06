"use client";

declare global {
  interface Window {
    paypal?: any;
  }
}

import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Check,
  CreditCard,
  Zap,
  Star,
  Building,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPayments } from "@/lib/supabase/payments";
import { formatDate } from "@/lib/utils/formatdate";
import { Badge } from "@/components/ui/badge";
import { packages } from "@/lib/utils/payments";
import { useUpdateCreatorProfileStore } from "@/lib/zustand/creator/updateCreatorProfile";
import { creatorProfile } from "@/lib/types/tech-packs";
import { useUserStore } from "@/lib/zustand/useStore";
import PaypalCustomCard from "@/components/paypal-card/page";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelSubscription } from "@/app/actions/cancel-subscription";
import { changeSubscriptionPlan, getAvailablePlans } from "@/app/actions/change-subscription-plan";
import { deleteUserAccount } from "@/lib/supabase/deleteUser";

type FormData = {
  avatar_url?: string;
  full_name?: string;
  email?: string;
  contact?: string;
  country?: string;
  categories?: string;
  bio?: string;
  website_url?: string;
  brand_description?: string;
  brand_size?: string;
  target_market?: string;
  order_size?: string;
  address?: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "account";
  const [paymentsHistory, setPaymentsHistory] = useState<any>([]);
  const [formData, setFormData] = useState<Partial<creatorProfile>>({});
  const [designFilePreview, setDesignFilePreview] = useState<string | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Array<{
    productId: string;
    name: string;
    membership: string;
    credits: number;
    price: number;
    planType: string;
  }>>([]);
  const { setUpdateCreatorProfile } = useUpdateCreatorProfileStore();
  const { user, creatorProfile, setCreatorProfile } = useUserStore();
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  useEffect(() => {
    if (creatorProfile) {
      setFormData(creatorProfile);
    }
  }, [creatorProfile]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (user?.id) {
          const [payments] = await Promise.all([getPayments(user.id)]);
          setPaymentsHistory(payments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  const handleCancelSubscription = async (des: string) => {
    setCancelLoading(true);
    try {
      if (!getCreatorCredits?.subscription_id) {
        toast({
          variant: "default",
          title: "Subscription Not Available",
          description:
            "Subscription not available! Please refresh the webpage or try again later.",
        });
        return;
      }

      // Attempt cancellation using unified action (supports both Polar and PayPal)
      const { success, error } = await cancelSubscription({
        subscriptionId: getCreatorCredits.subscription_id,
        reason: des,
      });

      // Handle server errors
      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to Cancel Subscription",
          description: error,
        });
        return;
      }

      // Success
      if (success) {
        toast({
          variant: "default",
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully.",
        });
      }

      await refresCreatorCredits();
      setShowCancelModal(false);
    } catch (err: any) {
      // Catch unexpected JS/runtime errors
      console.error("Cancel subscription error:", err);

      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await deleteUserAccount();
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Failed to Delete Account",
        description: result.error,
      });
      setShowDeleteAccountModal(false);
    }
    setShowDeleteAccountModal(false);
  }

  // Handle opening upgrade modal - fetch available plans
  const handleOpenUpgradeModal = async () => {
    if (!getCreatorCredits?.membership || !getCreatorCredits?.planType) return;

    const plans = await getAvailablePlans(
      getCreatorCredits.membership,
      getCreatorCredits.planType
    );
    setAvailablePlans(plans);
    setShowUpgradeModal(true);
  };

  // Handle plan change (upgrade/downgrade)
  const handleChangePlan = async (newProductId: string) => {
    if (!getCreatorCredits?.subscription_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No active subscription found.",
      });
      return;
    }

    setUpgradeLoading(true);
    try {
      const result = await changeSubscriptionPlan({
        subscriptionId: getCreatorCredits.subscription_id,
        newProductId,
      });

      if (result.success && result.newPlan) {
        toast({
          variant: "default",
          title: "Plan Changed Successfully",
          description: `You've switched to the ${result.newPlan.name}. Your new credit allocation is ${result.newPlan.credits} credits.`,
        });
        await refresCreatorCredits();
        setShowUpgradeModal(false);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Change Plan",
          description: result.error || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Change plan error:", err);
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDesignFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setDesignFilePreview(base64String);
      setFormData((prev) => ({
        ...prev,
        avatar_url: base64String, // or whatever field you're using to store the image
      }));
    } catch (error) {
      setUploadError("Failed to convert file to base64");
      console.error(error);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // This automatically adds the "data:image/*;base64," prefix
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (updatedData: creatorProfile) => {
    try {
      const { success, data, error } = await setUpdateCreatorProfile({
        id: creatorProfile?.id || "",
        full_name: updatedData.full_name || "",
        avatar_url: updatedData.avatar_url || "",
        email: updatedData.email || "",
        contact: updatedData.contact || "",
        country: updatedData.country || "",
        categories: updatedData.categories || "",
        bio: updatedData.bio || "",
        website_url: updatedData.website_url || "",
        brand_description: updatedData.brand_description || "",
        brand_size: updatedData.brand_size || "",
        target_market: updatedData.target_market || "",
        order_size: updatedData.order_size || "",
      });
      if (success) {
        setCreatorProfile(data ?? null);
        toast({ title: "Profile updated!" });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to update profile",
          description: error || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: "Failed to update profile" });
    }
  };
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
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how it appears to suppliers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={formData.avatar_url || designFilePreview || ""}
                      alt="Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="flex items-center justify-center text-center text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap px-2">
                      {formData.full_name || ""}
                    </AvatarFallback>
                  </Avatar>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                    <Input
                      ref={fileInputRef}
                      id="design-file"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleDesignFileUpload}
                    />
                  </Button>

                  {uploadError && (
                    <p className="text-sm text-red-500">{uploadError}</p>
                  )}
                </div>
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      name="contact"
                      value={formData.contact || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Location</Label>
                <Select
                  value={formData.country || "us"}
                  onValueChange={(value) =>
                    handleSelectChange("country", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories">Business Category</Label>
                <Select
                  value={formData.categories || "Apparel"}
                  onValueChange={(value) =>
                    handleSelectChange("categories", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apparel">Apparel & Fashion</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Footwear">Footwear</SelectItem>
                    <SelectItem value="Home Goods">Home Goods</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Beauty & Personal Care">
                      Beauty & Personal Care
                    </SelectItem>
                    <SelectItem value="Toys & Gadgets">
                      Toys & Gadgets
                    </SelectItem>
                    <SelectItem value="Food & Beverage">
                      Food & Beverage
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio || ""}
                  onChange={handleChange}
                />
                <p className="text-xs text-[#1C1917]">
                  Brief description of you or your brand that will be visible to
                  suppliers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  name="website_url"
                  value={formData.website_url || ""}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSaveProfile(formData)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          {/* Brand Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>
                Tell suppliers about your brand to help them understand your
                needs better.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand_description">Brand Description</Label>
                <Textarea
                  id="brand_description"
                  name="brand_description"
                  rows={4}
                  value={formData.brand_description || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Size</Label>
                <RadioGroup
                  value={formData.brand_size || "small"}
                  onValueChange={(value) =>
                    handleSelectChange("brand_size", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="startup" id="startup" />
                    <Label htmlFor="startup">Startup/New Brand</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">Small (1-10 employees)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium (11-50 employees)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large">Large (50+ employees)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_market">Target Market</Label>
                <Input
                  id="target_market"
                  name="target_market"
                  value={formData.target_market || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_size">Typical Order Size</Label>
                <Input
                  id="order_size"
                  name="order_size"
                  value={formData.order_size || ""}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSaveProfile(formData)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          {/* Subscription Cancelled Alert */}
          {getCreatorCredits?.subscription_status_canceled && (
            <div className="bg-stone-100 border border-stone-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#1C1917]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#1C1917]">Subscription Cancelled</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Your subscription has been cancelled. You can continue using your remaining credits until{" "}
                    <strong className="text-[#1C1917]">
                      {getCreatorCredits?.expires_at
                        ? new Date(getCreatorCredits.expires_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "the end of your billing period"}
                    </strong>
                    . After that, you&apos;ll need to purchase a new plan to continue generating tech packs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credits Balance Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    Your Credits
                    {getCreatorCredits?.subscription_status_canceled && (
                      <Badge variant="secondary" className="bg-stone-200 text-[#1C1917] border border-stone-300">Cancelled</Badge>
                    )}
                  </h3>

                  <p className="text-[#1C1917]">
                    Use credits to generate AI tech packs
                  </p>

                  {/* Plan Info */}
                  <div className="mt-2 text-sm text-zinc-700 space-y-1">
                    <p>
                      <span className="font-medium">Plan Type:</span>{" "}
                      <strong>
                        {getCreatorCredits?.planType
                          ? getCreatorCredits.planType.charAt(0).toUpperCase() +
                          getCreatorCredits.planType.slice(1).toLowerCase()
                          : "None"}
                      </strong>
                    </p>
                    <p>
                      <span className="font-medium">Membership:</span>{" "}
                      <strong>
                        {getCreatorCredits?.membership
                          ? getCreatorCredits?.membership
                            ?.charAt(0)
                            .toUpperCase() +
                          getCreatorCredits?.membership
                            ?.slice(1)
                            .toLowerCase()
                          : "None"}
                      </strong>
                    </p>
                    <p>
                      <span className="font-medium">Next Billing Date:</span>{" "}
                      <strong>
                        {getCreatorCredits?.expires_at
                          ? new Date(
                            getCreatorCredits?.expires_at
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "none"}
                      </strong>
                    </p>
                    {/* <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={
                          getCreatorCredits?.membershipStatus === "active"
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {getCreatorCredits?.membershipStatus || "inactive"}
                      </span>
                    </p> */}
                  </div>
                </div>

                {/* {getCreatorCredits?.hasEverHadSubscription && (
                  <div>
                    <Button onClick={() => setShowCancelModal(true)}>Cancel Subscription</Button>
                  </div>
                )} */}

                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-zinc-900">
                    {getCreatorCredits?.credits}
                  </div>
                  <div className="text-sm text-[#1C1917]">
                    Credits
                    <br />
                    Remaining
                  </div>
                </div>
              </div>

              {/* Subscription Actions: Upgrade/Downgrade and Cancel */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-primary/20">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="bg-[#1C1917] hover:bg-[#1C1917]/90"
                >
                  Delete Account
                </Button>
                {getCreatorCredits?.subscription_id &&
                  getCreatorCredits?.membershipStatus === "active" &&
                  (getCreatorCredits?.membership === "pro" ||
                    getCreatorCredits?.membership === "saver") &&
                  !getCreatorCredits?.subscription_status_canceled &&
                  getCreatorCredits?.payment_provider === "polar" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleOpenUpgradeModal}
                        className="bg-[#1C1917] hover:bg-[#1C1917]/90"
                      >
                        {getCreatorCredits?.membership === "saver" ? "Upgrade to Pro" : "Change Plan"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        className="text-zinc-600 hover:text-zinc-900"
                      >
                        Cancel Subscription
                      </Button>
                    </>
                  )}
              </div>
              {/* Cancel button for PayPal subscriptions (no upgrade support) */}
              {getCreatorCredits?.subscription_id &&
                getCreatorCredits?.membershipStatus === "active" &&
                (getCreatorCredits?.membership === "pro" ||
                  getCreatorCredits?.membership === "saver") &&
                !getCreatorCredits?.subscription_status_canceled &&
                getCreatorCredits?.payment_provider !== "polar" && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-primary/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="text-zinc-600 hover:text-zinc-900"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Your Subscription</CardTitle>
              <CardDescription>
                Generate complete products and technical specification ready for
                the factory and access our innovative creation tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-stone-100 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-[#1C1917]" />
                  <h4 className="font-semibold text-[#1C1917] dark:text-stone-200">
                    Simple, Flexible Plans
                  </h4>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Subscribe or buy credits once — no hidden fees, no expiration
                  dates, cancel anytime.
                </p>
              </div>

              <PaypalCustomCard />

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center flex-col sm:flex-row gap-2 space-x-4 text-sm text-[#1C1917]">
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
            </CardContent>
            {/* <CardFooter>
              <Button variant="outline">Download All Invoices</Button>
            </CardFooter> */}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentsHistory.length === 0 ? (
                  <p>No payment history found.</p>
                ) : (
                  paymentsHistory.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <div>
                        <p className="font-medium">
                          {formatDate(payment.created_at)}
                        </p>
                        <p className="text-sm text-[#1C1917]">
                          {payment.quantity} Tech Pack Credits
                        </p>
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
            {/* <CardFooter>
              <Button variant="outline">Download All Invoices</Button>
            </CardFooter> */}
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-lg bg-[#f5f4f0] border border-[#d3c7b9] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black text-center">
              Cancel Subscription
            </DialogTitle>
            <DialogDescription className="text-center text-black/70 mt-2">
              We're sorry to see you go! Please let us know why you're
              cancelling.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium text-black mb-2">
              Reason for Cancellation
            </label>
            <Textarea
              placeholder="Let us know why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-[#d3c7b9] focus:ring-2 focus:ring-black placeholder:text-[#0e2a47]/50"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="text-black border-black"
            >
              Close
            </Button>
            <Button
              onClick={() => handleCancelSubscription(cancelReason)}
              className="bg-black hover:bg-black text-white"
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling...." : "Confirm Cancellation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade/Downgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-lg bg-[#f5f4f0] border border-[#d3c7b9] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black text-center">
              Change Your Plan
            </DialogTitle>
            <DialogDescription className="text-center text-black/70 mt-2">
              {getCreatorCredits?.membership === "saver"
                ? "Upgrade to Pro for more credits and features"
                : "Switch to a different plan"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Current Plan */}
            <div className="bg-stone-200 rounded-lg p-4">
              <p className="text-sm text-stone-600 mb-1">Current Plan</p>
              <p className="font-semibold text-[#1C1917]">
                {getCreatorCredits?.membership?.charAt(0).toUpperCase()}
                {getCreatorCredits?.membership?.slice(1)} Plan ({getCreatorCredits?.planType})
              </p>
              <p className="text-sm text-stone-600">
                {getCreatorCredits?.credits} credits remaining
              </p>
            </div>

            {/* Available Plans */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-black">Available Plans</p>
              {availablePlans.length === 0 ? (
                <p className="text-sm text-stone-600">No other plans available for your billing period.</p>
              ) : (
                availablePlans.map((plan) => (
                  <div
                    key={plan.productId}
                    className="border border-[#d3c7b9] rounded-lg p-4 hover:border-[#1C1917] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#1C1917]">{plan.name}</p>
                        <p className="text-sm text-stone-600">
                          {plan.credits} credits per {plan.planType === "monthly" ? "month" : "year"}
                        </p>
                        <p className="text-lg font-bold text-[#1C1917] mt-1">
                          ${plan.price}/{plan.planType === "monthly" ? "mo" : "yr"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleChangePlan(plan.productId)}
                        disabled={upgradeLoading}
                        className="bg-[#1C1917] hover:bg-[#1C1917]/90"
                      >
                        {upgradeLoading ? "Processing..." : plan.membership === "pro" ? "Upgrade" : "Switch"}
                      </Button>
                    </div>
                    {plan.membership === "pro" && (
                      <p className="text-xs text-stone-500 mt-2">
                        You&apos;ll be charged the prorated difference immediately.
                      </p>
                    )}
                    {plan.membership === "saver" && (
                      <p className="text-xs text-stone-500 mt-2">
                        Credit will be applied to your next billing cycle.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="text-black border-black"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <DialogContent className="max-w-lg bg-[#f5f4f0] border border-[#d3c7b9] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black text-center">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-center text-black/70 mt-2">
              This will permanently delete your account and all associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteAccountModal(false)}
              className="text-black border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete()}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteAccountLoading}
            >
              {deleteAccountLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

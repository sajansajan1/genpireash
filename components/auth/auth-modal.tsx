"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./auth-provider";
import { ArrowRight, Eye, EyeOff, ArrowLeft, CheckCircle, User, Users } from "lucide-react";
import { sendPasswordReset, signIn, signInWithGoogle, signUp } from "@/lib/auth-service";
import { createCreatorProfile } from "@/lib/supabase/creator";
import type React from "react";
import { sendSignupEmail } from "@/app/actions/send-mail";
import { supabase } from "@/lib/supabase/client";
import { useCreateNotificationStore } from "@/lib/zustand/notifications/createNotification";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { track, AnalyticsEvents, getUTMEventProperties } from "@/lib/analytics";
import { saveSignupUTM } from "@/app/actions/save-utm-data";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
  title?: string;
  description?: string;
  setRole?: string;
}

type CreatorProfileResult = {
  id: any;
  error?: { message: string };
} | null;

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "signin",
  title = "Welcome to Genpire",
  description = "Sign in to your account or create a new one",
  setRole,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [signupStep, setSignupStep] = useState(1); // Added multi-step signup state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [refferalCode, setRefferalCode] = useState<any>(null);

  //
  const [supplier, setSupplier] = useState(false);

  const router = useRouter();
  const { setCreateNotification } = useCreateNotificationStore();
  const [signInForm, setsignInForm] = useState({
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessCategory: "",
    team_size: "", // Added new fields for step 2
    mainInterest: "",
    designation: "",
    role: setRole || "creator",
  });

  useEffect(() => {
    const search = window.location.search; // ?fda99204r390203
    const id = search.startsWith("?") ? search.substring(1) : null;
    setRefferalCode(id);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSignInInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setsignInForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleAuth = async (type: "signin" | "signup") => {
    setIsLoading(true);
    setError(null);

    // Track Google auth attempt
    track(type === "signup" ? AnalyticsEvents.SIGNUP_START : AnalyticsEvents.LOGIN, {
      method: "google",
      role: formData.role,
    });

    try {
      const result = await signInWithGoogle(type);
      console.log("Google auth result");

      if (result?.error) {
        console.error("Google authentication error:", result.error);
        track(AnalyticsEvents.ERROR, {
          error_type: "google_auth_error",
          error_message: result.error.message,
        });
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      if (result?.url) {
        // if (typeof window !== "undefined") {
        //   sessionStorage.setItem("google_auth_type", type);
        // }
        window.location.assign(result.url);
        return;
      }
      setError("No redirect URL received from Google");
      setIsLoading(false);
    } catch (err) {
      console.error("Google authentication error:", err);
      track(AnalyticsEvents.ERROR, {
        error_type: "google_auth_exception",
        error_message: "Unexpected error with Google authentication",
      });
      setError("An unexpected error occurred with Google authentication. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { email, password } = signInForm;
    if (!email || !password) {
      setError("Please fill all the fields.");
      setIsLoading(false);
      return;
    }

    // Track login attempt
    track(AnalyticsEvents.LOGIN, { method: "email" });

    try {
      const result = await signIn(email, password);
      if (result.error) {
        track(AnalyticsEvents.ERROR, {
          error_type: "login_error",
          error_message: result.error.message,
        });
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      const userRole = result.user.user_metadata.user_role;

      // Track successful login
      track(AnalyticsEvents.LOGIN, {
        method: "email",
        success: true,
        role: userRole,
        user_id: result.user?.id,
      });

      if (userRole === "creator") {
        await setCreateNotification({
          senderID: result.user?.id,
          receiverID: result.user?.id,
          title: "Welcome Back",
          message: `🎉 Welcome back, ${result.user?.user_metadata.full_name}! Ready to build your next product?.`,
          type: "rfq_response",
        });
        onClose();
        router.refresh();
        window.location.assign("/creator-dashboard");
      } else if (userRole === "supplier") {
        await setCreateNotification({
          senderID: result.user?.id,
          receiverID: result.user?.id,
          title: "Welcome Back",
          message: `🎉 Welcome back, ${result.user?.user_metadata.full_name}! You're live on the network.`,
          type: "rfq_response",
        });
        router.refresh();
        router.push("/supplier-dashboard");
      } else if (userRole === "admin") {
        router.refresh();
        router.push("/admin");
      } else {
        setError("Invalid user role");
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Login error:", err);
      track(AnalyticsEvents.ERROR, {
        error_type: "login_exception",
        error_message: "Unexpected login error",
      });
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };
  // console.log(refferalCode, "rrrrrrrrrrrrrrrrrr");
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const {
      email,
      password,
      full_name,
      confirmPassword,
      businessCategory,
      team_size,
      mainInterest,
      designation,
      role,
    } = formData;
    if (!full_name || !email || !password || !confirmPassword) {
      setError("Please fill all the required fields.");
      setIsLoading(false);
      return;
    }

    // Track signup attempt
    track(AnalyticsEvents.SIGNUP_START, {
      method: "email",
      role: role,
    });

    console.log("role", role);
    try {
      if (role == "creator") {
        // if (!team_size || !mainInterest || !designation) {
        //   setError("Please complete all fields.");
        //   setIsLoading(false);
        //   return;
        // }
        const result = await signUp(email, password, full_name, "creator");
        if (result.error) {
          setError(result.error.message);
          setIsLoading(false);
          return;
        }
        const { data: updatedUser, error: metadataError } = await supabase.auth.updateUser({
          data: {
            user_role: "creator",
            profile_complete: false,
          },
        });

        if (metadataError) {
          setError("Failed to update user metadata.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "signup",
            email,
            creatorName: full_name,
          }),
        });

        const emailResult = await res.json();
        if (emailResult.success) {
          console.log("Signup email sent");
        } else {
          console.error(emailResult.error);
        }

        const profileResult: CreatorProfileResult = await createCreatorProfile({
          full_name,
          avatar_url: "",
          country: "",
          categories: "",
          address: "",
          contact: "",
          email: email,
          designation,
          team_size,
          referredBy: refferalCode,
        });

        if (!profileResult || profileResult?.error) {
          setError(profileResult?.error?.message || "Profile creation failed.");
          setIsLoading(false);
          return;
        }

        const profile = await supabase.auth.updateUser({
          data: {
            profile_complete: true,
          },
        });
        console.log(profile, "profile");

        // Track successful creator signup
        track(AnalyticsEvents.SIGNUP_COMPLETE, {
          method: "email",
          role: "creator",
          designation,
          team_size,
          has_referral: !!refferalCode,
        });

        // Save UTM/campaign data to database for attribution
        const utmProps = getUTMEventProperties();
        if (result.user?.id && Object.keys(utmProps).length > 0) {
          saveSignupUTM(result.user.id, {
            utm_source: utmProps.campaign_source as string,
            utm_medium: utmProps.campaign_medium as string,
            utm_campaign: utmProps.campaign_name as string,
            utm_term: utmProps.campaign_term as string,
            utm_content: utmProps.campaign_content as string,
            utm_id: utmProps.campaign_id as string,
            gclid: utmProps.gclid as string,
            fbclid: utmProps.fbclid as string,
            referral_code: refferalCode || (utmProps.referral_code as string),
            landing_page: utmProps.landing_page as string,
            referrer_url: utmProps.referrer as string,
          }).catch((err) => console.error("Failed to save UTM data:", err));
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            router.push("/creator-dashboard?onboarding=true");
          }
        });
      } else {
        const result = await signUp(email, password, full_name, "supplier");
        if (result.error) {
          setError(result.error.message);
          setIsLoading(false);
          return;
        }
        const { data: updatedUser, error: metadataError } = await supabase.auth.updateUser({
          data: {
            user_role: "supplier",
            profile_complete: false,
            verified_status: false,
          },
        });

        if (metadataError) {
          setError("Failed to update user metadata.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "signup",
            email,
            creatorName: full_name,
          }),
        });

        const emailResult = await res.json();
        if (emailResult.success) {
          console.log("Signup email sent");
        } else {
          console.error(emailResult.error);
        }

        // Track successful supplier signup
        track(AnalyticsEvents.SIGNUP_COMPLETE, {
          method: "email",
          role: "supplier",
        });

        // Save UTM/campaign data to database for attribution
        const supplierUtmProps = getUTMEventProperties();
        if (result.user?.id && Object.keys(supplierUtmProps).length > 0) {
          saveSignupUTM(result.user.id, {
            utm_source: supplierUtmProps.campaign_source as string,
            utm_medium: supplierUtmProps.campaign_medium as string,
            utm_campaign: supplierUtmProps.campaign_name as string,
            utm_term: supplierUtmProps.campaign_term as string,
            utm_content: supplierUtmProps.campaign_content as string,
            utm_id: supplierUtmProps.campaign_id as string,
            gclid: supplierUtmProps.gclid as string,
            fbclid: supplierUtmProps.fbclid as string,
            referral_code: supplierUtmProps.referral_code as string,
            landing_page: supplierUtmProps.landing_page as string,
            referrer_url: supplierUtmProps.referrer as string,
          }).catch((err) => console.error("Failed to save UTM data:", err));
        }

        router.push("/onboarding/manufacturer");
        return;
      }
    } catch (err) {
      console.error("Registration error:", err);
      track(AnalyticsEvents.ERROR, {
        error_type: "signup_exception",
        error_message: "Unexpected registration error",
        role: role,
      });
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResetMessage(null);

    try {
      const { error: resetError } = await sendPasswordReset(resetEmail);
      if (!resetEmail) {
        setError("Please enter your email address.");
        setIsLoading(false);
        return;
      }
      if (resetError) {
        throw new Error(resetError);
      } else {
        setResetMessage("Password reset email sent! Check your inbox.");
        setResetEmail("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    const { full_name, email, password, confirmPassword } = formData;

    if (!full_name || !email || !password || !confirmPassword) {
      setError("Please fill all the required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setSignupStep(2);
  };

  //
  const handleSupplierNextStep = () => {
    const { full_name, email, password, confirmPassword } = formData;

    if (!full_name || !email || !password || !confirmPassword) {
      setError("Please fill all the required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    // setSignupStep(2);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg lg:max-w-6xl p-0 overflow-hidden bg-white max-h-[95vh] overflow-y-auto scrollbar-hide border rounded-lg">
        <div className="flex min-h-[500px] lg:min-h-[600px]">
          <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-stone-100 to-stone-200">
            <div className="absolute inset-0 bg-black/20"></div>
            <video
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_maXDFX34kkt4tB6UH4iA3P5QJljl/VM94XNQGP4D2Zdsu4X0-Cy/public/assets/hero-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Turn Ideas Into Reality</h3>
              <p className="text-white/90 max-w-sm">
                Join thousands of creators bringing their product visions to life with AI-powered design tools.
              </p>
            </div>
          </div>

          <div className="flex-1 lg:w-1/2 p-4 sm:p-6 lg:p-12 flex flex-col justify-center overflow-y-auto md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex justify-center mb-6 sm:mb-8">
              <img src="/g-black.png" alt="Genpire" className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <Tabs
              defaultValue={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as "signin" | "signup");
                setError(null);
                setShowForgotPassword(false);
                setResetMessage(null);
                setResetEmail("");
                setSignupStep(1); // Reset signup step when tab changes
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-stone-100 rounded-lg p-1 border border-stone-200">
                <TabsTrigger
                  value="signin"
                  className="rounded-md text-sm font-medium text-zinc-700 transition-all duration-200 hover:bg-white hover:text-zinc-900 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-md text-sm font-medium text-zinc-700 transition-all duration-200 hover:bg-white hover:text-zinc-900 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <div className="text-center mb-6 sm:mb-8 px-2">
                {activeTab === "signin" ? (
                  <>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-black mb-2">Welcome Back</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-stone-600">
                      Ready to create your next breakthrough product?
                    </DialogDescription>
                  </>
                ) : (
                  <>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-black mb-2">
                      {signupStep === 1 ? "Start Your Journey" : "Tell Us About Yourself"}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-stone-600">
                      {signupStep === 1
                        ? "Join the future of product creation with AI-powered tools"
                        : "Help us personalize your Genpire experience"}
                    </DialogDescription>
                  </>
                )}
              </div>

              <TabsContent value="signin" className="space-y-6 mt-0">
                <Button
                  onClick={() => handleGoogleAuth("signin")}
                  variant="outline"
                  className="w-full mb-4 sm:mb-6 h-10 sm:h-12 border-stone-300 hover:bg-stone-50 text-sm sm:text-base"
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-zinc-500">Or</span>
                  </div>
                </div>

                {!showForgotPassword ? (
                  <motion.form
                    onSubmit={handleSignIn}
                    className="space-y-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-zinc-900 font-medium text-sm">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        value={signInForm.email}
                        onChange={handleSignInInputChange}
                        required
                        className="h-10 sm:h-12 text-sm sm:text-base"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-zinc-900 font-medium text-sm">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={signInForm.password}
                          onChange={handleSignInInputChange}
                          required
                          className="h-11 rounded-lg border-stone-300 focus:border-zinc-900 focus:ring-zinc-900/20 pr-12 text-sm bg-white"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full h-11 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </motion.form>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center space-y-3">
                      <h3 className="text-lg font-semibold text-zinc-900">Reset Password</h3>
                      <p className="text-sm text-zinc-600">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="reset-email" className="text-zinc-900 font-medium text-sm">
                          Email
                        </Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          className="h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="Enter your email"
                        />
                      </motion.div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      {resetMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-600">{resetMessage}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Email"}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setError(null);
                            setResetMessage(null);
                            setResetEmail("");
                          }}
                          className="w-full h-11 text-zinc-600 hover:bg-stone-50 hover:text-zinc-900 rounded-lg font-medium text-sm"
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <Button
                  onClick={() => handleGoogleAuth("signup")}
                  variant="outline"
                  className="w-full h-11 bg-white hover:bg-stone-50 border-stone-300 text-zinc-900 text-sm rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-zinc-500">Or</span>
                  </div>
                </div>

                {signupStep === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-zinc-900 font-medium text-sm">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="signup-name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-zinc-900 font-medium text-sm">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* <div className="space-y-2">
                          <Label htmlFor="signup-business-category" className="text-zinc-900 font-medium text-sm">
                            Business Category <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="signup-business-category"
                            name="businessCategory"
                            value={formData.businessCategory}
                            onChange={(e) => handleSelectChange("businessCategory", e.target.value)}
                            required
                            className="w-full h-10 rounded-lg border border-stone-300 focus:border-zinc-900 focus:ring-zinc-900/20 text-sm bg-white px-3"
                          >
                            <option value="">Select your business category</option>
                            <option value="Apparel">Apparel & Fashion</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Footwear">Footwear</option>
                            <option value="Home Goods">Home Goods</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                            <option value="Toys & Gadgets">Toys & Gadgets</option>
                            <option value="Food & Beverage">Food & Beverage</option>
                            <option value="other">Other</option>
                          </select>
                        </div> */}

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-zinc-900 font-medium text-sm">
                            Password <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              className="h-10 rounded-lg border-stone-300 focus:border-zinc-900 focus:ring-zinc-900/20 pr-10 text-sm bg-white"
                              placeholder="Create password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm-password" className="text-zinc-900 font-medium text-sm">
                            Confirm Password <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="signup-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              className="h-10 rounded-lg border-stone-300 focus:border-zinc-900 focus:ring-zinc-900/20 pr-10 text-sm bg-white"
                              placeholder="Confirm password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-500 bg-stone-50 rounded-lg p-3 border border-stone-200">
                      Password must be at least 6 characters long
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {/* <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button> */}

                    {formData.role != "supplier" ? (
                      <>
                        {/* <Button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button> */}
                        <form onSubmit={handleSignUp}>
                          <Button
                            type="submit"
                            variant="default"
                            className="w-full h-10 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                            disabled={isLoading}
                          >
                            {isLoading ? "Creating Account..." : "Create an Account"}
                            {!isLoading && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
                          </Button>
                        </form>
                        <Button
                          type="button"
                          onClick={() => {
                            handleSelectChange("role", "supplier");
                            setSupplier(true);
                          }}
                          variant="outline"
                          className="w-full h-10 rounded-lg font-medium text-sm  transition-all duration-200"
                        >
                          Sign up as Manufacturer
                        </Button>
                      </>
                    ) : (
                      <>
                        <form onSubmit={handleSignUp}>
                          <Button
                            type="submit"
                            variant="default"
                            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 mb-2"
                            disabled={isLoading}
                          >
                            {isLoading ? "Creating Account..." : "Sign Up as Manufacturer"}
                            {!isLoading && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
                          </Button>
                        </form>

                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            handleSelectChange("role", "creator");
                            setSupplier(false);
                          }}
                          className="w-full h-10 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Back to Creator
                        </Button>
                      </>
                    )}

                    <div className="text-xs text-zinc-500 text-center leading-relaxed">
                      By signing up, you agree to our{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-700 hover:text-zinc-900 underline font-medium"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-700 hover:text-zinc-900 underline font-medium"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-zinc-900">Team & Preferences</h3>
                        <p className="text-sm text-zinc-600">Tell us about your team and interests</p>
                      </div> */}

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="flex items-center justify-center mb-4 sm:mb-6">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-black text-white rounded-full text-xs sm:text-sm font-medium">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <div className="w-8 sm:w-12 h-0.5 bg-black mx-1 sm:mx-2"></div>
                          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-black text-white rounded-full text-xs sm:text-sm font-medium">
                            2
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-black flex items-center gap-2 text-sm">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          What's your Role?
                        </Label>
                        <Select
                          name="designation"
                          value={formData.designation}
                          onValueChange={(e) => handleSelectChange("designation", e)}
                          required
                        >
                          <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* <SelectItem value="">Select your team size</SelectItem> */}
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="developer">Product Developer</SelectItem>
                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="manufacture">Brand Owner</SelectItem>
                            <SelectItem value="entrepreneur">Entrepreneur / Founder</SelectItem>
                            <SelectItem value="student">Student / Learner</SelectItem>
                            <SelectItem value="none">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-black flex items-center gap-2 text-sm">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          What's your Team Size?
                        </Label>
                        <Select
                          name="team_size"
                          value={formData.team_size}
                          onValueChange={(e) => handleSelectChange("team_size", e)}
                          required
                        >
                          <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="Select your team size" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* <SelectItem value="">Select your team size</SelectItem> */}
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="2-5">2-5 members</SelectItem>
                            <SelectItem value="6-10">6-10 members</SelectItem>
                            <SelectItem value="more-than-10">More than 10 members</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-black flex items-center gap-2 text-sm">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          Main Interest
                        </Label>
                        <Select
                          name="mainInterest"
                          value={formData.mainInterest}
                          onValueChange={(e) => handleSelectChange("mainInterest", e)}
                          required
                        >
                          <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="Select your Interest" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* <SelectItem value="">Select your main interest</SelectItem> */}
                            <SelectItem value="product-development">Product Development</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="sourcing">Sourcing & Procurement</SelectItem>
                            <SelectItem value="design">Design & Prototyping</SelectItem>
                            <SelectItem value="quality-control">Quality Control</SelectItem>
                            <SelectItem value="supply-chain">Supply Chain Management</SelectItem>
                            <SelectItem value="cost-optimization">Cost Optimization</SelectItem>
                            <SelectItem value="market-research">Market Research</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* <div className="space-y-1 sm:space-y-2">
                        <Label className="text-black flex items-center gap-2 text-sm">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          Are you a Supplier?
                        </Label>
                        <Select
                          name="role"
                          value={formData.role}
                          onValueChange={(e) => handleSelectChange("role", e)}
                          required
                        >
                          <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="Select one option" />
                          </SelectTrigger>
                          <SelectContent> */}
                      {/* <SelectItem value="">Select your team size</SelectItem> */}
                      {/* <SelectItem value="supplier">Yes</SelectItem>
                            <SelectItem value="creator">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => {
                            setSignupStep(1);
                            setError(null);
                          }}
                          variant="outline"
                          className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                        >
                          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          variant="default"
                          className="w-full h-10 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating Account..." : "Complete Setup"}
                          {!isLoading && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
                        </Button>
                      </div>

                      <div className="text-xs text-zinc-500 text-center leading-relaxed">
                        By signing up, you agree to our{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-700 hover:text-zinc-900 underline font-medium"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-700 hover:text-zinc-900 underline font-medium"
                        >
                          Privacy Policy
                        </a>
                      </div>
                    </form>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

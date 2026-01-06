"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { Volkhov } from "next/font/google";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "@/lib/auth-service";
import { supabase } from "@/lib/supabase/client";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("code");
  const { toast } = useToast();

  useEffect(() => {
    const verifyTokenAndCreateSession = async () => {
      if (!token) {
        setError("Invalid reset link. Please try again.");
        return;
      }

      try {
        // Step 1: Verify the OTP token to create a session
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        if (error) {
          setError("Invalid or expired reset link.");
          console.error("Token verification error:", error);
        } else if (data.session) {
          setIsSessionReady(true);
          setError(null);
        } else {
          setError("Failed to create session. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
        console.error("Unexpected error:", err);
      }
    };

    verifyTokenAndCreateSession();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setError("Link expired Please try again!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError("Failed to update password.");
        console.error("Supabase error:", error);
      } else {
        toast({
          variant: "default",
          title: "Password updated",
          description: "Your password has been successfully reset.",
        });
        router.push("/");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: "An unexpected error occurred.",
      });
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center">
              <img src="/favicon.png" alt="Genpire Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-zinc-900">Genpire</span>
              {/* Added hashtags next to logo */}
            </Link>
            <h1 className="mt-6 text-3xl font-bold">Create new password</h1>
            <p className="mt-2 text-sm text-[#1C1917]">Enter a new password for your account</p>
          </div>

          <div className="glass-card dark:glass-card-dark rounded-xl p-8">
            {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#1C1917]">
              Remember your password?{" "}
              <Link href="/" className="text-zinc-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { Volkhov } from "next/font/google";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordReset } from "@/lib/auth-service"; // ✅ Make sure this is defined in `lib/auth-service.ts`

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await sendPasswordReset(email);

      if (resetError) {
        throw new Error(resetError);
      }

      setIsSubmitted(true);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
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
            <Link href="/" className="inline-block">
              <div className={`flex items-center justify-center ${volkhov.className}`}>
                <span className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center mr-2 shadow-sm">
                  G
                </span>
                <span className="text-3xl font-bold gradient-text">Genpire</span>
              </div>
            </Link>
            <h1 className={`mt-6 text-3xl font-bold ${volkhov.className}`}>Reset your password</h1>
            <p className="mt-2 text-sm text-[#1C1917]">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <div className="glass-card dark:glass-card-dark rounded-xl p-8">
            {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="bg-primary/10 text-zinc-900 p-4 rounded-md">
                  <h3 className="font-medium">Check your email</h3>
                  <p className="text-sm mt-1">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}
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

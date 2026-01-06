"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Facebook, Instagram, Linkedin, Twitter, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Calculate launch date - 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, you would send this to your API
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Background with gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-taupe via-cream to-cream dark:from-navy dark:via-gray-900 dark:to-gray-900"></div>

        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center flex-1 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${volkhov.className}`}>
                <span className="gradient-text">Genpire</span> is Coming Soon
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
                From Idea to Sample. Powered by AI.
              </p>
            </div>

            <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <p className="text-lg mb-6">
                We're building a revolutionary platform that uses AI to transform your product ideas into reality.
                Design custom products, generate spec sheets, and get supplier quotes - all in minutes.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                {[
                  { label: "Days", value: "30" },
                  { label: "Hours", value: "00" },
                  { label: "Minutes", value: "00" },
                  { label: "Seconds", value: "00" },
                ].map((unit, index) => (
                  <div key={index} className="glass-card dark:glass-card-dark rounded-lg p-4">
                    <div className="text-3xl md:text-4xl font-bold">{unit.value}</div>
                    <div className="text-sm text-[#1C1917]">{unit.label}</div>
                  </div>
                ))}
              </div>

              <p className="text-[#1C1917]">
                Launching on{" "}
                {launchDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div className="max-w-md mx-auto w-full animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {!submitted ? (
                <>
                  <h2 className="text-xl font-semibold mb-4">Be the first to know when we launch</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit">
                      Notify Me <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="glass-card dark:glass-card-dark rounded-lg p-6 text-center animate-fade-in">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thank you for signing up!</h3>
                  <p className="text-[#1C1917]">We'll notify you when Genpire launches. Stay tuned for updates!</p>
                </div>
              )}
            </div>

            <div className="mt-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex justify-center space-x-6 mb-6">
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>

              <div className="text-sm text-[#1C1917]">
                <Link href="/" className="hover:underline">
                  Back to Home
                </Link>
                {" • "}
                <Link href="/" className="hover:underline">
                  View All Screens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

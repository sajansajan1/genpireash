"use client";
import { Button } from "@/components/ui/button";
import type React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Gift,
  TrendingUp,
  Crown,
  Sparkles,
  Share2,
  Palette,
  Video,
  Building2,
  ShoppingBag,
  GraduationCap,
  Globe,
  Instagram,
  Link,
  X,
  Youtube,
  Facebook,
} from "lucide-react";
import { useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNavbar } from "@/components/landing-navbar";
import { AuthModal } from "@/components/auth/auth-modal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { sendAmbassadorApllication, sendAmbassadorInterest } from "../actions/send-mail";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Section = ({ id, eyebrow, title, subtitle, children, className = "" }: any) => {
  return (
    <section id={id} className={`relative w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center"
          >
            <span
              className="inline-flex px-4 py-2 gap-2 text-sm font-medium text-black border border-stone-300 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: "#D2C8BC", borderColor: "#1C1917" }}
            >
              {eyebrow}
            </span>
          </motion.div>
        )}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">{title}</h2>
            {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};

export default function FriendsClientPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    audience_size: "",
    motivation: "",
    sharing_plan: "",
    social_links: "",
    tiktok: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    facebook: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("friends")
        .insert({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          role: formData.role,
          audience_size: formData.audience_size,
          motivation: formData.motivation,
          sharing_plan: formData.sharing_plan,
          social_links: formData.social_links,
          tiktok: formData.tiktok,
          instagram: formData.instagram,
          youtube: formData.youtube,
          linkedin: formData.linkedin,
          facebook: formData.facebook,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("Insert error:", error);
        return;
      }
      if (data) {
        toast({ title: "Form Submitted", description: "Congrats! Form submitted successfully.", variant: "default" });
        const { success, message } = await sendAmbassadorApllication({
          email: formData.email,
          creatorName: formData.full_name,
        });

        const { success: success_email } = await sendAmbassadorInterest({
          email: "support@genpire.com",
          creatorName: formData.full_name,
          ambassadorEmail: formData.email,
          activateLink: "https://www.genpire.com/admin/ambassador",
        });
        await sendAmbassadorInterest({
          email: "adam@genpire.com",
          creatorName: formData.full_name,
          ambassadorEmail: formData.email,
          activateLink: "https://www.genpire.com/admin/ambassador",
        });

        await sendAmbassadorInterest({
          email: "daniel@genpire.com",
          creatorName: formData.full_name,
          ambassadorEmail: formData.email,
          activateLink: "https://www.genpire.com/admin/ambassador",
        });
        console.log(success_email, "suucuc");
      }
      console.log("Successfully saved:", data);

      setFormData({
        full_name: "",
        phone: "",
        email: "",
        location: "",
        role: "",
        audience_size: "",
        motivation: "",
        sharing_plan: "",
        social_links: "",
        tiktok: "",
        instagram: "",
        youtube: "",
        linkedin: "",
        facebook: "",
      });
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-white to-stone-50 pt-20">
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center rounded-full border border-stone-300 px-4 py-2 text-sm text-black mb-6"
              style={{ backgroundColor: "#D2C8BC" }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Join Our Community</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-6 leading-tight"
            >
              Shape the Future of Product Creation
              <br />
              <span className="bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700 bg-clip-text text-transparent">
                with Friends of Genpire
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-stone-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Join a global community of creators, innovators, and thought leaders. Share AI-powered product creation
              with your audience, earn meaningful rewards, and get exclusive early access to groundbreaking features.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="rounded-xl"
                onClick={() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Apply to Become a Friend
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/30 opacity-40" />

        <div className="mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <span
              className="inline-flex px-4 py-2 gap-2 text-sm font-medium text-black border rounded-full backdrop-blur-sm"
              style={{ backgroundColor: "#D2C8BC", borderColor: "#1C1917" }}
            >
              <Crown className="w-5 h-5" />
              Community Program
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-stone-800/50 backdrop-blur-sm">
                <div className="aspect-[4/3] bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_eakfnaeakfnaeakf-VpHOOnlw8mcfuBu92v3l5zj1qEV0PH.png"
                    alt="Friends of Genpire Community"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-stone-600/20 via-stone-500/20 to-stone-600/20 blur-3xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  Grow with Genpire — Share, Earn, Create Together
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Join our community of creators, influencers, and innovators who are shaping the future of product
                  development. Share Genpire with your audience and earn rewards while helping others bring their ideas
                  to life.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Apply as a Friend of Genpire and get exclusive access",
                  "Invite your audiences and followers to join the platform",
                  "Each joined user receives 5 free credits to start creating",
                  "Earn 15% of income when your referrals purchase a plan",
                  "Get early access to new features and updates",
                  "Share content and collaborate with the Genpire community",
                  "Build your reputation as a product creation innovator",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5 group-hover:bg-white/20 transition-colors">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white/90 leading-relaxed">{feature}</p>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 rounded-xl px-8 font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Apply Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Section
        className="bg-white"
        eyebrow={
          <>
            <Gift className="ml-2 h-5 w-5" />
            Program Benefits
          </>
        }
        title="Three Ways to Engage"
        subtitle="Choose how you want to participate in the Friends of Genpire community"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="h-8 w-8 text-stone-700" />,
              title: "1. Apply as a Friend",
              description:
                "Join our exclusive community of creators and innovators. Get recognized as an official Friend of Genpire and access special perks.",
            },
            {
              icon: <Share2 className="h-8 w-8 text-stone-700" />,
              title: "2. Invite Your Audience",
              description:
                "Share Genpire with your followers and community. Each person who joins gets 25% more credits on purchase package, and you earn 15% of their plan purchases.",
            },
            {
              icon: <Sparkles className="h-8 w-8 text-stone-700" />,
              title: "3. Join the Community",
              description:
                "Follow and be part of our Friends of Genpire community for early access to features, content sharing opportunities, and collaboration.",
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm border border-stone-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{benefit.title}</h3>
              <p className="text-stone-600 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        className="bg-gradient-to-br from-stone-50 to-white"
        title="How the Referral Program Works"
        subtitle="Simple steps to start earning while helping others create amazing products"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Apply & Get Approved",
              description: "Fill out the application form and join as an official Friend of Genpire.",
              icon: <Users className="h-8 w-8 text-stone-700" />,
            },
            {
              step: "02",
              title: "Share Your Link",
              description: "Receive your unique referral link to share with your audience and followers.",
              icon: <Share2 className="h-8 w-8 text-stone-700" />,
            },
            {
              step: "03",
              title: "They Get Credits",
              description: "Each person who joins through your link receives 5 free credits to start creating.",
              icon: <Gift className="h-8 w-8 text-stone-700" />,
            },
            {
              step: "04",
              title: "You Earn Rewards",
              description: "Earn 20% of the income when your referrals purchase any paid plan.",
              icon: <TrendingUp className="h-8 w-8 text-stone-700" />,
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-stone-300 mb-2">{step.step}</div>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">{step.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{step.title}</h3>
              <p className="text-stone-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        className="bg-white"
        title="Who Can Join?"
        subtitle="The program is open to anyone passionate about empowering makers and building the future of product creation. Perfect for:"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Palette className="h-10 w-10 text-stone-700" />,
              title: "Designers & Creators",
              description: "Fashion designers, product designers, and makers.",
            },
            {
              icon: <Video className="h-10 w-10 text-stone-700" />,
              title: "Influencers & Content Creators",
              description: "YouTubers, TikTokers, Instagram and LinkedIn creators.",
            },
            {
              icon: <Building2 className="h-10 w-10 text-stone-700" />,
              title: "Agencies & Consultants",
              description: "Creative agencies, sourcing experts, and product development consultants.",
            },
            {
              icon: <ShoppingBag className="h-10 w-10 text-stone-700" />,
              title: "Entrepreneurs & Founders",
              description: "eCommerce owners, D2C builders, and startup innovators.",
            },
            {
              icon: <GraduationCap className="h-10 w-10 text-stone-700" />,
              title: "Educators & Mentors",
              description: "Coaches, trainers, and instructors in design or entrepreneurship.",
            },
            {
              icon: <Globe className="h-10 w-10 text-stone-700" />,
              title: "Community Leaders",
              description: "Moderators of online communities, Discord/Slack groups, or local meetups.",
            },
          ].map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm border border-stone-200"
            >
              <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                {audience.icon}
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{audience.title}</h3>
              <p className="text-stone-600 leading-relaxed">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <section id="application-form" className="py-16 md:py-24 bg-gradient-to-br from-stone-50 to-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Application Form</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Ready to become a Friend of Genpire? Fill out the form below to get started.
            </p>
          </div>

          <Card className="border-stone-200 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-900 mb-2">Full Name *</label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-900 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-900 mb-2">Phone / WhatsApp (optional)</label>
                    <PhoneInput
                      country={"us"} // default country
                      value={formData.phone}
                      onChange={(phone) => handleInputChange("phone", phone)}
                      enableAreaCodes={true} // show area codes if applicable
                      inputStyle={{ width: "100%" }}
                      buttonStyle={{ border: "none" }} // optional styling for the flag dropdown
                      dropdownStyle={{ maxHeight: "200px", overflowY: "auto" }} // optional scrollable dropdown
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-900 mb-2">Location (City & Country) *</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., New York, USA"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-900 mb-2">Primary Role / Category *</label>
                    <Select onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="influencer">Influencer</SelectItem>
                        <SelectItem value="educator">Educator</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                        <SelectItem value="community-leader">Community Leader</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-900 mb-2">Audience / Network Size</label>
                    <Input
                      value={formData.audience_size}
                      type="number"
                      onChange={(e) => handleInputChange("audience_size", e.target.value)}
                      placeholder="e.g., 10,000 followers, 500 clients"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-900 mb-2">
                    Why do you want to be a Friend of Genpire? *
                  </label>
                  <Textarea
                    value={formData.motivation}
                    onChange={(e) => handleInputChange("motivation", e.target.value)}
                    placeholder="Tell us about your motivation and how you align with our mission..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-900 mb-2">
                    How do you plan to share Genpire? *
                  </label>
                  <Textarea
                    value={formData.sharing_plan}
                    onChange={(e) => handleInputChange("sharing_plan", e.target.value)}
                    placeholder="Describe your strategy (social media, community, clients, etc.)..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-stone-900 mb-2">
                    Website / Social Links (optional but encouraged)
                  </label>

                  {/* Website */}
                  <div className="flex items-center gap-2">
                    <Link width={20} height={20} />
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      placeholder="https://yourwebsite.com"
                      value={formData.social_links}
                      onChange={(e) => handleInputChange("social_links", e.target.value)}
                    />
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center gap-2">
                    <Instagram width={20} height={20} />
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      placeholder="https://instagram.com/"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                    />
                  </div>

                  {/* TikTok */}
                  <div className="flex items-center gap-2">
                    <svg
                      fill="currentColor"
                      className="h-4 w-4"
                      viewBox="0 0 32 32"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>tiktok</title>
                      <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"></path>
                    </svg>
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      placeholder="https://tiktok.com/@"
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange("tiktok", e.target.value)}
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      placeholder="https://linkedin.com/in/"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    />
                  </div>

                  {/* YouTube */}
                  <div className="flex items-center gap-2">
                    <Youtube width={20} height={20} />
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      placeholder="https://youtube.com/@"
                      value={formData.youtube}
                      onChange={(e) => handleInputChange("youtube", e.target.value)}
                    />
                  </div>

                  {/* Facebook */}
                  <div className="flex items-center gap-2">
                    <Facebook width={20} height={20} />
                    <input
                      type="text"
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      placeholder="https://facebook.com/"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-center pt-6">
                  <Button type="submit" size="lg" className="rounded-xl px-8">
                    Submit Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Get Started with Genpire"
        description="Sign in or create an account to explore our AI tech pack generator"
        defaultTab="signup"
      />

      <LandingFooter />
    </div>
  );
}

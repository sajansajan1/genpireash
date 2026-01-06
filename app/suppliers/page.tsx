"use client";
import { ArrowRight, Factory, FileText, CheckCircle, Users, Zap, TrendingUp, Package, Globe } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CountUp from "react-countup";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { LandingFooter } from "@/components/landing-footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LandingNavbar } from "@/components/landing-navbar";

const Section = ({ id, eyebrow, title, subtitle, children, className = "" }: any) => {
  return (
    <section id={id} className={`relative w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16 ${className}`}>
      <div className="mx-auto max-w-7xl">
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
            <h2 className="text-2xl tracking-tight text-stone-900 sm:text-3xl lg:text-4xl mb-6 font-semibold">
              {title}
            </h2>
            {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};

export default function SuppliersPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [getRandomNumber, setGetRandomNumber] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    website: "",
    categories: [] as string[],
    capabilities: "",
    monthlyCapacity: "",
    leadTime: "",
    certifications: [] as string[],
    agreeToTerms: false,
  });
  const handleSignUpModal = () => {
    const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const getRandomInteger = (min: number, max: number) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const getDailyRandomNumber = (min: number, max: number) => {
      const today = new Date().toDateString();
      const storedData = JSON.parse(localStorage.getItem("dailyRandomNumberData") || "{}");

      if (storedData && storedData.date === today) {
        return storedData.number;
      } else {
        const newRandomNumber = getRandomInteger(min, max);
        localStorage.setItem(
          "dailyRandomNumberData",
          JSON.stringify({
            number: newRandomNumber,
            date: today,
          })
        );
        return newRandomNumber;
      }
    };

    const dailyNumber = getDailyRandomNumber(100, 900);
    setGetRandomNumber(dailyNumber);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter((c) => c !== certification)
        : [...prev.certifications, certification],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    try {
      const { data, error } = await supabase
        .from("suppliers_form")
        .insert({
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          website: formData.website,
          categories: formData.categories,
          capabilities: formData.capabilities,
          monthlyCapacity: formData.monthlyCapacity,
          leadTime: formData.leadTime,
          certifications: formData.certifications,
          agreeToTerms: formData.agreeToTerms,
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
      }

      try {
        const webhookUrl = "https://hooks.zapier.com/hooks/catch/21093149/2vx95c4/";
        const zapierRes = await axios.post(
          webhookUrl,
          {
            name: formData.companyName,
            email: formData.email,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!zapierRes || zapierRes.status !== 200) {
          console.error("Zapier Error:", zapierRes.statusText || "Unknown error");
        } else {
          console.log("Zapier webhook triggered successfully.");
        }
      } catch (zapierError) {
        console.error("Zapier webhook error:", zapierError);
        // Optional: Do not block user creation on Zapier failure
      }
      console.log("Successfully saved:", data);

      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        website: "",
        categories: [],
        capabilities: "",
        monthlyCapacity: "",
        leadTime: "",
        certifications: [],
        agreeToTerms: false,
      });
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    // Handle form submission logic here
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  const certificationOptions = [
    "ISO 9001 (Quality Management)",
    "ISO 14001 (Environmental Management)",
    "ISO 45001 (Occupational Health & Safety)",
    "BSCI (Business Social Compliance Initiative)",
    "WRAP (Worldwide Responsible Accredited Production)",
    "SA8000 (Social Accountability)",
    "OEKO-TEX Standard 100",
    "GOTS (Global Organic Textile Standard)",
    "GRS (Global Recycled Standard)",
    "BCI (Better Cotton Initiative)",
    "Fair Trade Certified",
    "SEDEX (Supplier Ethical Data Exchange)",
    "SMETA (Sedex Members Ethical Trade Audit)",
    "FSC (Forest Stewardship Council)",
    "CE Marking (European Conformity)",
    "FDA Approved",
    "CPSIA (Consumer Product Safety Improvement Act)",
    "REACH (Registration, Evaluation, Authorization of Chemicals)",
    "RoHS (Restriction of Hazardous Substances)",
    "ASTM Standards",
    "EN71 (European Toy Safety Standard)",
    "LFGB (German Food & Feed Code)",
    "Cradle to Cradle Certified",
    "Bluesign Certified",
    "Other",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-20">
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-6"
            >
              Become a Verified Supplier on Genpire
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-stone-600 leading-relaxed mb-8"
            >
              Connect with thousands of brands and designers ready to produce — receive factory-ready tech packs,
              structured RFQs, and verified clients from around the world.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                size="lg"
                className="rounded-xl"
                onClick={() => {
                  setIsAuthModalOpen(true);
                }}
              >
                Apply as a Supplier
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            {/* Counter stats section for products and factories */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-stone-700">{getRandomNumber}</span>
                </div>
                <span>products generated today</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-4 flex items-center justify-center"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-stone-600 text-center sm:text-left">
                <div className="flex items-center gap-1">
                  <span>Trusted by</span>
                  <span className="text-sm font-medium text-stone-700">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <CountUp start={0} end={25} duration={2.5} />
                    </motion.span>
                  </span>
                  <span>+</span>
                </div>
                <span>vetted factories and suppliers worldwide</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      <Section className="bg-gradient-to-br from-stone-50 via-white to-stone-100">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed%20%281%29-4UhZczhvGph62V7NUNIupOgnRn1e2I.jpg"
                alt="Manufacturing professional working with Genpire"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-stone-400/10 via-stone-300/10 to-stone-400/10 blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4 leading-tight">
                The Future of Manufacturing Partnerships
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed mb-6">
                Genpire bridges the gap between creative vision and manufacturing reality. Our AI-powered platform
                transforms rough ideas into detailed, production-ready specifications that your factory can work with
                immediately.
              </p>
              <p className="text-stone-600 text-lg leading-relaxed">
                Join our growing network of verified suppliers and gain access to a global marketplace of creators,
                brands, and designers who are ready to manufacture their products with professional partners like you.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "Complete Tech Packs",
                  description: "Receive detailed specifications, measurements, and materials for every project",
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "Verified Clients",
                  description: "Work with serious creators and brands committed to bringing products to market",
                },
                {
                  icon: <Globe className="h-5 w-5" />,
                  title: "Global Reach",
                  description: "Connect with clients from around the world looking for your expertise",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white border border-stone-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-stone-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-stone-600 text-sm mb-4">
                <span className="font-semibold text-stone-900">Contact us:</span>{" "}
                <a href="mailto:suppliers@genpire.com" className="text-stone-900 hover:underline font-medium">
                  suppliers@genpire.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* Why Work With Genpire */}
      <Section
        className="bg-background"
        eyebrow={
          <>
            <Zap className="ml-2 h-5 w-5" />
            Benefits
          </>
        }
        title="Why Work With Genpire"
      >
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <FileText className="h-8 w-8" />,
              title: "Receive Factory-Ready Requests",
              description:
                "Get complete AI-generated tech packs with visuals, specs, and materials. No messy emails or missing info.",
            },
            {
              icon: <TrendingUp className="h-8 w-8" />,
              title: "Win New Clients Instantly",
              description:
                "Get discovered by creators and startups using Genpire to design products in every category.",
            },
            {
              icon: <CheckCircle className="h-8 w-8" />,
              title: "Simplify Quoting & Production",
              description: "Structured RFQs with product details let you quote faster and start sooner.",
            },
            {
              icon: <Globe className="h-8 w-8" />,
              title: "Build Trust & Visibility",
              description:
                "Your verified Genpire profile highlights your factory's capabilities and certifications to global clients.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-stone-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-3">{item.title}</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* Who Can Join */}
      <Section
        id="industries"
        className="bg-gradient-to-br from-stone-50 via-white to-stone-100"
        eyebrow={
          <>
            <Users className="ml-2 h-5 w-5" />
            Categories
          </>
        }
        title="Who Can Join Genpire"
        subtitle="If you make it — Genpire connects you with creators who need it."
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <img src="/icons/apparel-fashion.png" alt="Apparel" className="h-12 w-12" />,
              label: "Apparel & Fashion",
            },
            {
              icon: <img src="/icons/accessories-jewelry.png" alt="Jewelry" className="h-12 w-12" />,
              label: "Accessories & Jewelry",
            },
            {
              icon: <img src="/icons/footwear.png" alt="Footwear" className="h-12 w-12" />,
              label: "Footwear & Leather Goods",
            },
            {
              icon: <img src="/icons/furniture.png" alt="Furniture" className="h-12 w-12" />,
              label: "Furniture & Home Décor",
            },
            {
              icon: <img src="/icons/beauty-products.png" alt="Beauty" className="h-12 w-12" />,
              label: "Beauty & Lifestyle Products",
            },
            {
              icon: <img src="/icons/sports-equipment.png" alt="Sports" className="h-12 w-12" />,
              label: "Sports & Fitness Gear",
            },
            { icon: <img src="/icons/toys-games.png" alt="Toys" className="h-12 w-12" />, label: "Toys & Gadgets" },
            {
              icon: <img src="/icons/home-decor.png" alt="Home Decor" className="h-12 w-12" />,
              label: "Home Goods & Décor",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 text-center shadow-sm border border-stone-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-center mb-3">{item.icon}</div>
              <p className="text-sm font-medium text-stone-900">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* How It Works */}
      <Section
        id="how"
        className="bg-background"
        eyebrow={
          <>
            <Package className="ml-2 h-5 w-5" />
            Process
          </>
        }
        title="How It Works"
      >
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Apply to Join",
              description: "Submit your company profile and categories.",
            },
            {
              step: "02",
              title: "Get Verified",
              description: "Our team reviews your factory capabilities.",
            },
            {
              step: "03",
              title: "Receive Projects",
              description: "Get matched with creators' AI-generated tech packs.",
            },
            {
              step: "04",
              title: "Quote & Produce",
              description: "Send quotes, approve samples, and start manufacturing.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {item.step}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 pt-10 text-center shadow-sm border border-stone-200 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-stone-900 mb-3">{item.title}</h3>
                <p className="text-stone-600 leading-relaxed text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="rounded-xl"
            onClick={() => {
              // const formSection = document.getElementById("application-form");
              // formSection?.scrollIntoView({ behavior: "smooth" });
              setIsAuthModalOpen(true);
            }}
          >
            Join as a Supplier Today
          </Button>
        </div>
      </Section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* Testimonial Section */}
      <Section className="bg-gradient-to-br from-stone-50 via-white to-stone-100">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-stone-200"
          >
            <div className="mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
            </div>
            <blockquote className="text-xl md:text-2xl font-medium text-stone-900 mb-6 text-center leading-relaxed">
              "We used to receive incomplete drawings — now Genpire sends us full tech packs with visuals. It saves
              hours per client."
            </blockquote>
            <div className="flex items-center justify-center">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#D2C8BC" }}
              >
                <span className="text-black font-semibold">LC</span>
              </div>
              <div className="ml-4 text-left">
                <div className="font-semibold text-stone-900">Liang Chen</div>
                <div className="text-stone-600">Production Manager, Shenzhen Apparel Works</div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* SEO Text Block */}
      <Section className="bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold text-stone-900 mb-4">Powering the Future of Manufacturing</h3>
            <p className="text-stone-600 leading-relaxed">
              Genpire connects manufacturers, suppliers, and factories with global creators and brands using
              AI-generated tech packs and structured RFQs. Join the growing network of AI-powered manufacturing partners
              across apparel, footwear, furniture, beauty, and accessories — and start receiving projects ready for
              production.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* Supplier Application Form */}
      {/* <Section
        id="application-form"
        className="bg-gradient-to-br from-stone-50 via-white to-stone-100"
        eyebrow={
          <>
            <Factory className="ml-2 h-5 w-5" />
            Application
          </>
        }
        title="Apply to Join Genpire's Verified Supplier Network"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-stone-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company / Factory Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp / Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website / Portfolio URL</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Manufacturing Categories *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    "Apparel & Fashion",
                    "Accessories & Jewelry",
                    "Footwear",
                    "Furniture",
                    "Home Décor",
                    "Beauty Products",
                    "Sports & Fitness",
                    "Toys & Gadgets",
                  ].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capabilities">Production Capabilities / Specialties *</Label>
                <Textarea
                  id="capabilities"
                  name="capabilities"
                  value={formData.capabilities}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg min-h-[100px]"
                  placeholder="Describe your factory's capabilities, specialties, and equipment..."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyCapacity">Monthly Capacity *</Label>
                  <Input
                    id="monthlyCapacity"
                    name="monthlyCapacity"
                    value={formData.monthlyCapacity}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                    placeholder="e.g., 10,000 units/month"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time *</Label>
                  <Input
                    id="leadTime"
                    name="leadTime"
                    value={formData.leadTime}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                    placeholder="e.g., 30-45 days"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications / Standards</Label>
                <p className="text-sm text-stone-500 mb-3">Select all that apply</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 border border-stone-200 rounded-lg">
                  {certificationOptions.map((certification) => (
                    <div key={certification} className="flex items-center space-x-2">
                      <Checkbox
                        id={certification}
                        checked={formData.certifications.includes(certification)}
                        onCheckedChange={() => handleCertificationToggle(certification)}
                      />
                      <label
                        htmlFor={certification}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {certification}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms & Privacy Policy *
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={!formData.agreeToTerms}>
                  Apply Now
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </Section> */}

      {/* Separator between sections */}
      <div className="w-full h-px bg-stone-200" />

      {/* Final CTA Section */}
      <Section className="bg-stone-900 text-white">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Grow Your Manufacturing Business?</h2>
            <p className="text-lg text-stone-300 mb-8 leading-relaxed">
              Get qualified leads, structured projects, and factory-ready clients through Genpire's AI-to-Factory
              network.
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-stone-100 rounded-xl"
              onClick={() => {
                setIsAuthModalOpen(true);
              }}
            >
              Apply as a Supplier Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </Section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Get Started with Genpire"
        description="Sign in or create an account to generate your tech pack"
        defaultTab="signup"
        setRole="supplier"
      />
      <LandingFooter />
    </div>
  );
}

"use client";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Download, FileText, CheckCircle, Eye } from "lucide-react";

const metadata: Metadata = {
  title: "Tech Pack Template PDF | Free Download",
  description:
    "Download a free tech pack template PDF and see what a factory-ready technical package looks like. Use it as a reference or create one with Genpire.",
  keywords: "tech pack template, free tech pack PDF, tech pack sample, tech pack example, product development template",
  openGraph: {
    title: "Tech Pack Template PDF | Free Download",
    description:
      "Download a free tech pack template PDF and see what a factory-ready technical package looks like. Use it as a reference or create one with Genpire.",
    url: "https://www.genpire.com/tech-pack-template",
  },
};

export default function TechPackTemplate() {
  const handleDownload = () => {
    // Example: replace with your actual PDF file path or dynamic file generation logic
    const pdfUrl = "/samplepdf.pdf"; // public folder or CDN URL
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Sample-Pack.pdf"; // file name when saved
    link.click();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Download a Free Tech Pack Template (PDF)
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">See What a Complete Tech Pack Looks Like</p>
            <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto">
              Experience Genpire's revolutionary AI-powered tech pack creation process. Our intelligent system generates
              production-ready tech packs in minutes, combining industry expertise with cutting-edge AI to deliver
              professional specifications that manufacturers trust.
            </p>
          </div>
        </section>

        {/* Genpire Approach Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">The Genpire Tech Pack Advantage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#f5f4f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-zinc-900" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">AI-Powered Generation</h3>
                  <p className="text-white/90">
                    Our advanced AI analyzes your product concept and generates comprehensive tech packs with
                    industry-standard specifications in minutes, not weeks.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#f5f4f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-zinc-900" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Manufacturer-Ready</h3>
                  <p className="text-white/90">
                    Every tech pack follows global manufacturing standards, ensuring seamless communication with
                    factories worldwide and reducing production errors.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#f5f4f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-zinc-900" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Visual Excellence</h3>
                  <p className="text-white/90">
                    Professional technical drawings, detailed measurements, and clear specifications that eliminate
                    guesswork and ensure perfect production outcomes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sample Preview */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-zinc-900 mb-12 text-center">What's Inside the Sample Tech Pack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <Eye className="h-12 w-12 text-zinc-900 mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Real Product Example</h3>
                  <p className="text-gray-700 mb-4">
                    See a complete tech pack for a premium t-shirt, including all technical drawings, measurements, and
                    specifications used in actual production.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                      Front and back technical flats
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                      Construction details
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                      Seam specifications
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <FileText className="h-12 w-12 text-zinc-900 mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Professional Format</h3>
                  <p className="text-gray-700 mb-4">
                    Industry-standard layout that manufacturers worldwide recognize and can work with immediately.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                      Clear measurement tables
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                      Material specifications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                      Quality standards
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="py-16 px-4 bg-[#f5f4f0]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-zinc-900 mb-12 text-center">What You'll Learn from This Sample</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "How to structure technical drawings for clarity",
                "What measurements manufacturers need",
                "How to specify materials and fabrics",
                "Proper formatting for size charts",
                "Quality control checkpoint documentation",
                "Packaging and labeling requirements",
                "Color specification standards",
                "Construction and assembly instructions",
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#f5f4f0] mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-16 px-4 bg-zinc-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Download Your Free Sample Tech Pack</h2>
            <p className="text-xl mb-8 opacity-90">
              Get instant access to a professional tech pack template and see exactly what your manufacturers need.
            </p>
            <Button size="lg" className="bg-white text-black hover:bg-taupe" onClick={() => handleDownload()}>
              <span className="flex items-center justify-center">
                <Download className="h-5 w-5 mr-2" />
                Download Sample Pack
              </span>
            </Button>
            <p className="text-sm mt-4 opacity-75">No email required • Instant download • PDF format</p>
          </div>
        </section>

        {/* Genpire PDF Template Download */}
        {/* <section className="py-16 px-4 bg-gradient-to-r from-[#f5f4f0] to-[#d3c7b9]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-zinc-900 mb-8">Genpire Tech Pack Template</h2>
            <p className="text-lg text-gray-700 mb-8">
              Download our exclusive Genpire tech pack template - the same format our AI uses to generate professional
              specifications. Perfect for understanding our methodology and creating consistent documentation.
            </p>
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-2xl mx-auto mb-8">
              <FileText className="h-16 w-16 text-zinc-900 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">Official Genpire Template</h3>
              <ul className="text-left space-y-2 text-gray-600 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                  AI-optimized format for maximum clarity
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                  Industry-standard specifications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                  Manufacturer-approved layout
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#f5f4f0] mr-2" />
                  Editable PDF format
                </li>
              </ul>
              <Button size="lg" className="bg-zinc-900 text-white hover:bg-[#1a365d] shadow-lg font-semibold" disabled>
                <Download className="h-5 w-5 mr-2" />
                Download Genpire Template
              </Button>
              <p className="text-sm mt-2 text-gray-500">PDF will be available shortly</p>
            </div>
          </div>
        </section> */}

        {/* Next Steps */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-zinc-900 mb-8">Ready to Create Your Own?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Experience the power of AI-generated tech packs. Create professional, manufacturer-ready specifications in
              minutes with Genpire's intelligent platform.
            </p>
            <Button asChild size="lg" className="bg-zinc-900 text-white hover:bg-[#1a365d] shadow-lg font-semibold">
              <Link href="/">Generate My Tech Pack</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

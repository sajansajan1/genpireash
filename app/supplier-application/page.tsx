"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Factory, CheckCircle, Upload, Globe, Users, Award } from "lucide-react";
import Link from "next/link";

export default function SupplierApplicationPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    country: "",
    city: "",
    yearsInBusiness: "",
    employeeCount: "",
    productCategories: [] as string[],
    minimumOrderQuantity: "",
    productionCapacity: "",
    certifications: [] as string[],
    description: "",
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <LandingNavbar />
        <main className="pt-20 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-4">Application Submitted!</h1>
              <p className="text-zinc-900/70 mb-6">
                Thank you for your interest in joining the Genpire supplier network. We'll review your application and
                get back to you within 3-5 business days.
              </p>
              <Button asChild className="bg-zinc-900 hover:bg-gray-800 text-white">
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-taupe/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Factory className="w-8 h-8 text-taupe" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">Join the Genpire Supplier Network</h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Partner with us to help creators bring their product ideas to life. Join our network of trusted
              manufacturers and suppliers.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-taupe/20">
              <CardContent className="pt-6 text-center">
                <Globe className="w-8 h-8 text-taupe mx-auto mb-4" />
                <h3 className="font-semibold text-zinc-900 mb-2">Global Reach</h3>
                <p className="text-zinc-900/70 text-sm">
                  Connect with creators worldwide and expand your business internationally.
                </p>
              </CardContent>
            </Card>
            <Card className="border-taupe/20">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-taupe mx-auto mb-4" />
                <h3 className="font-semibold text-zinc-900 mb-2">Quality Projects</h3>
                <p className="text-zinc-900/70 text-sm">
                  Work with vetted creators on innovative products with clear specifications.
                </p>
              </CardContent>
            </Card>
            <Card className="border-taupe/20">
              <CardContent className="pt-6 text-center">
                <Award className="w-8 h-8 text-taupe mx-auto mb-4" />
                <h3 className="font-semibold text-zinc-900 mb-2">Trusted Network</h3>
                <p className="text-zinc-900/70 text-sm">
                  Join a curated network of reliable suppliers with verified capabilities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card className="border-taupe/20">
            <CardHeader>
              <CardTitle className="text-2xl text-zinc-900">Supplier Application Form</CardTitle>
              <CardDescription className="text-zinc-900/70">
                Please provide detailed information about your manufacturing capabilities and business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Company Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-zinc-900">
                        Company Name *
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        className="border-taupe/30 focus:border-navy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName" className="text-zinc-900">
                        Contact Person *
                      </Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        className="border-taupe/30 focus:border-navy"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-zinc-900">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="border-taupe/30 focus:border-navy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-zinc-900">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="border-taupe/30 focus:border-navy"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="website" className="text-zinc-900">
                        Website
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="border-taupe/30 focus:border-navy"
                        placeholder="https://"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-zinc-900">
                        Country *
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                        <SelectTrigger className="border-taupe/30 focus:border-navy">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="cn">China</SelectItem>
                          <SelectItem value="in">India</SelectItem>
                          <SelectItem value="mx">Mexico</SelectItem>
                          <SelectItem value="vn">Vietnam</SelectItem>
                          <SelectItem value="bd">Bangladesh</SelectItem>
                          <SelectItem value="tr">Turkey</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-zinc-900">
                        City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="border-taupe/30 focus:border-navy"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Business Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearsInBusiness" className="text-zinc-900">
                        Years in Business *
                      </Label>
                      <Select
                        value={formData.yearsInBusiness}
                        onValueChange={(value) => handleSelectChange("yearsInBusiness", value)}
                      >
                        <SelectTrigger className="border-taupe/30 focus:border-navy">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="11-20">11-20 years</SelectItem>
                          <SelectItem value="20+">20+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employeeCount" className="text-zinc-900">
                        Number of Employees *
                      </Label>
                      <Select
                        value={formData.employeeCount}
                        onValueChange={(value) => handleSelectChange("employeeCount", value)}
                      >
                        <SelectTrigger className="border-taupe/30 focus:border-navy">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="500+">500+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Manufacturing Capabilities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Manufacturing Capabilities</h3>
                  <div>
                    <Label className="text-zinc-900 mb-3 block">Product Categories * (Select all that apply)</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        "Apparel & Fashion",
                        "Accessories",
                        "Home & Living",
                        "Electronics",
                        "Toys & Gadgets",
                        "Beauty & Personal Care",
                        "Sports & Fitness",
                        "Jewelry",
                        "Footwear",
                      ].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={formData.productCategories.includes(category)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("productCategories", category, checked as boolean)
                            }
                          />
                          <Label htmlFor={category} className="text-sm text-zinc-900/80">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minimumOrderQuantity" className="text-zinc-900">
                        Minimum Order Quantity *
                      </Label>
                      <Select
                        value={formData.minimumOrderQuantity}
                        onValueChange={(value) => handleSelectChange("minimumOrderQuantity", value)}
                      >
                        <SelectTrigger className="border-taupe/30 focus:border-navy">
                          <SelectValue placeholder="Select MOQ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-50">1-50 units</SelectItem>
                          <SelectItem value="51-100">51-100 units</SelectItem>
                          <SelectItem value="101-500">101-500 units</SelectItem>
                          <SelectItem value="501-1000">501-1000 units</SelectItem>
                          <SelectItem value="1000+">1000+ units</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="productionCapacity" className="text-zinc-900">
                        Monthly Production Capacity *
                      </Label>
                      <Select
                        value={formData.productionCapacity}
                        onValueChange={(value) => handleSelectChange("productionCapacity", value)}
                      >
                        <SelectTrigger className="border-taupe/30 focus:border-navy">
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-1000">1-1,000 units</SelectItem>
                          <SelectItem value="1001-5000">1,001-5,000 units</SelectItem>
                          <SelectItem value="5001-10000">5,001-10,000 units</SelectItem>
                          <SelectItem value="10001-50000">10,001-50,000 units</SelectItem>
                          <SelectItem value="50000+">50,000+ units</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Certifications & Standards</h3>
                  <div>
                    <Label className="text-zinc-900 mb-3 block">Certifications (Select all that apply)</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        "ISO 9001",
                        "ISO 14001",
                        "OEKO-TEX",
                        "GOTS",
                        "BSCI",
                        "WRAP",
                        "Sedex",
                        "Fair Trade",
                        "Other",
                      ].map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Checkbox
                            id={cert}
                            checked={formData.certifications.includes(cert)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("certifications", cert, checked as boolean)
                            }
                          />
                          <Label htmlFor={cert} className="text-sm text-zinc-900/80">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-900">Company Description</h3>
                  <div>
                    <Label htmlFor="description" className="text-zinc-900">
                      Tell us about your company and manufacturing capabilities *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="border-taupe/30 focus:border-navy"
                      placeholder="Describe your company's history, specializations, unique capabilities, and what makes you a great manufacturing partner..."
                    />
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    required
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-zinc-900/80 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-taupe hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-taupe hover:underline">
                      Privacy Policy
                    </Link>
                    . I understand that my application will be reviewed and I may be contacted for additional
                    information.
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.agreeToTerms}
                  className="w-full bg-zinc-900 hover:bg-gray-800 text-white h-12"
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

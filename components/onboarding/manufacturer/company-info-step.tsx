"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, User, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Volkhov } from "next/font/google";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "countries-list";
interface CompanyInfoStepProps {
  formData: Record<string, any>;
  updateFormData: (data: Record<string, any>) => void;
}

export function CompanyInfoStep({ formData, updateFormData }: CompanyInfoStepProps) {
  const [companyName, setCompanyName] = useState(formData.companyName || "");
  const [contactName, setContactName] = useState(formData.contactName || "");
  const [email, setEmail] = useState(formData.email || "");
  const [phone, setPhone] = useState(formData.phone || "");
  const [website, setWebsite] = useState(formData.website || "");
  const [location, setLocation] = useState(formData.location || "");

  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countryOptions = Object.entries(countries).map(([code, data]) => ({
    value: code,
    label: data.name,
  }));

  // Debounced update function
  const scheduleUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        updateFormData({ ...pendingUpdatesRef.current });
        pendingUpdatesRef.current = {};
      }
    }, 300);
  }, [updateFormData]);

  const queueUpdate = (key: string, value: any) => {
    pendingUpdatesRef.current[key] = value;
    scheduleUpdate();
  };

  const handleChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case "companyName":
          setCompanyName(value);
          break;
        case "contactName":
          setContactName(value);
          break;
        case "email":
          setEmail(value);
          break;
        case "phone":
          setPhone(value);
          break;
        case "website":
          setWebsite(value);
          break;
        case "location":
          setLocation(value);
          break;
      }
      queueUpdate(field, value);
    },
    [scheduleUpdate]
  );

  // Clean up on unmount: flush pending updates
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateFormData({
        companyName,
        contactName,
        email,
        phone,
        website,
        location,
      });
    };
  }, [companyName, contactName, email, phone, website, location, updateFormData]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 `}>Company Information</h2>
        <p className="text-[#1C1917]">Tell us about your manufacturing business</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="flex items-center gap-2">
            <Building className="h-4 w-4" /> Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="Your Manufacturing Company"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Contact Person <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => handleChange("contactName", e.target.value)}
            placeholder="Full Name"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="contact@yourcompany.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> Phone Number
          </Label>
          {/* <Input
            id="phone"
            value={phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          /> */}
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={(value) => handleChange("phone", value)} // Directly use the value
            enableAreaCodes={true}
            inputStyle={{ width: "100%" }}
            buttonStyle={{ border: "none" }}
            dropdownStyle={{ maxHeight: "200px", overflowY: "auto" }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Website (Optional)
          </Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://yourcompany.com"
          />
          <p className="text-sm text-[#1C1917]">Your company website or social media page</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Location
          </Label>
          <Select
            value={location} // the currently selected country code
            onValueChange={(value) => handleChange("location", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>

            <SelectContent>
              {countryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-[#1C1917]">Where your manufacturing facility is located</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Volkhov } from "next/font/google";
import { manufacturing_capabilities } from "@/lib/types/tech-packs";
import {
  productCategoryOptions,
  capabilityOptions,
  materialOptions,
  certificationOptions,
  exportMarkets,
} from "@/lib/types/manufacturing_capability";
const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface CapabilitiesStepProps {
  formData: Partial<manufacturing_capabilities>;
  updateFormData: (data: Partial<manufacturing_capabilities>) => void;
}

export function CapabilitiesStep({ formData, updateFormData }: CapabilitiesStepProps) {
  const [productCategories, setProductCategories] = useState<string[]>(formData.product_categories || []);
  const [capabilities, setCapabilities] = useState<string[]>(formData.product_capability || []);
  const [exportMarket, setExportMarket] = useState<string[]>(formData.export_market || []);
  const [materialSpecialties, setMaterialSpecialties] = useState<string[]>(formData.material_specialist || []);
  const [moq, setMoq] = useState(formData.moq || "");
  const [leadTimeMin, setLeadTimeMin] = useState(formData.leadTimeMin || "");
  const [leadTimeMax, setLeadTimeMax] = useState(formData.leadTimeMax || "");
  const [samplePricing, setSamplePricing] = useState(formData.samplePricing || "");
  const [productionCapacity, setProductionCapacity] = useState(formData.productionCapacity || "");
  const [certifications, setCertifications] = useState<string[]>(formData.certifications || []);
  const [isExclusive, setIsExclusive] = useState(formData.isExclusive || false);
  const [aboutFactory, setAboutFactory] = useState(formData.aboutFactory || "");
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setProductCategories(formData.product_categories || []);
      setCapabilities(formData.product_capability || []);
      setExportMarket(formData.export_market || []);
      setMaterialSpecialties(formData.material_specialist || []);
      setMoq(formData.moq || "");
      setLeadTimeMin(formData.leadTimeMin || "");
      setLeadTimeMax(formData.leadTimeMax || "");
      setSamplePricing(formData.samplePricing || "");
      setProductionCapacity(formData.productionCapacity || "");
      setCertifications(formData.certifications || []);
      setIsExclusive(formData.isExclusive || false);
      setAboutFactory(formData.aboutFactory || "");
    }
  }, [formData]);

  const toggleCheckboxValue = (
    current: string[],
    value: string,
    updateFn: (val: string[]) => void,
    fieldName: keyof manufacturing_capabilities
  ) => {
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateFn(updated);
    updateFormData({ [fieldName]: updated });
  };

  const handleInputChange = useCallback(
    (field: keyof manufacturing_capabilities, value: string) => {
      switch (field) {
        case "moq":
          setMoq(value);
          break;
        case "leadTimeMin":
          setLeadTimeMin(value);
          break;
        case "leadTimeMax":
          setLeadTimeMax(value);
          break;
        case "samplePricing":
          setSamplePricing(value);
          break;
        case "productionCapacity":
          setProductionCapacity(value);
          break;
        case "aboutFactory":
          setAboutFactory(value);
          break;
      }
      updateFormData({ [field]: value });
    },
    [updateFormData]
  );

  const handleExclusiveChange = (checked: boolean) => {
    setIsExclusive(checked);
    updateFormData({ isExclusive: checked });
  };

  useEffect(() => {
    return () => {
      if (initializedRef.current) {
        updateFormData({
          product_categories: productCategories,
          product_capability: capabilities,
          export_market: exportMarket,
          material_specialist: materialSpecialties,
          moq,
          leadTimeMin,
          leadTimeMax,
          samplePricing,
          productionCapacity,
          certifications,
          isExclusive,
          aboutFactory,
        });
      }
    };
  }, [
    productCategories,
    materialSpecialties,
    moq,
    leadTimeMin,
    leadTimeMax,
    samplePricing,
    productionCapacity,
    certifications,
    isExclusive,
    aboutFactory,
    exportMarket,
    capabilities,
    updateFormData,
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 `}>Manufacturing Capabilities</h2>
        <p className="text-[#1C1917]">Tell us about your production capabilities and specialties</p>
      </div>

      <div className="space-y-4">
        {/* Product Categories */}
        <div>
          <Label className="text-base font-medium">Product Categories</Label>
          <p className="text-sm text-[#1C1917] mb-3">Select all product types you can manufacture</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {productCategoryOptions.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={productCategories.includes(category)}
                  onCheckedChange={() =>
                    toggleCheckboxValue(productCategories, category, setProductCategories, "product_categories")
                  }
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-base font-medium">Capabilities</Label>
          <p className="text-sm text-[#1C1917] mb-3">Select all capabilities your factory offers</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {capabilityOptions.map((capability) => (
              <div key={capability} className="flex items-center space-x-2">
                <Checkbox
                  id={`capability-${capability}`}
                  checked={capabilities.includes(capability)}
                  onCheckedChange={() =>
                    toggleCheckboxValue(capabilities, capability, setCapabilities, "product_capability")
                  }
                />
                <Label htmlFor={`capability-${capability}`}>{capability}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Material Specialties */}
        <div>
          <Label className="text-base font-medium">Material Specialties</Label>
          <p className="text-sm text-[#1C1917] mb-3">Select all materials you work with</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {materialOptions.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={materialSpecialties.includes(material)}
                  onCheckedChange={() =>
                    toggleCheckboxValue(materialSpecialties, material, setMaterialSpecialties, "material_specialist")
                  }
                />
                <Label htmlFor={`material-${material}`}>{material}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
            <Input
              id="moq"
              type="number"
              placeholder="e.g., 100"
              value={moq}
              onChange={(e) => handleInputChange("moq", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Lead Time (in days)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="leadTimeMin"
                type="number"
                placeholder="Min"
                className="w-1/2"
                value={leadTimeMin}
                onChange={(e) => handleInputChange("leadTimeMin", e.target.value)}
              />
              <span>to</span>
              <Input
                id="leadTimeMax"
                type="number"
                placeholder="Max"
                className="w-1/2"
                value={leadTimeMax}
                onChange={(e) => handleInputChange("leadTimeMax", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="samplePricing">Sample Pricing</Label>
            <Input
              id="samplePricing"
              placeholder="e.g., $50-100"
              value={samplePricing}
              onChange={(e) => handleInputChange("samplePricing", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionCapacity">Monthly Production Capacity</Label>
            <Input
              id="productionCapacity"
              placeholder="e.g., 5000 units"
              value={productionCapacity}
              onChange={(e) => handleInputChange("productionCapacity", e.target.value)}
            />
          </div>
        </div>

        {/* Certifications */}
        <div>
          <Label className="text-base font-medium">Certifications</Label>
          <p className="text-sm text-[#1C1917] mb-3">Select all certifications your facility has</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {certificationOptions.map((cert) => (
              <div key={cert} className="flex items-center space-x-2">
                <Checkbox
                  id={`cert-${cert}`}
                  checked={certifications.includes(cert)}
                  onCheckedChange={() => toggleCheckboxValue(certifications, cert, setCertifications, "certifications")}
                />
                <Label htmlFor={`cert-${cert}`}>{cert}</Label>
              </div>
            ))}
          </div>
        </div>

        {/*Export Market  */}
        <div>
          <Label className="text-base font-medium">Export Market</Label>
          <p className="text-sm text-[#1C1917] mb-3">Select all export markets you work with</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {exportMarkets.map((market) => (
              <div key={market} className="flex items-center space-x-2">
                <Checkbox
                  id={`market-${market}`}
                  checked={exportMarket.includes(market)}
                  onCheckedChange={() => toggleCheckboxValue(exportMarket, market, setExportMarket, "export_market")}
                />
                <Label htmlFor={`market-${market}`}>{market}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Exclusive Partnership */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="isExclusive"
            checked={isExclusive}
            onCheckedChange={(checked) => handleExclusiveChange(checked === true)}
          />
          <Label htmlFor="isExclusive">I’m interested in becoming an exclusive Genpire manufacturing partner</Label>
        </div>

        {/* About Factory */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="aboutFactory">About Your Factory</Label>
          <Textarea
            id="aboutFactory"
            placeholder="Tell us more about your manufacturing facility, history, and what makes you unique..."
            className="min-h-[100px]"
            value={aboutFactory}
            onChange={(e) => handleInputChange("aboutFactory", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

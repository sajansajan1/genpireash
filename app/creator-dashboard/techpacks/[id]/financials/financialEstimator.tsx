"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, TrendingUp, DollarSign, Calculator, Lightbulb, Download, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetTechPackStore } from "@/lib/zustand/techpacks/getTechPack";

interface TechPack {
  id: string;
  tech_pack: {
    productName: string;
    productOverview: string;
  };
  user_id: string;
}

interface FinancialEstimatorProps {
  techPack: TechPack;
}
function parseNumeric(value: any): number {
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, ""); // remove non-numeric characters
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return typeof value === "number" ? value : 0;
}

export default function FinancialEstimator({ id }: any) {
  const router = useRouter();
  const [sampleCosts, setSampleCosts] = useState({
    materials: 0,
    labor: 0,
    overhead: 0,
    toolingSetup: 0,
    shipping: 0,
  });

  // First Order Production Costs
  const [productionCosts, setProductionCosts] = useState({
    materialsPerUnit: 0,
    laborPerUnit: 0,
    overheadPerUnit: 0,
    qualityControl: 0,
    packaging: 0,
    orderQuantity: 0,
  });

  // Logistics Costs
  const [logisticsCosts, setLogisticsCosts] = useState({
    domesticShipping: 0,
    internationalShipping: 0,
    customsDuties: 0, // percentage
    warehousing: 0,
    insurance: 0, // percentage
  });

  // Compliance Costs
  const [complianceCosts, setComplianceCosts] = useState({
    testing: 0,
    certification: 0,
    labeling: 0,
    documentation: 0,
  });

  // Pricing Strategy
  const [pricingStrategy, setPricingStrategy] = useState({
    wholesaleMarkup: 0, // percentage
    retailMarkup: 0, // percentage
  });

  // Income Estimation
  const [incomeEstimation, setIncomeEstimation] = useState({
    monthlyUnits: 0,
    growthRate: 0, // percentage per month
    seasonalityFactor: 0,
    marketPenetration: 0, // percentage
  });
  const { fetchGetTechPack, getTechPack, loadingGetTechPack, errorGetTechPack, refreshGetTechPack } =
    useGetTechPackStore();
  useEffect(() => {
    if (id) {
      refreshGetTechPack(id);
      fetchGetTechPack({ id });
    }
  }, [id, fetchGetTechPack]);

  // Sample Production Costs
  useEffect(() => {
    if (!getTechPack?.tech_pack?.costStructure) return;

    const cost = getTechPack.tech_pack.costStructure.sampleCost;
    const production = getTechPack.tech_pack.costStructure.productionCost;
    const logistics = getTechPack.tech_pack.costStructure.logisticsCost;
    const compliance = getTechPack.tech_pack.costStructure.complianceCost;
    const pricing = getTechPack.tech_pack.costStructure.pricingStrategy;
    const income = getTechPack.tech_pack.costStructure.incomeEstimation;

    if (cost) {
      setSampleCosts({
        materials: parseNumeric(cost.materials),
        labor: parseNumeric(cost.labor),
        overhead: parseNumeric(cost.overhead),
        toolingSetup: parseNumeric(cost.toolingSetup),
        shipping: parseNumeric(cost.shipping),
      });
    }

    if (production) {
      setProductionCosts({
        materialsPerUnit: parseNumeric(production.materialsPerUnit),
        laborPerUnit: parseNumeric(production.laborPerUnit),
        overheadPerUnit: parseNumeric(production.overheadPerUnit),
        qualityControl: parseNumeric(production.qualityControl),
        packaging: parseNumeric(production.packaging),
        orderQuantity: parseNumeric(production.orderQuantity),
      });
    }

    if (logistics) {
      setLogisticsCosts({
        domesticShipping: parseNumeric(logistics.domesticShipping),
        internationalShipping: parseNumeric(logistics.internationalShipping),
        customsDuties: parseNumeric(logistics.customsDutiesPercent),
        warehousing: parseNumeric(logistics.warehousing),
        insurance: parseNumeric(logistics.insurancePercent),
      });
    }

    if (compliance) {
      setComplianceCosts({
        testing: parseNumeric(compliance.testing),
        certification: parseNumeric(compliance.certification),
        labeling: parseNumeric(compliance.labeling),
        documentation: parseNumeric(compliance.documentation),
      });
    }

    if (pricing) {
      setPricingStrategy({
        wholesaleMarkup: parseNumeric(pricing.wholesaleMarkupPercent),
        retailMarkup: parseNumeric(pricing.retailMarkupPercent),
      });
    }

    if (income) {
      setIncomeEstimation({
        monthlyUnits: parseNumeric(income.monthlyUnits),
        growthRate: parseNumeric(income.growthRatePercent),
        seasonalityFactor: parseNumeric(income.seasonalityFactor),
        marketPenetration: parseNumeric(income.marketPenetrationPercent),
      });
    }
  }, [getTechPack]);

  if (loadingGetTechPack || !getTechPack || errorGetTechPack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!getTechPack.tech_pack.costStructure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Financial Estimator Not Found</h1>
          <button onClick={() => router.push("/creator-dashboard")} className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  // Calculations
  const totalSampleCost = Object.values(sampleCosts).reduce((sum, cost) => sum + cost, 0);
  const unitProductionCost =
    productionCosts.materialsPerUnit +
    productionCosts.laborPerUnit +
    productionCosts.overheadPerUnit +
    productionCosts.qualityControl +
    productionCosts.packaging;

  const totalComplianceCost = Object.values(complianceCosts).reduce((sum, cost) => sum + cost, 0);
  const totalLogisticsCost = Object.values(logisticsCosts).reduce((sum, cost) => sum + cost, 0);
  const wholesalePrice = unitProductionCost * (1 + pricingStrategy.wholesaleMarkup / 100);
  const retailPrice = wholesalePrice * (1 + pricingStrategy.retailMarkup / 100);

  const monthlyRevenue = incomeEstimation.monthlyUnits * retailPrice;
  const monthlyProfit = monthlyRevenue - incomeEstimation.monthlyUnits * unitProductionCost;
  const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  const exportFinancialReport = () => {
    const reportData = {
      productName: getTechPack.tech_pack.productName,
      sampleCosts,
      productionCosts,
      logisticsCosts,
      complianceCosts,
      pricingStrategy,
      incomeEstimation,
      calculations: {
        totalSampleCost,
        unitProductionCost,
        totalComplianceCost,
        wholesalePrice,
        retailPrice,
        monthlyRevenue,
        monthlyProfit,
        profitMargin,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getTechPack.tech_pack.productName}-financial-report.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/creator-dashboard/techpacks")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tech Packs
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Estimator</h1>
              <p className="text-gray-600">{getTechPack.tech_pack.productName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportFinancialReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cost Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sample Production Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Sample Production Costs
                </CardTitle>
                <CardDescription>One-time costs for creating your first sample</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="materials">Materials</Label>
                    <Input
                      id="materials"
                      type="number"
                      step="0.01"
                      value={sampleCosts.materials}
                      onChange={(e) =>
                        setSampleCosts({ ...sampleCosts, materials: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="labor">Labor</Label>
                    <Input
                      id="labor"
                      type="number"
                      step="0.01"
                      value={sampleCosts.labor}
                      onChange={(e) =>
                        setSampleCosts({ ...sampleCosts, labor: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="overhead">Overhead</Label>
                    <Input
                      id="overhead"
                      type="number"
                      step="0.01"
                      value={sampleCosts.overhead}
                      onChange={(e) =>
                        setSampleCosts({ ...sampleCosts, overhead: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="toolingSetup">Tooling/Setup</Label>
                    <Input
                      id="toolingSetup"
                      type="number"
                      step="0.01"
                      value={sampleCosts.toolingSetup}
                      onChange={(e) =>
                        setSampleCosts({ ...sampleCosts, toolingSetup: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping">Shipping</Label>
                    <Input
                      id="shipping"
                      type="number"
                      step="0.01"
                      value={sampleCosts.shipping}
                      onChange={(e) =>
                        setSampleCosts({ ...sampleCosts, shipping: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Sample Cost:</span>
                  <span className="text-blue-600">${totalSampleCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* First Order Production Costs */}
            <Card>
              <CardHeader>
                <CardTitle>First Order Production Costs</CardTitle>
                <CardDescription>Per-unit costs for your first production run</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="materialsPerUnit">Materials per Unit</Label>
                    <Input
                      id="materialsPerUnit"
                      type="number"
                      step="0.01"
                      value={productionCosts.materialsPerUnit}
                      onChange={(e) =>
                        setProductionCosts({
                          ...productionCosts,
                          materialsPerUnit: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="laborPerUnit">Labor per Unit</Label>
                    <Input
                      id="laborPerUnit"
                      type="number"
                      step="0.01"
                      value={productionCosts.laborPerUnit}
                      onChange={(e) =>
                        setProductionCosts({ ...productionCosts, laborPerUnit: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="overheadPerUnit">Overhead per Unit</Label>
                    <Input
                      id="overheadPerUnit"
                      type="number"
                      step="0.01"
                      value={productionCosts.overheadPerUnit}
                      onChange={(e) =>
                        setProductionCosts({
                          ...productionCosts,
                          overheadPerUnit: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualityControl">Quality Control</Label>
                    <Input
                      id="qualityControl"
                      type="number"
                      step="0.01"
                      value={productionCosts.qualityControl}
                      onChange={(e) =>
                        setProductionCosts({
                          ...productionCosts,
                          qualityControl: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="packaging">Packaging</Label>
                    <Input
                      id="packaging"
                      type="number"
                      step="0.01"
                      value={productionCosts.packaging}
                      onChange={(e) =>
                        setProductionCosts({ ...productionCosts, packaging: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderQuantity">Order Quantity</Label>
                    <Input
                      id="orderQuantity"
                      type="number"
                      value={productionCosts.orderQuantity}
                      onChange={(e) =>
                        setProductionCosts({ ...productionCosts, orderQuantity: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Unit Production Cost:</span>
                  <span className="text-green-600">${unitProductionCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Logistics Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Logistics Costs</CardTitle>
                <CardDescription>Shipping, customs, and handling costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domesticShipping">Domestic Shipping</Label>
                    <Input
                      id="domesticShipping"
                      type="number"
                      step="0.01"
                      value={logisticsCosts.domesticShipping}
                      onChange={(e) =>
                        setLogisticsCosts({
                          ...logisticsCosts,
                          domesticShipping: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="internationalShipping">International Shipping</Label>
                    <Input
                      id="internationalShipping"
                      type="number"
                      step="0.01"
                      value={logisticsCosts.internationalShipping}
                      onChange={(e) =>
                        setLogisticsCosts({
                          ...logisticsCosts,
                          internationalShipping: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customsDuties">Customs Duties (%)</Label>
                    <Input
                      id="customsDuties"
                      type="number"
                      step="0.1"
                      value={logisticsCosts.customsDuties}
                      onChange={(e) =>
                        setLogisticsCosts({ ...logisticsCosts, customsDuties: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehousing">Warehousing per Unit</Label>
                    <Input
                      id="warehousing"
                      type="number"
                      step="0.01"
                      value={logisticsCosts.warehousing}
                      onChange={(e) =>
                        setLogisticsCosts({ ...logisticsCosts, warehousing: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance">Insurance (%)</Label>
                    <Input
                      id="insurance"
                      type="number"
                      step="0.1"
                      value={logisticsCosts.insurance}
                      onChange={(e) =>
                        setLogisticsCosts({ ...logisticsCosts, insurance: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Logistics Cost:</span>
                  <span className="text-orange-600">${totalLogisticsCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Costs</CardTitle>
                <CardDescription>Testing, certification, and regulatory requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testing">Testing</Label>
                    <Input
                      id="testing"
                      type="number"
                      step="0.01"
                      value={complianceCosts.testing}
                      onChange={(e) =>
                        setComplianceCosts({ ...complianceCosts, testing: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="certification">Certification</Label>
                    <Input
                      id="certification"
                      type="number"
                      step="0.01"
                      value={complianceCosts.certification}
                      onChange={(e) =>
                        setComplianceCosts({
                          ...complianceCosts,
                          certification: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="labeling">Labeling</Label>
                    <Input
                      id="labeling"
                      type="number"
                      step="0.01"
                      value={complianceCosts.labeling}
                      onChange={(e) =>
                        setComplianceCosts({ ...complianceCosts, labeling: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="documentation">Documentation</Label>
                    <Input
                      id="documentation"
                      type="number"
                      step="0.01"
                      value={complianceCosts.documentation}
                      onChange={(e) =>
                        setComplianceCosts({
                          ...complianceCosts,
                          documentation: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Compliance Cost:</span>
                  <span className="text-orange-600">${totalComplianceCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Projections */}
          <div className="space-y-6">
            {/* Pricing Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="wholesaleMarkup">Wholesale Markup (%)</Label>
                  <Input
                    id="wholesaleMarkup"
                    type="number"
                    value={pricingStrategy.wholesaleMarkup}
                    onChange={(e) =>
                      setPricingStrategy({ ...pricingStrategy, wholesaleMarkup: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="retailMarkup">Retail Markup (%)</Label>
                  <Input
                    id="retailMarkup"
                    type="number"
                    value={pricingStrategy.retailMarkup}
                    onChange={(e) =>
                      setPricingStrategy({ ...pricingStrategy, retailMarkup: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Wholesale Price:</span>
                    <span className="font-semibold">${wholesalePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail Price:</span>
                    <span className="font-semibold text-green-600">${retailPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Estimation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Income Estimation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monthlyUnits">Monthly Units</Label>
                  <Input
                    id="monthlyUnits"
                    type="number"
                    value={incomeEstimation.monthlyUnits}
                    onChange={(e) =>
                      setIncomeEstimation({ ...incomeEstimation, monthlyUnits: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="growthRate">Growth Rate (% per month)</Label>
                  <Input
                    id="growthRate"
                    type="number"
                    value={incomeEstimation.growthRate}
                    onChange={(e) =>
                      setIncomeEstimation({ ...incomeEstimation, growthRate: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="seasonalityFactor">Seasonality Factor</Label>
                  <Input
                    id="seasonalityFactor"
                    type="number"
                    step="0.1"
                    value={incomeEstimation.seasonalityFactor}
                    onChange={(e) =>
                      setIncomeEstimation({
                        ...incomeEstimation,
                        seasonalityFactor: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="marketPenetration">Market Penetration (%)</Label>
                  <Input
                    id="marketPenetration"
                    type="number"
                    value={incomeEstimation.marketPenetration}
                    onChange={(e) =>
                      setIncomeEstimation({
                        ...incomeEstimation,
                        marketPenetration: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Revenue:</span>
                    <span className="font-semibold">${monthlyRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Profit:</span>
                    <span className="font-semibold text-green-600">${monthlyProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-semibold">{profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Margin Health */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Margin</span>
                    <span>{profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(profitMargin, 100)} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {profitMargin >= 50
                      ? "Excellent"
                      : profitMargin >= 30
                      ? "Good"
                      : profitMargin >= 15
                      ? "Fair"
                      : "Needs Improvement"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Cost Optimization:</strong> Consider bulk material purchasing to reduce unit costs by 8-12%
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Pricing Strategy:</strong> Your current margin is healthy. Consider premium positioning.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Market Entry:</strong> Start with smaller quantities to test market response
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Break-even Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Break-even Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Break-even Units:</span>
                  <span className="font-semibold">
                    {monthlyProfit > 0 ? Math.ceil(totalSampleCost / (retailPrice - unitProductionCost)) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ROI Timeline:</span>
                  <span className="font-semibold">
                    {monthlyProfit > 0 ? Math.ceil(totalSampleCost / monthlyProfit) : "N/A"} months
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

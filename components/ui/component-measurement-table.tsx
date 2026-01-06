"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Package, Ruler, Weight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ComponentMeasurementTable, ComponentPoint } from "@/lib/utils/component-measurement-table";

interface ComponentMeasurementTableProps {
  data: ComponentMeasurementTable;
  className?: string;
}

export function ComponentMeasurementDisplay({ data, className = "" }: ComponentMeasurementTableProps) {
  if (!data || !data.components || data.components.length === 0) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardContent className="p-6">
          <p className="text-sm text-[#1C1917] text-center">No component measurement data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              {data.title}
            </CardTitle>
            <CardDescription className="text-sm">Component-specific measurements and specifications</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <Ruler className="h-3 w-3 mr-1" />
              {data.unit}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Weight className="h-3 w-3 mr-1" />
              {data.weightUnit}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                <TableHead className="w-[60px] text-center">Point</TableHead>
                <TableHead className="min-w-[150px]">Component</TableHead>
                <TableHead className="text-center">Width</TableHead>
                <TableHead className="text-center">Height</TableHead>
                <TableHead className="text-center">Length</TableHead>
                <TableHead className="text-center">Depth</TableHead>
                <TableHead className="text-center">Weight</TableHead>
                <TableHead className="min-w-[100px]">Material</TableHead>
                <TableHead className="min-w-[150px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.components.map((component, index) => (
                <TableRow key={component.indicator} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <TableCell className="text-center font-medium">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-zinc-900-foreground text-sm font-bold">
                      {component.indicator}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{component.componentName}</TableCell>
                  <TableCell className="text-center">
                    {renderMeasurement(component.measurements.width, data.unit)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderMeasurement(component.measurements.height, data.unit)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderMeasurement(component.measurements.length, data.unit)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderMeasurement(component.measurements.depth, data.unit)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderMeasurement(component.measurements.weight, data.weightUnit)}
                  </TableCell>
                  <TableCell>
                    {component.material ? (
                      <Badge variant="secondary" className="text-xs">
                        {component.material}
                      </Badge>
                    ) : (
                      <span className="text-[#1C1917]">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[#1C1917]">
                    {component.notes ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <Info className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{component.notes}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{component.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Render a single measurement with tolerance
 */
function renderMeasurement(
  measurement: { value: string | number; tolerance?: string } | undefined,
  unit: string
): React.ReactNode {
  if (!measurement) {
    return <span className="text-[#1C1917]">-</span>;
  }

  const isTBD = measurement.value === "TBD";

  return (
    <div className="flex flex-col items-center">
      <Badge variant={isTBD ? "outline" : "default"} className="text-xs">
        {measurement.value}
        {!isTBD && ` ${unit}`}
      </Badge>
      {measurement.tolerance && <span className="text-[10px] text-[#1C1917] mt-0.5">{measurement.tolerance}</span>}
    </div>
  );
}

/**
 * Compact card view for component measurements
 */
export function ComponentMeasurementCard({
  component,
  unit,
  weightUnit,
}: {
  component: ComponentPoint;
  unit: string;
  weightUnit: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-lg font-bold shrink-0">
          {component.indicator}
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-semibold text-base">{component.componentName}</h4>
            {component.material && (
              <Badge variant="secondary" className="text-xs mt-1">
                {component.material}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {component.measurements.width && (
              <div>
                <span className="text-[#1C1917]">Width:</span>{" "}
                <span className="font-medium">
                  {component.measurements.width.value} {unit}
                  {component.measurements.width.tolerance && (
                    <span className="text-xs text-[#1C1917] ml-1">({component.measurements.width.tolerance})</span>
                  )}
                </span>
              </div>
            )}
            {component.measurements.height && (
              <div>
                <span className="text-[#1C1917]">Height:</span>{" "}
                <span className="font-medium">
                  {component.measurements.height.value} {unit}
                  {component.measurements.height.tolerance && (
                    <span className="text-xs text-[#1C1917] ml-1">({component.measurements.height.tolerance})</span>
                  )}
                </span>
              </div>
            )}
            {component.measurements.length && (
              <div>
                <span className="text-[#1C1917]">Length:</span>{" "}
                <span className="font-medium">
                  {component.measurements.length.value} {unit}
                  {component.measurements.length.tolerance && (
                    <span className="text-xs text-[#1C1917] ml-1">({component.measurements.length.tolerance})</span>
                  )}
                </span>
              </div>
            )}
            {component.measurements.depth && (
              <div>
                <span className="text-[#1C1917]">Depth:</span>{" "}
                <span className="font-medium">
                  {component.measurements.depth.value} {unit}
                  {component.measurements.depth.tolerance && (
                    <span className="text-xs text-[#1C1917] ml-1">({component.measurements.depth.tolerance})</span>
                  )}
                </span>
              </div>
            )}
            {component.measurements.weight && (
              <div>
                <span className="text-[#1C1917]">Weight:</span>{" "}
                <span className="font-medium">
                  {component.measurements.weight.value} {weightUnit}
                  {component.measurements.weight.tolerance && (
                    <span className="text-xs text-[#1C1917] ml-1">({component.measurements.weight.tolerance})</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {component.notes && <p className="text-xs text-[#1C1917] italic mt-2">{component.notes}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid view of all components
 */
export function ComponentMeasurementGrid({ data, className = "" }: ComponentMeasurementTableProps) {
  if (!data || !data.components || data.components.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Component Specifications</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            <Ruler className="h-3 w-3 mr-1" />
            {data.unit}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Weight className="h-3 w-3 mr-1" />
            {data.weightUnit}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.components.map((component) => (
          <ComponentMeasurementCard
            key={component.indicator}
            component={component}
            unit={data.unit}
            weightUnit={data.weightUnit}
          />
        ))}
      </div>
    </div>
  );
}

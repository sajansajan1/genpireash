import ExcelJS from "exceljs";

/**
 * Helper function to add image to Excel worksheet
 * Expects images to be already optimized as data URLs or buffers
 */
async function addImageToWorksheet(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  imageUrl: string,
  cellReference: string,
  options?: {
    width?: number;
    height?: number;
  }
): Promise<boolean> {
  try {
    let imageBuffer: ArrayBuffer;
    
    // Check if it's a data URL
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBuffer = bytes.buffer;
    } else if (imageUrl.startsWith('http')) {
      // If it's still a URL, fetch it (images should ideally be pre-optimized)
      const response = await fetch(imageUrl);
      imageBuffer = await response.arrayBuffer();
    } else {
      // Assume it's base64
      const binaryString = atob(imageUrl);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBuffer = bytes.buffer;
    }
    
    // Add image to workbook using ArrayBuffer
    const imageId = workbook.addImage({
      buffer: imageBuffer as any,
      extension: 'jpeg',
    });
    
    // Calculate position from cell reference (e.g., "B5")
    const col = cellReference.charCodeAt(0) - 65; // A=0, B=1, etc.
    const row = parseInt(cellReference.substring(1)) - 1;
    
    // Add image to worksheet
    worksheet.addImage(imageId, {
      tl: { col, row },
      ext: { 
        width: options?.width || 200, 
        height: options?.height || 200 
      },
      editAs: 'oneCell' // Image moves with cell
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to add image to Excel:`, error);
    return false;
  }
}

export const generateExcelFromData = async ({ tech_pack }: { tech_pack: any }) => {
  const workbook = new ExcelJS.Workbook();

  // Utility: style header rows
  const styleHeader = (row: any) => {
    row.font = { bold: true, size: 16 };
    row.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    row.height = 28;
    row.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };
    row.eachCell((cell: any) => {
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF000000" } },
      };
    });
  };

  const styleRow = (row: any) => {
    row.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    row.height = 22;

    // Label (col 1)
    row.getCell(1).font = { bold: true };
    row.getCell(1).border = {
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  };
  const stylechild = (row: any) => {
    row.font = { bold: true, size: 12 };
    row.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    row.height = 24;
    row.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6E6" },
    };
  };

  // Utility to add styled row
  function addStyledRow(sheet: ExcelJS.Worksheet, values: any[]) {
    let row = sheet.addRow(values);
    styleRow(row);
  }

  // SHEET 1 - PRODUCT DETAILS
  const sheet1 = workbook.addWorksheet("Product Details");

  // Set default column widths
  sheet1.getColumn(1).width = 25;
  sheet1.getColumn(2).width = 50;

  // Title
  let titleRow = sheet1.addRow(["Product Details"]);
  styleHeader(titleRow);
  sheet1.mergeCells(`A${titleRow.number}:B${titleRow.number}`);

  // Product details rows
  addStyledRow(sheet1, ["Product Name", tech_pack.tech_pack.productName || "No Name specified"]);
  addStyledRow(sheet1, ["Product price", tech_pack.tech_pack.price || "No price specified"]);
  addStyledRow(sheet1, ["Lead Time", tech_pack.tech_pack.estimatedLeadTime || "No lead-time specified"]);
  addStyledRow(sheet1, ["Description", tech_pack.tech_pack.productOverview || "No description provided"]);
  addStyledRow(sheet1, ["Product Notes", tech_pack.tech_pack.productionNotes || "Not specified"]);
  addStyledRow(sheet1, ["Category & Subcategory", tech_pack.tech_pack.category_Subcategory || "Not Specified"]);
  addStyledRow(sheet1, ["Intended Market & AgeRange", tech_pack.tech_pack.intendedMarket_AgeRange || "Not Specified"]);
  addStyledRow(sheet1, ["Care Instructions", tech_pack.tech_pack.careInstructions || "Not Specified"]);

  // Empty row for spacing
  sheet1.addRow([]);

  // --- Section: Materials ---
  let matTitle = sheet1.addRow(["Materials"]);
  styleHeader(matTitle);
  sheet1.mergeCells(`A${matTitle.number}:B${matTitle.number}`);

  if (tech_pack.tech_pack.materials?.length > 0) {
    // Add header row
    let header = sheet1.addRow(["Component", "Material", "Specification", "Quantity Per Unit", "Unit Cost", "Notes"]);
    stylechild(header);

    // Set column widths for materials table
    sheet1.getColumn(1).width = 20; // Component
    sheet1.getColumn(2).width = 18; // Material
    sheet1.getColumn(3).width = 30; // Specification
    sheet1.getColumn(4).width = 18; // Quantity Per Unit
    sheet1.getColumn(5).width = 15; // Unit Cost
    sheet1.getColumn(6).width = 25; // Notes

    // Add rows
    tech_pack.tech_pack.materials.forEach((m: any) => {
      let row = sheet1.addRow([
        m.component || "-",
        m.material || "-",
        m.specification || "-",
        m.quantityPerUnit || "-",
        m.unitCost || "-",
        m.notes || "-",
      ]);

      // Apply style with text wrapping
      row.alignment = { vertical: "top", wrapText: true };
      row.getCell(3).alignment = { wrapText: true, vertical: "top" }; // Specification
      row.getCell(6).alignment = { wrapText: true, vertical: "top" }; // Notes
    });
  } else {
    let row = sheet1.addRow(["No materials specified"]);
    sheet1.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet1.addRow([]);

  // --- Section: Colors ---
  let colorTitle = sheet1.addRow(["Colorways"]);
  styleHeader(colorTitle);
  sheet1.mergeCells(`A${colorTitle.number}:B${colorTitle.number}`);

  // Reset column widths for color section
  sheet1.getColumn(1).width = 25;
  sheet1.getColumn(2).width = 50;

  if (tech_pack.tech_pack.colors) {
    addStyledRow(sheet1, ["Style Notes", tech_pack.tech_pack.colors.styleNotes || "-"]);
    addStyledRow(sheet1, ["Trend Alignment", tech_pack.tech_pack.colors.trendAlignment || "-"]);
    addStyledRow(sheet1, [
      "Primary Colors",
      tech_pack.tech_pack.colors.primaryColors?.map((c: any) => `${c.name} (${c.hex})`).join(", ") ||
        "No Primary colors specified",
    ]);
    addStyledRow(sheet1, [
      "Accent Colors",
      tech_pack.tech_pack.colors.accentColors?.map((c: any) => `${c.name} (${c.hex})`).join(", ") ||
        "No accent colors specified",
    ]);
  } else {
    let row = sheet1.addRow(["No colorways specified"]);
    sheet1.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  // ============================
  // SHEET 2 - HARDWARE & CONSTRUCTION
  // ============================
  const sheet2 = workbook.addWorksheet("Hardware");

  // Set default column widths
  sheet2.getColumn(1).width = 25;
  sheet2.getColumn(2).width = 50;

  // --- Section: Hardware ---
  let hardwareTitle = sheet2.addRow(["Hardware"]);
  styleHeader(hardwareTitle);
  sheet2.mergeCells(`A${hardwareTitle.number}:B${hardwareTitle.number}`);

  if (tech_pack.tech_pack.hardwareComponents?.hardware?.length > 0) {
    if (tech_pack.tech_pack.hardwareComponents.description) {
      addStyledRow(sheet2, ["Description", tech_pack.tech_pack.hardwareComponents.description]);
    }
    if (tech_pack.tech_pack.hardwareComponents.hardware?.length > 0) {
      addStyledRow(sheet2, ["Hardware Components", tech_pack.tech_pack.hardwareComponents.hardware.join(", ")]);
    } else {
      addStyledRow(sheet2, ["Hardware Components", "No hardware specified"]);
    }
  } else {
    let row = sheet2.addRow(["No hardware components provided"]);
    sheet2.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet2.addRow([]);

  // --- Section: Construction ---
  let constructionTitle = sheet2.addRow(["Construction Details"]);
  styleHeader(constructionTitle);
  sheet2.mergeCells(`A${constructionTitle.number}:B${constructionTitle.number}`);

  if (tech_pack.tech_pack.constructionDetails) {
    // Description row (if exists)
    if (tech_pack.tech_pack.constructionDetails.description) {
      addStyledRow(sheet2, ["Description", tech_pack.tech_pack.constructionDetails.description]);
    }

    sheet2.addRow([]);

    if (tech_pack.tech_pack.rules?.length > 0) {
      // Add header row
      let rulesHeader = sheet2.addRow(["Rule No.", "Rule"]);
      styleHeader(rulesHeader);

      // Add each rule row
      tech_pack.tech_pack.rules.forEach(({ rule, index }: { rule: string; index: number }) => {
        addStyledRow(sheet2, [index + 1, rule]);
      });
    } else {
      let row = sheet2.addRow(["No rules specified"]);
      sheet2.mergeCells(`A${row.number}:B${row.number}`);
      styleRow(row);
    }

    // --- Section: Packaging ---
    sheet2.addRow([]);
    if (tech_pack.tech_pack.constructionDetails.constructionFeatures?.length > 0) {
      // Add header row
      let featureHeader = sheet2.addRow(["Construction Feature", "Details"]);
      styleHeader(featureHeader);

      // Add each feature row
      tech_pack.tech_pack.constructionDetails.constructionFeatures.forEach((f: any) => {
        addStyledRow(sheet2, [f.featureName || "-", f.details || "-"]);
      });
    } else {
      let row = sheet2.addRow(["No construction features specified"]);
      sheet2.mergeCells(`A${row.number}:B${row.number}`);
      styleRow(row);
    }
  } else {
    let row = sheet2.addRow(["No construction details provided"]);
    sheet2.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }
  sheet2.addRow([]);

  let packagingTitle = sheet2.addRow(["Packaging"]);
  styleHeader(packagingTitle);
  sheet2.mergeCells(`A${packagingTitle.number}:B${packagingTitle.number}`);

  if (tech_pack.tech_pack.packaging) {
    // Description & Notes
    if (tech_pack.tech_pack.packaging.description) {
      addStyledRow(sheet2, ["Description", tech_pack.tech_pack.packaging.description]);
    }
    if (tech_pack.tech_pack.packaging.notes) {
      addStyledRow(sheet2, ["Notes", tech_pack.tech_pack.packaging.notes]);
    }

    // Packaging Details
    if (tech_pack.tech_pack.packaging.packagingDetails) {
      let p = tech_pack.tech_pack.packaging.packagingDetails;

      addStyledRow(sheet2, ["Packaging Type", p.packagingType || "-"]);
      addStyledRow(sheet2, ["Material Specification", p.materialSpec || "-"]);
      addStyledRow(sheet2, ["Closure Type", p.closureType || "-"]);
      addStyledRow(sheet2, ["Inner Packaging", p.innerPackaging || "-"]);
      addStyledRow(sheet2, ["Artwork File Reference", p.artworkFileReference || "-"]);
      addStyledRow(sheet2, ["Barcode & Label Placement", p.barcodeAndLabelPlacement || "-"]);
    }
  } else {
    let row = sheet2.addRow(["No packaging details provided"]);
    sheet2.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet2.addRow([]);

  if (tech_pack.tech_pack.productionLogistics) {
    const prodLog = tech_pack.tech_pack.productionLogistics;

    // Section header
    let sectionHeader = sheet2.addRow(["Production & Logistics"]);
    styleHeader(sectionHeader);
    sheet2.mergeCells(`A${sectionHeader.number}:B${sectionHeader.number}`);

    // Add rows
    if (prodLog.MOQ) {
      addStyledRow(sheet2, ["MOQ", prodLog.MOQ]);
    }
    if (prodLog.leadTime) {
      addStyledRow(sheet2, ["Lead Time", prodLog.leadTime]);
    }
    if (prodLog.sampleRequirements) {
      addStyledRow(sheet2, ["Sample Requirements", prodLog.sampleRequirements]);
    }
  } else {
    let row = sheet2.addRow(["No production & logistics details provided"]);
    sheet2.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet2.addRow([]);
  let qualityHeader = sheet2.addRow(["Quality Standard"]);
  styleHeader(qualityHeader);
  sheet2.mergeCells(`A${qualityHeader.number}:B${qualityHeader.number}`);
  addStyledRow(sheet2, ["Quality Standard", tech_pack.tech_pack.qualityStandards || "----"]);

  // ============================
  // SHEET 3 - MEASUREMENTS
  // ============================
  const sheet3 = workbook.addWorksheet("Measurements");

  // Set column widths
  sheet3.getColumn(1).width = 25;
  sheet3.getColumn(2).width = 15;
  sheet3.getColumn(3).width = 15;

  // Add a title row at the top
  let measurementsTitle = sheet3.addRow(["Measurements and Tolerance"]);
  styleHeader(measurementsTitle);

  sheet3.mergeCells(`A${measurementsTitle.number}:C${measurementsTitle.number}`);

  // Add header row
  let dimHeader = sheet3.addRow(["Measurement", "Value", "Tolerance"]);
  stylechild(dimHeader);

  // Add data rows
  if (tech_pack.tech_pack.dimensions.details?.length > 0) {
    tech_pack.tech_pack.dimensions.details.forEach((d: any) => {
      Object.entries(d).forEach(([measurement, data]: any) => {
        if (data && (data.value || data.tolerance)) {
          let row = sheet3.addRow([
            measurement.charAt(0).toUpperCase() + measurement.slice(1), // Capitalize
            data.value || "-",
            data.tolerance || "-",
          ]);
          row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          row.height = 18;
        }
      });
    });
  } else {
    let row = sheet3.addRow(["No dimension details provided"]);
    sheet3.mergeCells(`A${row.number}:C${row.number}`);
    row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  }

  // ============================
  // SHEET 4 - COST
  // ============================
  const sheet4 = workbook.addWorksheet("Cost");

  // Set column widths
  sheet4.getColumn(1).width = 30;
  sheet4.getColumn(2).width = 50;

  let costTitle = sheet4.addRow(["Cost Estimates"]);
  styleHeader(costTitle);

  sheet4.mergeCells(`A${costTitle.number}:B${costTitle.number}`);

  // --- Section: Sample Creation ---
  if (tech_pack.tech_pack.costIncomeEstimation?.sampleCreation) {
    let s = tech_pack.tech_pack.costIncomeEstimation.sampleCreation;

    // Add section header
    let sampleTitle = sheet4.addRow(["Sample Creation"]);
    stylechild(sampleTitle);
    sheet4.mergeCells(`A${sampleTitle.number}:B${sampleTitle.number}`);

    // Add rows for sample creation cost breakdown
    addStyledRow(sheet4, ["Material Cost", s.materialCost || "-"]);
    addStyledRow(sheet4, ["Labor & Manufacturing Cost", s.laborAndManufacturingCost || "-"]);
    addStyledRow(sheet4, ["Engineering & Development", s.engineeringAndDevelopment || "-"]);
    addStyledRow(sheet4, ["Shipping & Logistics", s.shippingAndLogistics || "-"]);
    addStyledRow(sheet4, ["Sample Cost", s.sampleCost || "-"]);

    if (s.notes) {
      let noteRow = sheet4.addRow(["Notes", s.notes]);
      noteRow.getCell(2).alignment = { wrapText: true, vertical: "top" };
      styleRow(noteRow);
    }
  } else {
    let row = sheet4.addRow(["No sample creation details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  // --- Section: Bulk Production 1000 ---
  if (tech_pack.tech_pack.costIncomeEstimation?.bulkProduction1000) {
    let b = tech_pack.tech_pack.costIncomeEstimation.bulkProduction1000;

    // Add section header
    let bulkTitle = sheet4.addRow(["Bulk Production (1000 Units)"]);
    styleHeader(bulkTitle);
    sheet4.mergeCells(`A${bulkTitle.number}:B${bulkTitle.number}`);

    // Add rows for bulk production cost breakdown
    addStyledRow(sheet4, ["Material Cost", b.materialCost || "-"]);
    addStyledRow(sheet4, ["Labor & Manufacturing Cost", b.laborAndManufacturingCost || "-"]);
    addStyledRow(sheet4, ["Quality & Compliance", b.qualityAndCompliance || "-"]);
    addStyledRow(sheet4, ["Shipping & Logistics", b.shippingAndLogistics || "-"]);
    addStyledRow(sheet4, ["Total Cost for 1000", b.totalCostFor1000 || "-"]);
    addStyledRow(sheet4, ["Unit Cost Breakdown", b.unitCostBreakdown || "-"]);

    if (b.economiesOfScaleNote) {
      let noteRow = sheet4.addRow(["Economies of Scale", b.economiesOfScaleNote]);
      noteRow.getCell(2).alignment = { wrapText: true, vertical: "top" };
      styleRow(noteRow);
    }
  } else {
    let row = sheet4.addRow(["No bulk production details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);
  if (tech_pack.tech_pack.costStructure?.complianceCost) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Compliance Cost", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.complianceCost).forEach(([key, val]) => {
      // measurement.charAt(0).toUpperCase() + measurement.slice(1), // Capitalize
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No compliance cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.incomeEstimation) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Income Estimation", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.incomeEstimation).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No income estimation details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.complianceCost) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Compliance Cost", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.complianceCost).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No compliance cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.logisticsCost) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Logistics Cost", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.logisticsCost).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No logistics cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.pricingStrategy) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Pricing Strategy", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.pricingStrategy).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No compliance cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.productionCost) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Production Cost", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.productionCost).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No production cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }
  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.sampleCost) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Sample Cost", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.sampleCost).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No sample cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  sheet4.addRow([]);

  if (tech_pack.tech_pack.costStructure?.totalEstimatedCost) {
    // Add section header
    let complianceHeader = sheet4.addRow(["Total Estimated Cost", "Details"]);
    styleHeader(complianceHeader);

    // Add each key-value pair
    Object.entries(tech_pack.tech_pack.costStructure.totalEstimatedCost).forEach(([key, val]) => {
      addStyledRow(sheet4, [key.charAt(0).toUpperCase() + key.slice(1), val || "-"]);
    });
  } else {
    let row = sheet4.addRow(["No total estimated cost details provided"]);
    sheet4.mergeCells(`A${row.number}:B${row.number}`);
    styleRow(row);
  }

  // ============================
  // SHEET 5 - PRODUCT IMAGES
  // ============================
  const sheet5 = workbook.addWorksheet("Product Images");

  // Set column widths for images
  sheet5.getColumn(1).width = 20;
  sheet5.getColumn(2).width = 30; // For image
  sheet5.getColumn(3).width = 50; // For URL as backup

  let imagesTitle = sheet5.addRow(["Product Images"]);
  styleHeader(imagesTitle);
  sheet5.mergeCells(`A${imagesTitle.number}:C${imagesTitle.number}`);

  if (tech_pack.image_data) {
    const imgData = tech_pack.image_data;
    
    // Add header row
    let headerRow = sheet5.addRow(["View Type", "Image", "URL"]);
    stylechild(headerRow);
    
    // Process each image view
    const imageViews = [
      { key: 'front', label: 'Front View' },
      { key: 'back', label: 'Back View' },
      { key: 'side', label: 'Side View' }
    ];
    
    for (const view of imageViews) {
      if (imgData[view.key]?.url) {
        const row = sheet5.addRow([view.label, "", imgData[view.key].url]);
        styleRow(row);
        
        // Set row height for image
        row.height = 150;
        
        // Try to embed the actual image
        const cellRef = `B${row.number}`;
        await addImageToWorksheet(
          workbook,
          sheet5,
          imgData[view.key].url,
          cellRef,
          { width: 150, height: 150 }
        );
      }
    }
  } else {
    let row = sheet5.addRow(["No images provided"]);
    sheet5.mergeCells(`A${row.number}:C${row.number}`);
    styleRow(row);
  }
  sheet5.addRow([]);

  let technicalImagesTitle = sheet5.addRow(["Technical Images"]);
  styleHeader(technicalImagesTitle);
  sheet5.mergeCells(`A${technicalImagesTitle.number}:C${technicalImagesTitle.number}`);

  // Header row
  let techHeaderRow = sheet5.addRow(["Type", "Image", "Description/URL"]);
  stylechild(techHeaderRow);

  // Define all technical image types
  const technicalImageTypes = [
    { key: 'backViewImage', label: 'Back View' },
    { key: 'calloutImage', label: 'Callout' },
    { key: 'constructionImage', label: 'Construction' },
    { key: 'detailImage', label: 'Detail' },
    { key: 'measurementImage', label: 'Measurement' },
    { key: 'frontViewImage', label: 'Front View' },
    { key: 'technicalImage', label: 'Technical' },
    { key: 'scaleProportionImage', label: 'Scale/Proportion' },
    { key: 'vectorImage', label: 'Vector' }
  ];

  // Process each technical image type
  for (const imageType of technicalImageTypes) {
    if (tech_pack.technical_images?.[imageType.key]) {
      const img = tech_pack.technical_images[imageType.key];
      const description = img.description || "No description provided";
      const url = img.url || "No URL provided";
      
      const row = sheet5.addRow([imageType.label, "", `${description}\n${url}`]);
      styleRow(row);
      row.height = 150; // Set height for image
      
      // Try to embed the image if URL exists
      if (img.url) {
        const cellRef = `B${row.number}`;
        await addImageToWorksheet(
          workbook,
          sheet5,
          img.url,
          cellRef,
          { width: 150, height: 150 }
        );
      }
    }
  }
  
  // Add a note if no technical images exist
  if (!tech_pack.technical_images || Object.keys(tech_pack.technical_images).length === 0) {
    let row = sheet5.addRow(["No technical images provided"]);
    sheet5.mergeCells(`A${row.number}:C${row.number}`);
    styleRow(row);
  }

  // ============================
  // SHEET 6 - FACTORY SPECS (Tech Files)
  // ============================
  const sheet6 = workbook.addWorksheet("Factory Specs");

  // Set column widths
  sheet6.getColumn(1).width = 20;
  sheet6.getColumn(2).width = 25;
  sheet6.getColumn(3).width = 40;
  sheet6.getColumn(4).width = 50;

  let factorySpecsTitle = sheet6.addRow(["Factory Specs - Tech Files"]);
  styleHeader(factorySpecsTitle);
  sheet6.mergeCells(`A${factorySpecsTitle.number}:D${factorySpecsTitle.number}`);

  // Get tech files data
  const techFilesData = tech_pack.tech_files_data || {};
  const hasFactorySpecs =
    (techFilesData.baseViews?.length > 0) ||
    (techFilesData.sketches?.length > 0) ||
    (techFilesData.components?.length > 0) ||
    (techFilesData.closeups?.length > 0);

  if (hasFactorySpecs) {
    // --- Base Views Section ---
    if (techFilesData.baseViews?.length > 0) {
      sheet6.addRow([]);
      let baseViewsHeader = sheet6.addRow(["Base Views"]);
      stylechild(baseViewsHeader);
      sheet6.mergeCells(`A${baseViewsHeader.number}:D${baseViewsHeader.number}`);

      let bvHeader = sheet6.addRow(["View Type", "Category", "Analysis Overview", "URL"]);
      stylechild(bvHeader);

      techFilesData.baseViews.forEach((file: any) => {
        const viewType = file.view_type || "N/A";
        const category = file.file_category || file.analysis_data?.product_category || "N/A";
        const overview = file.analysis_data?.summary?.overview ||
                        file.analysis_data?.description ||
                        "No analysis available";
        const url = file.file_url || file.url || "N/A";

        let row = sheet6.addRow([viewType, category, overview.substring(0, 200), url]);
        row.alignment = { vertical: "top", wrapText: true };
        row.height = 40;
      });
    }

    // --- Sketches Section ---
    if (techFilesData.sketches?.length > 0) {
      sheet6.addRow([]);
      let sketchesHeader = sheet6.addRow(["Technical Sketches"]);
      stylechild(sketchesHeader);
      sheet6.mergeCells(`A${sketchesHeader.number}:D${sketchesHeader.number}`);

      let skHeader = sheet6.addRow(["Category", "Measurements", "Callouts", "URL"]);
      stylechild(skHeader);

      techFilesData.sketches.forEach((file: any) => {
        const category = file.file_category || "Sketch";
        const measurements = file.analysis_data?.measurements
          ? Object.entries(file.analysis_data.measurements)
              .slice(0, 5)
              .map(([key, val]: [string, any]) => `${key}: ${val.value || val}`)
              .join(", ")
          : "N/A";
        const callouts = file.analysis_data?.callouts?.callouts
          ? file.analysis_data.callouts.callouts
              .slice(0, 3)
              .map((c: any) => c.label || c.description || '')
              .join("; ")
          : "N/A";
        const url = file.file_url || file.url || "N/A";

        let row = sheet6.addRow([category, measurements, callouts, url]);
        row.alignment = { vertical: "top", wrapText: true };
        row.height = 40;
      });
    }

    // --- Components Section ---
    if (techFilesData.components?.length > 0) {
      sheet6.addRow([]);
      let componentsHeader = sheet6.addRow(["Components"]);
      stylechild(componentsHeader);
      sheet6.mergeCells(`A${componentsHeader.number}:D${componentsHeader.number}`);

      let compHeader = sheet6.addRow(["Component Name", "Material", "Description", "URL"]);
      stylechild(compHeader);

      techFilesData.components.forEach((file: any) => {
        const componentName = file.file_category ||
                             file.analysis_data?.component_name ||
                             file.analysis_data?.component_identification?.component_name ||
                             "Component";
        const material = file.analysis_data?.material ||
                        file.analysis_data?.material_specifications?.primary_material ||
                        "N/A";
        const description = file.analysis_data?.description ||
                           file.analysis_data?.summary?.overview ||
                           "N/A";
        const url = file.file_url || file.url || "N/A";

        let row = sheet6.addRow([componentName, material, description.substring(0, 200), url]);
        row.alignment = { vertical: "top", wrapText: true };
        row.height = 40;
      });
    }

    // --- Closeups Section ---
    if (techFilesData.closeups?.length > 0) {
      sheet6.addRow([]);
      let closeupsHeader = sheet6.addRow(["Closeup Details"]);
      stylechild(closeupsHeader);
      sheet6.mergeCells(`A${closeupsHeader.number}:D${closeupsHeader.number}`);

      let clHeader = sheet6.addRow(["Category", "Description", "Details", "URL"]);
      stylechild(clHeader);

      techFilesData.closeups.forEach((file: any) => {
        const category = file.file_category || "Closeup";
        const description = file.analysis_data?.summary?.overview ||
                           file.analysis_data?.description ||
                           "N/A";
        const details = file.analysis_data?.materials_detected
          ? `Materials: ${file.analysis_data.materials_detected.slice(0, 3).map((m: any) =>
              typeof m === 'string' ? m : m.material || m.name || ''
            ).join(", ")}`
          : file.analysis_data?.construction_details
            ? `Construction: ${file.analysis_data.construction_details.slice(0, 2).map((d: any) =>
                typeof d === 'string' ? d : d.feature || ''
              ).join(", ")}`
            : "N/A";
        const url = file.file_url || file.url || "N/A";

        let row = sheet6.addRow([category, description.substring(0, 150), details, url]);
        row.alignment = { vertical: "top", wrapText: true };
        row.height = 40;
      });
    }
  } else {
    let row = sheet6.addRow(["No Factory Specs files available"]);
    sheet6.mergeCells(`A${row.number}:D${row.number}`);
    styleRow(row);
  }

  // ============================
  // SHEET 7 - ANALYSIS GUIDES
  // ============================
  const sheet7 = workbook.addWorksheet("Analysis Guides");

  // Set column widths
  sheet7.getColumn(1).width = 20;
  sheet7.getColumn(2).width = 30;
  sheet7.getColumn(3).width = 50;
  sheet7.getColumn(4).width = 40;

  let analysisTitle = sheet7.addRow(["Factory Specs - Analysis Guides"]);
  styleHeader(analysisTitle);
  sheet7.mergeCells(`A${analysisTitle.number}:D${analysisTitle.number}`);

  // Combine all files with analysis data
  const allFiles = [
    ...(techFilesData.baseViews || []),
    ...(techFilesData.sketches || []),
    ...(techFilesData.components || []),
    ...(techFilesData.closeups || []),
  ].filter((f: any) => f.analysis_data && Object.keys(f.analysis_data).length > 0);

  if (allFiles.length > 0) {
    let guideHeader = sheet7.addRow(["Type", "Name/Category", "Analysis Summary", "Key Details"]);
    stylechild(guideHeader);

    allFiles.forEach((file: any) => {
      const fileType = file.file_type || "Unknown";
      const name = file.file_category ||
                   file.analysis_data?.component_name ||
                   file.analysis_data?.component_identification?.component_name ||
                   file.view_type ||
                   "N/A";
      const summary = file.analysis_data?.summary?.overview ||
                     file.analysis_data?.description ||
                     "N/A";

      // Extract key details based on file type
      let keyDetails = "";
      if (file.analysis_data?.measurements) {
        const meas = Object.entries(file.analysis_data.measurements).slice(0, 3);
        keyDetails = `Measurements: ${meas.map(([k, v]: [string, any]) => `${k}: ${v.value || v}`).join(", ")}`;
      } else if (file.analysis_data?.materials_detected) {
        keyDetails = `Materials: ${file.analysis_data.materials_detected.slice(0, 3).map((m: any) =>
          typeof m === 'string' ? m : m.material || m.name || ''
        ).join(", ")}`;
      } else if (file.analysis_data?.material_specifications) {
        keyDetails = `Material: ${file.analysis_data.material_specifications.primary_material || "N/A"}`;
      } else if (file.analysis_data?.callouts?.callouts) {
        keyDetails = `Callouts: ${file.analysis_data.callouts.callouts.slice(0, 2).map((c: any) =>
          c.label || c.description || ''
        ).join("; ")}`;
      }

      let row = sheet7.addRow([fileType, name, summary.substring(0, 250), keyDetails]);
      row.alignment = { vertical: "top", wrapText: true };
      row.height = 50;
    });
  } else {
    let row = sheet7.addRow(["No analysis guides available"]);
    sheet7.mergeCells(`A${row.number}:D${row.number}`);
    styleRow(row);
  }

  return workbook;
};

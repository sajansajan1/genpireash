import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Note: Image optimization is now handled server-side to avoid browser compatibility issues
// The tech_pack should already contain optimized images when passed to these functions

// ============================================
// SHARED UTILITIES & CONSTANTS
// ============================================

// PDF Configuration
const PDF_CONFIG = {
  pageWidth: 210,      // A4 width in mm
  pageHeight: 297,     // A4 height in mm
  margin: 10,          // Page margin in mm
  contentWidth: 190,   // 210 - 20
  contentHeight: 277,  // 297 - 20
  canvasScale: 2,
  pageElementWidth: "1000px",
};

// HTML2Canvas options
const HTML2CANVAS_OPTIONS = {
  scale: PDF_CONFIG.canvasScale,
  logging: false,
  useCORS: true,
  scrollX: 0,
  scrollY: 0,
};

// ============================================
// PAGE ELEMENT UTILITIES
// ============================================

/**
 * Creates a styled div element for PDF page rendering
 */
const createPageElement = (): HTMLDivElement => {
  const page = document.createElement("div");
  page.style.width = PDF_CONFIG.pageElementWidth;
  page.style.padding = "4px";
  page.style.backgroundColor = "white";
  page.style.position = "fixed";
  page.style.left = "-10000px";
  return page;
};

/**
 * Applies standard page styling to multiple elements
 */
const applyPageStyles = (pages: HTMLDivElement[]): void => {
  pages.forEach((page) => {
    page.style.width = PDF_CONFIG.pageElementWidth;
    page.style.padding = "4px";
    page.style.backgroundColor = "white";
    page.style.position = "fixed";
    page.style.left = "-10000px";
  });
};

/**
 * Safely removes page elements from DOM
 */
const cleanupPageElements = (pages: (HTMLDivElement | null)[]): void => {
  pages.forEach((page) => {
    if (page && page.parentNode) {
      document.body.removeChild(page);
    }
  });
};

// ============================================
// PDF GENERATION UTILITIES
// ============================================

/**
 * Adds image to PDF with automatic pagination for tall content
 */
const addImageWithPagination = async (
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  isFirstPage: boolean
): Promise<void> => {
  const { margin, contentWidth, contentHeight } = PDF_CONFIG;
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // If image fits on one page, add it normally
  if (imgHeight <= contentHeight) {
    if (!isFirstPage) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", 1), "JPEG", margin, margin, imgWidth, imgHeight, undefined, "FAST");
    return;
  }

  // Image is too tall - split across multiple pages
  const pageImgHeight = (contentHeight * canvas.width) / imgWidth;
  let remainingHeight = canvas.height;
  let sourceY = 0;
  let isFirst = isFirstPage;

  while (remainingHeight > 0) {
    const sliceHeight = Math.min(pageImgHeight, remainingHeight);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const ctx = sliceCanvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;

      if (!isFirst) pdf.addPage();
      pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 1), "JPEG", margin, margin, imgWidth, sliceImgHeight, undefined, "FAST");
      isFirst = false;
    }

    sourceY += sliceHeight;
    remainingHeight -= sliceHeight;
  }
};

/**
 * Renders pages to PDF with pagination support
 * Note: Available for future use - currently using inline logic for more control
 */
const _renderPagesToPdf = async (
  pdf: jsPDF,
  pages: HTMLDivElement[],
  startIndex: number = 0
): Promise<void> => {
  let isFirstPdfPage = startIndex === 0;

  for (let i = 0; i < pages.length; i++) {
    document.body.appendChild(pages[i]);
    const canvas = await html2canvas(pages[i], HTML2CANVAS_OPTIONS);
    await addImageWithPagination(pdf, canvas, isFirstPdfPage);
    isFirstPdfPage = false;

    // Clean up dynamically added pages
    if (i >= startIndex) {
      document.body.removeChild(pages[i]);
    }
  }
};

// ============================================
// HTML TEMPLATE BUILDERS
// ============================================

/**
 * Creates the footer logo HTML
 */
const createFooterLogo = (): string => `
  <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
    <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
  </div>
`;

/**
 * Creates a section header HTML
 */
const createSectionHeader = (title: string, bgColor: string = "#d8d1ca"): string => `
  <div style="display:flex; align-items:center; background:${bgColor}; color:black;">
    <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">${title}</p>
  </div>
`;

/**
 * Creates the page header HTML
 */
const createPageHeader = (productName: string, bgColor: string = "#d8d1ca"): string => `
  <div style="background:${bgColor}; border-bottom:4px solid black; padding:12px; text-align:center;">
    <h1 style="font-size:1.5rem; font-weight:bold; padding: 12px 0; margin:0;">
      ${productName || "Product Name"} Tech Pack
    </h1>
  </div>
`;

/**
 * Creates a color swatch HTML
 * Note: Available for future template refactoring
 */
const _createColorSwatch = (color: { name: string; hex: string }): string => `
  <div style="display:flex; align-items:center;">
    <span style="margin-top:14px; width:20px; height:20px; border-radius:50%; margin-right:8px; border:1px solid #ccc; background-color:${color.hex};"></span>
    <span>${color.name} <span style="font-size:0.75rem; color:#6b7280;">(${color.hex})</span></span>
  </div>
`;

/**
 * Creates a product image card HTML
 * Note: Available for future template refactoring
 */
const _createProductImageCard = (url: string, label: string, productName: string = "Product"): string => `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${url}"
      alt="${productName} - ${label} view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">${label}</p>
  </div>
`;

// Export unused utilities for potential external use
export { _renderPagesToPdf, _createColorSwatch, _createProductImageCard };

// ============================================
// FACTORY SPECS PAGE BUILDERS
// ============================================

/**
 * Creates a single large image page for Factory Specs
 */
const createFactorySpecsImagePage = (
  file: any,
  title: string,
  productName: string
): HTMLDivElement | null => {
  if (!file) return null;

  const imageUrl = file.file_url || file.url || '';
  const label = file.file_category || file.view_type || file.file_type || 'Image';

  const page = createPageElement();
  page.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    ${createPageHeader(productName, "#fff")}
    <div style="margin-bottom: 24px;">
      ${createSectionHeader(`${title} - ${label}`)}
      <div style="display: flex; justify-content: center; padding: 24px;">
        <div style="width: 100%; max-width: 800px; padding: 16px; text-align: center;">
          <img
            src="${imageUrl}"
            alt="${label}"
            style="width: 100%; max-height: 600px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 8px;"
            onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
          />
          <p style="font-weight: bold; margin-top: 16px; font-size: 1.1rem; text-transform: capitalize;">${label}</p>
        </div>
      </div>
    </div>
    ${createFooterLogo()}
  </div>
</div>
`;
  return page;
};

/**
 * Creates guide page HTML sections for analysis data
 */
const buildGuidePageSections = (analysis: any, summary: any): {
  measurementsHtml: string;
  materialsHtml: string;
  constructionHtml: string;
  designFeaturesHtml: string;
  colorsHtml: string;
  materialDetailsHtml: string;
  constructionTechniquesHtml: string;
  designElementsHtml: string;
  colorAndFinishHtml: string;
  calloutsHtml: string;
} => {
  // KEY MEASUREMENTS
  let measurementsHtml = '';
  if (Array.isArray(summary.measurements) && summary.measurements.length > 0) {
    measurementsHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Key Measurements</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          ${summary.measurements.map((m: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div style="flex: 1; min-width: 0;">
                  <p style="font-weight: 600; font-size: 0.9rem; margin: 0 0 4px; word-wrap: break-word;">${m.name || ''}</p>
                  ${m.location ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 0; word-wrap: break-word;">${m.location}</p>` : ''}
                </div>
                <span style="padding: 4px 10px; background: #d8d1ca; border-radius: 12px; font-size: 0.85rem; font-weight: 500; flex-shrink: 0; max-width: 120px; word-wrap: break-word; text-align: center;">
                  ${m.value || ''}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // MATERIALS & FABRICS
  let materialsHtml = '';
  if (Array.isArray(summary.materials) && summary.materials.length > 0) {
    materialsHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Materials & Fabrics</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${summary.materials.map((m: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
                <p style="font-weight: 600; font-size: 0.95rem; margin: 0; flex: 1; min-width: 0; word-wrap: break-word;">${m.type || ''}</p>
                ${m.percentage ? `<span style="padding: 4px 12px; border: 1px solid #e5e7eb; border-radius: 16px; font-size: 0.8rem; flex-shrink: 0;">${m.percentage}</span>` : ''}
              </div>
              ${m.location ? `<p style="font-size: 0.8rem; color: #6b7280; margin: 0 0 8px; word-wrap: break-word;">${m.location}</p>` : ''}
              ${m.properties && m.properties.length > 0 ? `
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  ${m.properties.map((p: string) => `
                    <span style="padding: 2px 8px; background: #d8d1ca; border-radius: 10px; font-size: 0.75rem; word-wrap: break-word;">${p}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // CONSTRUCTION DETAILS
  let constructionHtml = '';
  if (Array.isArray(summary.construction) && summary.construction.length > 0) {
    constructionHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Construction Details</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${summary.construction.map((c: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <p style="font-weight: 600; font-size: 0.9rem; margin: 0 0 6px; word-wrap: break-word;">${c.feature || ''}</p>
              ${c.details ? `<p style="font-size: 0.85rem; color: #374151; margin: 0 0 8px; word-wrap: break-word;">${c.details}</p>` : ''}
              ${c.technique ? `<span style="display: inline-block; padding: 4px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.8rem; word-wrap: break-word;">${c.technique}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // DESIGN FEATURES
  let designFeaturesHtml = '';
  if (Array.isArray(summary.designFeatures) && summary.designFeatures.length > 0) {
    designFeaturesHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Design Features</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          ${summary.designFeatures.map((f: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <p style="font-weight: 600; font-size: 0.9rem; margin: 0 0 4px; word-wrap: break-word;">${f.name || ''}</p>
              ${f.description ? `<p style="font-size: 0.8rem; color: #374151; margin: 0 0 4px; word-wrap: break-word;">${f.description}</p>` : ''}
              ${f.location ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 0; word-wrap: break-word;">${f.location}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // COLOR SPECIFICATIONS
  let colorsHtml = '';
  if (Array.isArray(summary.colors) && summary.colors.length > 0) {
    colorsHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Color Specifications</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${summary.colors.map((c: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                ${c.hex ? `<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #d1d5db; background-color: ${c.hex}; flex-shrink: 0;"></div>` : ''}
                <p style="font-weight: 600; font-size: 0.9rem; margin: 0; word-wrap: break-word;">${c.name || ''}</p>
              </div>
              ${c.location ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 0 0 4px; word-wrap: break-word;">${c.location}</p>` : ''}
              ${c.coverage ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 0; word-wrap: break-word;">${c.coverage}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // CLOSE-UP: Material Details
  let materialDetailsHtml = '';
  if (Array.isArray(summary.materialDetails) && summary.materialDetails.length > 0) {
    materialDetailsHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Material Details</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${summary.materialDetails.map((m: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
                <p style="font-weight: 600; font-size: 0.95rem; margin: 0; flex: 1; min-width: 0; word-wrap: break-word;">${m.material || ''}</p>
                ${m.finish ? `<span style="padding: 4px 12px; border: 1px solid #e5e7eb; border-radius: 16px; font-size: 0.8rem; flex-shrink: 0;">${m.finish}</span>` : ''}
              </div>
              ${m.location ? `<p style="font-size: 0.8rem; color: #6b7280; margin: 0 0 8px; word-wrap: break-word;">${m.location}</p>` : ''}
              ${m.properties && m.properties.length > 0 ? `
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  ${m.properties.map((p: string) => `
                    <span style="padding: 2px 8px; background: #d8d1ca; border-radius: 10px; font-size: 0.75rem; word-wrap: break-word;">${p}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // CLOSE-UP: Construction Techniques
  let constructionTechniquesHtml = '';
  if (Array.isArray(summary.constructionTechniques) && summary.constructionTechniques.length > 0) {
    constructionTechniquesHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Construction Techniques</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${summary.constructionTechniques.map((t: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <p style="font-weight: 600; font-size: 0.9rem; margin: 0 0 6px; word-wrap: break-word;">${t.technique || ''}</p>
              ${t.description ? `<p style="font-size: 0.85rem; color: #374151; margin: 0 0 8px; word-wrap: break-word;">${t.description}</p>` : ''}
              ${t.specifications ? `<span style="display: inline-block; padding: 4px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.8rem; word-wrap: break-word;">${t.specifications}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // CLOSE-UP: Design Elements
  let designElementsHtml = '';
  if (Array.isArray(summary.designElements) && summary.designElements.length > 0) {
    designElementsHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Design Elements</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          ${summary.designElements.map((e: any) => `
            <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
              <p style="font-weight: 600; font-size: 0.9rem; margin: 0 0 4px; word-wrap: break-word;">${e.element || ''}</p>
              ${e.description ? `<p style="font-size: 0.8rem; color: #374151; margin: 0 0 4px; word-wrap: break-word;">${e.description}</p>` : ''}
              ${e.purpose ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 0; word-wrap: break-word;">${e.purpose}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // CLOSE-UP: Color & Finish
  let colorAndFinishHtml = '';
  if (summary.colorAndFinish) {
    const cf = summary.colorAndFinish;
    colorAndFinishHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Color & Finish</h3>
        <div style="padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            ${cf.hex ? `<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #d1d5db; background-color: ${cf.hex}; flex-shrink: 0;"></div>` : ''}
            <div style="min-width: 0; flex: 1;">
              <p style="font-weight: 600; font-size: 0.95rem; margin: 0; word-wrap: break-word;">${cf.primaryColor || ''}</p>
              ${cf.hex ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 4px 0 0; font-family: monospace;">${cf.hex}</p>` : ''}
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            ${cf.texture ? `
              <div>
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0 0 4px;">Texture</p>
                <p style="font-size: 0.85rem; color: #374151; margin: 0; word-wrap: break-word;">${cf.texture}</p>
              </div>
            ` : ''}
            ${cf.sheen ? `
              <div>
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0 0 4px;">Sheen</p>
                <p style="font-size: 0.85rem; color: #374151; margin: 0; word-wrap: break-word;">${cf.sheen}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // TECHNICAL CALLOUTS
  let calloutsHtml = '';
  const callouts = analysis.callouts?.callouts || [];
  if (callouts.length > 0) {
    calloutsHtml = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Technical Callouts</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${callouts.slice(0, 8).map((c: any) => {
            const text = typeof c === 'string' ? c : (c.label || c.description || c.text || '');
            return `<span style="padding: 6px 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.85rem; word-wrap: break-word; max-width: 100%;">${text}</span>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  return {
    measurementsHtml,
    materialsHtml,
    constructionHtml,
    designFeaturesHtml,
    colorsHtml,
    materialDetailsHtml,
    constructionTechniquesHtml,
    designElementsHtml,
    colorAndFinishHtml,
    calloutsHtml,
  };
};

/**
 * Creates a detailed guide page for Factory Specs
 */
const createFactorySpecsGuidePage = (
  file: any,
  title: string,
  _productName: string
): HTMLDivElement | null => {
  if (!file || !file.analysis_data) return null;

  const analysis = file.analysis_data || {};
  const summary = analysis.summary || {};
  const label = file.file_category || file.view_type || file.file_type || 'Item';

  // Check if there's any meaningful data
  const hasData = summary.overview ||
                 (summary.measurements && summary.measurements.length > 0) ||
                 (summary.materials && summary.materials.length > 0) ||
                 (summary.construction && summary.construction.length > 0) ||
                 (summary.designFeatures && summary.designFeatures.length > 0) ||
                 (summary.colors && summary.colors.length > 0) ||
                 (summary.materialDetails && summary.materialDetails.length > 0) ||
                 (summary.constructionTechniques && summary.constructionTechniques.length > 0) ||
                 (summary.designElements && summary.designElements.length > 0) ||
                 summary.colorAndFinish ||
                 (analysis.callouts?.callouts && analysis.callouts.callouts.length > 0);

  if (!hasData) return null;

  const page = createPageElement();
  const overview = summary.overview || '';
  const sections = buildGuidePageSections(analysis, summary);

  page.innerHTML = `
<div style="padding: 8px; word-wrap: break-word; overflow-wrap: break-word;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0; word-wrap: break-word;">
        ${title} Guide - ${label}
      </h1>
    </div>
    <div style="padding: 20px; word-wrap: break-word; overflow-wrap: break-word;">
      ${overview ? `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 1rem; font-weight: bold; margin: 0 0 12px; color: #1f2937;">Overview</h3>
          <div style="padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-wrap: break-word; overflow-wrap: break-word;">
            <p style="margin: 0; font-size: 0.9rem; color: #374151; line-height: 1.5; word-wrap: break-word;">${overview}</p>
          </div>
        </div>
      ` : ''}
      ${sections.measurementsHtml}
      ${sections.materialsHtml}
      ${sections.constructionHtml}
      ${sections.designFeaturesHtml}
      ${sections.colorsHtml}
      ${sections.materialDetailsHtml}
      ${sections.constructionTechniquesHtml}
      ${sections.designElementsHtml}
      ${sections.colorAndFinishHtml}
      ${sections.calloutsHtml}
    </div>
    ${createFooterLogo()}
  </div>
</div>
`;
  return page;
};

/**
 * Creates Factory Specs pages for all tech files
 */
const createAllFactorySpecsPages = (
  techFilesData: any,
  productName: string
): HTMLDivElement[] => {
  const pages: HTMLDivElement[] = [];

  const baseViews = Array.isArray(techFilesData?.baseViews) ? techFilesData.baseViews : [];
  const sketches = Array.isArray(techFilesData?.sketches) ? techFilesData.sketches : [];
  const components = Array.isArray(techFilesData?.components) ? techFilesData.components : [];
  const closeups = Array.isArray(techFilesData?.closeups) ? techFilesData.closeups : [];

  // Base Views
  baseViews.forEach((file: any) => {
    const imagePage = createFactorySpecsImagePage(file, "Base View", productName);
    if (imagePage) pages.push(imagePage);
    const guidePage = createFactorySpecsGuidePage(file, "Base View", productName);
    if (guidePage) pages.push(guidePage);
  });

  // Sketches
  sketches.forEach((file: any) => {
    const imagePage = createFactorySpecsImagePage(file, "Technical Sketch", productName);
    if (imagePage) pages.push(imagePage);
    const guidePage = createFactorySpecsGuidePage(file, "Technical Sketch", productName);
    if (guidePage) pages.push(guidePage);
  });

  // Components
  components.forEach((file: any) => {
    const imagePage = createFactorySpecsImagePage(file, "Component", productName);
    if (imagePage) pages.push(imagePage);
    const guidePage = createFactorySpecsGuidePage(file, "Component", productName);
    if (guidePage) pages.push(guidePage);
  });

  // Closeups
  closeups.forEach((file: any) => {
    const imagePage = createFactorySpecsImagePage(file, "Closeup Detail", productName);
    if (imagePage) pages.push(imagePage);
    const guidePage = createFactorySpecsGuidePage(file, "Closeup Detail", productName);
    if (guidePage) pages.push(guidePage);
  });

  return pages;
};

// ============================================
// EXPORTED PDF GENERATORS
// ============================================

export const generatePdfFromData = async ({ rfq }: { rfq: any }) => {
  // Create pages using shared utility
  const page1 = createPageElement();
  const page2 = createPageElement();

  document.body.appendChild(page1);
  document.body.appendChild(page2);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pages = [page1, page2];

    // Render all pages to PDF using shared utilities
    let isFirstPdfPage = true;
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], HTML2CANVAS_OPTIONS);
      await addImageWithPagination(pdf, canvas, isFirstPdfPage);
      isFirstPdfPage = false;
    }

    pdf.save(rfq.rfq.product_idea + ".pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    // Clean up DOM using shared utility
    cleanupPageElements([page1, page2]);
  }
};

export const generatePdffromTechpack = async ({ tech_pack }: { tech_pack: any }) => {
  console.log("tech_pack ==> ", tech_pack);

  // Create pages using shared utility
  const page1 = createPageElement();
  const page2 = createPageElement();
  const page3 = createPageElement();
  const page4 = createPageElement();

  page1.innerHTML = `

<div style="padding:8px;">
  <div style="border:2px solid black;">

    <!-- Header -->
<div style="background:#d8d1ca; border-bottom:4px solid black; padding:12px; text-align:center;">
  <h1 style="font-size:1.5rem; font-weight:bold; padding: 12px 0; margin:0;">
    ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
  </h1>
</div>


    <!-- Product Details -->
    <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Product Details</p>
      </div>
    <div style="border:1px solid #e5e7eb; border-top:0; display:grid; grid-template-columns:repeat(2,1fr); border-bottom:2px solid black;">
  
  <!-- First Column (with right divider) -->
  <div style="padding:16px; border-bottom:1px solid #bfdbfe; border-right:2px solid black;">
    <p style="font-weight:600; font-size:0.875rem; color:#1f2937; margin:0 0 4px;">Product Description</p>
    <p style="color:#374151; margin:0;">${tech_pack.tech_pack.productOverview || "No description provided"}</p>
  </div>

  <!-- Second Column -->
  <div style="padding:16px; border-bottom:1px solid #bfdbfe;">
    <p style="font-weight:600; font-size:0.875rem; color:#1f2937; margin:0 0 4px;">Product Notes</p>
    <p style="color:#374151; margin:0;">${tech_pack.tech_pack.productionNotes || "No notes provided"}</p>
  </div>

  <!-- First Column (with right divider) -->
  <div style="padding:16px; border-bottom:1px solid #bfdbfe; border-right:2px solid black;">
    <p style="font-weight:600; font-size:0.875rem; color:#1f2937; margin:0 0 4px;">Product Category</p>
    <p style="color:#374151; margin:0;">${tech_pack.tech_pack.category_Subcategory || "Not specified"}</p>
  </div>
</div>

    </div>

<div style="margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">

  <!-- Left Column: Measurements & Packaging -->
  <div style="display:flex; flex-direction:column; gap:16px;">
    <!-- Measurements -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Measurements & Tolerance</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; overflow-x:auto;">
       ${
         tech_pack.tech_pack.dimensions && Object.keys(tech_pack.tech_pack.dimensions).length > 0
           ? `
      <table style="width:100%; border:1px solid #e5e7eb; border-collapse:collapse; font-size:0.875rem;">
        <thead style="background:#f3f4f6;">
          <tr>
            <th style="border:1px solid #e5e7eb; padding:8px 16px; font-weight:600; text-align:center; vertical-align:middle;">Measurement</th>
            <th style="border:1px solid #e5e7eb; padding:8px 16px; font-weight:600; text-align:center; vertical-align:middle;">Value</th>
            <th style="border:1px solid #e5e7eb; padding:8px 16px; font-weight:600; text-align:center; vertical-align:middle;">Tolerance</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(tech_pack.tech_pack.dimensions)
            .map(([key, val]: any) => {
              const value = val.value || "-";
              const tolerance = val.tolerance || "-";
              const description = val.description || "-";
              return `
                <tr>
                  <td style="border:1px solid #e5e7eb; padding:8px 16px; text-align:center; vertical-align:middle; text-transform:capitalize;">${key}</td>
                  <td style="border:1px solid #e5e7eb; padding:8px 16px; text-align:center; vertical-align:middle;">${value}</td>
                  <td style="border:1px solid #e5e7eb; padding:8px 16px; text-align:center; vertical-align:middle;">${tolerance}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
        `
           : `<p style="color:#6b7280; margin:0;">No measurements provided.</p>`
       }
      </div>
    </div>

    <!-- Packaging -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Packaging</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px; line-height:1.6;">
        <ul style="list-style:disc; padding-left:24px; margin:0;">
          <li><strong>Packaging Type:</strong> ${
            tech_pack.tech_pack.packaging?.packagingDetails?.packagingType || ""
          }</li>
          <li><strong>Material Spec:</strong> ${
            tech_pack.tech_pack.packaging?.packagingDetails?.materialSpec || ""
          }</li>
          <li><strong>Closure Type:</strong> ${tech_pack.tech_pack.packaging?.packagingDetails?.closureType || ""}</li>
          <li><strong>Artwork File Reference:</strong> ${
            tech_pack.tech_pack.packaging?.packagingDetails?.artworkFileReference || ""
          }</li>
          <li><strong>Inner Packaging:</strong> ${
            tech_pack.tech_pack.packaging?.packagingDetails?.innerPackaging || ""
          }</li>
          <li><strong>Barcode & Label Placement:</strong> ${
            tech_pack.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || ""
          }</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Right Column: Colorways, Quality, Sizes, Construction -->
  <div style="display:flex; flex-direction:column; gap:16px;">
    <!-- Colorways -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Colorways</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; background:#f9fafb;">
        ${
          tech_pack?.tech_pack?.colors?.primaryColors?.length > 0
            ? `
        <div>
          <h3 style="font-weight:600; color:#374151; margin:0;">Primary Colors</h3>
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:8px;">
            ${tech_pack.tech_pack.colors.primaryColors
              .map(
                (color: any) => `
              <div style="display:flex; align-items:center;">
                 <span style="margin-top:14px; width:20px; height:20px; border-radius:50%; margin-right:8px; border:1px solid #ccc; background-color:${color.hex};"></span>
                <span>${color.name} <span style="font-size:0.75rem; color:#6b7280;">(${color.hex})</span></span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : `<p style="color:#6b7280; font-size:0.875rem; margin:0;">No primary colors specified</p>`
        }

        ${
          tech_pack.tech_pack.colors.accentColors?.length > 0
            ? `
        <div style="margin-top:16px;">
          <h3 style="font-weight:600; color:#374151; margin:0;">Accent Colors</h3>
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:8px;">
            ${tech_pack.tech_pack.colors.accentColors
              .map(
                (color: any) => `
              <div style="display:flex; align-items:center;">
                <span style="margin-top:14px; width:20px; height:20px; border-radius:50%; margin-right:8px; border:1px solid #ccc; background-color:${color.hex};"></span>
                <span>${color.name} <span style="font-size:0.75rem; color:#6b7280;">(${color.hex})</span></span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : `<p style="color:#6b7280; font-size:0.875rem; margin:0;">No accent colors specified</p>`
        }
      </div>
    </div>

    <!-- Quality Standards -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Quality Standards</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px;">
        ${
          tech_pack.tech_pack.qualityStandards
            ? `<p style="color:#374151; margin:0;">${tech_pack.tech_pack.qualityStandards}</p>`
            : `<p style="color:#374151; margin:0;">No Quality Standards information provided</p>`
        }
      </div>
    </div>

  </div>
    
    
</div>
 <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Care Instructions</p>
      </div>
  <div style=" padding:16px; font-size:14px; line-height:1.6; border:1px solid #e5e7eb; border-top:0;">
    <p style="margin:0 0 8px; color:#374151;">
      ${tech_pack.tech_pack.careInstructions || ""}
    </p>
  </div>
</div>
<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
<img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
</div>
`;

  page2.innerHTML = `
  <!-- Outer Wrapper with Border -->
  <div style="border:2px solid black; margin:8px; position:relative;">

    <!-- Header -->
    <div style="background:#fff; border-bottom:4px solid black; padding:12px; text-align:center;">
      <h1 style="font-size:1.5rem; font-weight:bold; padding:12px 0; margin:0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>

    <!-- BOM -->
    <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Bill of Materials (BOM)</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; overflow-x:auto;">
        ${
          tech_pack.tech_pack.materials && tech_pack.tech_pack.materials.length > 0
            ? `
        <table style="width:100%; font-size:0.875rem; border-collapse:collapse;">
          <thead style="background:#f3f4f6;">
            <tr>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Component Name</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Material</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Specification</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Qty per unit</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Unit Cost</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tech_pack.tech_pack.materials
              .map(
                (material: any) => `
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:8px 16px;">${material.component || ""}</td>
                <td style="padding:8px 16px;">${material.material || ""}</td>
                <td style="padding:8px 16px;">${material.specification || ""}</td>
                <td style="padding:8px 16px;">${material.quantityPerUnit || ""}</td>
                <td style="padding:8px 16px;">${material.unitCost || ""}</td>
                <td style="padding:8px 16px;">${material.notes || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : `<p style="color:#6b7280; padding:16px; margin:0;">No materials specified</p>`
        }
      </div>
    </div>

    <!-- Construction Details -->
  <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Construction Details</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px; line-height:1.6;">
        <p style="margin:0 0 8px; color:#374151;">
          ${tech_pack.tech_pack.constructionDetails?.description || ""}
        </p>
        ${
          tech_pack.tech_pack.constructionDetails?.constructionFeatures?.length > 0
            ? `
        <ul style="list-style:disc; padding-left:24px; margin:0;">
          ${tech_pack.tech_pack.constructionDetails.constructionFeatures
            .map(
              (item: any) => `
            <li>
              <p style="font-size:14px; color:#4B5563; margin:0;">
                <strong>${item.featureName || "Not specified"}</strong>: ${item.details || "Not specified"}
              </p>
            </li>
          `
            )
            .join("")}
        </ul>
        `
            : ""
        }
      </div>
    </div>

    <!-- Sizes -->
  <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Sizes</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px;">
        ${tech_pack.tech_pack.sizeRange?.gradingLogic || ""}
        <div style="margin-top:8px; font-weight:600;">
          ${tech_pack.tech_pack.sizeRange?.sizes?.join(", ") || ""}
        </div>
      </div>
    </div>

    <!-- Labeling -->
    <div style="margin-bottom:12px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Labeling</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px;">

        <!-- Logo -->
        <div style="margin-bottom:12px;">
          <strong>Logo:</strong><br />
          ${
            tech_pack.tech_pack.labels?.logo && tech_pack.tech_pack.labels.logo.match(/^https?:\/\//)
              ? `<img src="${tech_pack.tech_pack.v.logo}" alt="Label Logo" style="margin-top:8px; max-width:150px; border:1px solid #d1d5db; border-radius:4px; object-fit:contain;" />`
              : `<p style="margin:8px 0; color:#374151;">${tech_pack.tech_pack.labels?.logo || "Logo not supplied"}</p>`
          }
        </div>

        <p><strong>Label Type:</strong> ${tech_pack.tech_pack.labels?.labelType || "N/A"}</p>
        <p><strong>Placement:</strong> ${tech_pack.tech_pack.labels?.placement || "N/A"}</p>
        <p><strong>Dimensions:</strong> ${tech_pack.tech_pack.labels?.dimensions || "N/A"}</p>
        <p><strong>Color Reference:</strong> 
          <span style="color:${tech_pack.tech_pack.labels?.colorReference || "#000"};">
            ${tech_pack.tech_pack.labels?.colorReference || "N/A"}
          </span>
        </p>
        <p><strong>Content:</strong> ${tech_pack.tech_pack.labels?.content || "N/A"}</p>
        <p><strong>Preview:</strong> ${tech_pack.tech_pack.labels?.preview || "N/A"}</p>
      </div>
    </div>

    <div style="margin-bottom:12px;">
  <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
    <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Hardware</p>
  </div>
  <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px;">

    <!-- Hardware List -->
    <div style="margin-bottom:12px;">
     <p><strong>Description:</strong> ${tech_pack.tech_pack.hardwareComponents?.description || "N/A"}</p>
      <strong>Components:</strong><br />
      <ul style="margin:8px 0 0 16px; padding:0; list-style-type:disc; color:#374151;">
        ${
          tech_pack.tech_pack.hardwareComponents?.hardware?.length
            ? tech_pack.tech_pack.hardwareComponents.hardware.map((item: any) => `<li>${item}</li>`).join("")
            : "<li>No hardware components supplied</li>"
        }
      </ul>
    </div>

  </div>
</div>

    <!-- Footer Logo -->
    <div style="position:absolute; bottom:16px; right:16px; height:48px; width:48px;">
      <img src="/favicon.png" alt="Logo" style="height:100%; width:100%; object-fit:contain;" />
    </div>

  </div>
`;

  const preferredOrder = ["front", "back", "side", "bottom", "other"];
  const existingImages = preferredOrder.filter((key) => tech_pack.image_data[key]?.url);

  page3.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
        ${existingImages
          .slice(0, 2)
          .map((key: any) => {
            const { url } = tech_pack.image_data[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            return `
              <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
                <img
                  src="${url}"
                  alt="${tech_pack.tech_pack?.name || "Product"} - ${label} view"
                  style="width: 100%; height: auto; object-fit: contain;"
                  onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
                />
                <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">${label}</p>
              </div>
            `;
          })
          .join("")}
      </div>


      <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
        <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
      </div>
    </div>
  </div>
</div>
`;

  page4.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
        ${existingImages
          .slice(2, 4)
          .map((key: any) => {
            const { url } = tech_pack.image_data[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            return `
              <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
                <img
                  src="${url}"
                  alt="${tech_pack.tech_pack?.name || "Product"} - ${label} view"
                  style="width: 100%; height: auto; object-fit: contain;"
                  onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
                />
                <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">${label}</p>
              </div>
            `;
          })
          .join("")}
      </div>


      <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
        <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
      </div>
    </div>
  </div>
</div>
`;

  ////techimages
  // let page3: HTMLDivElement | null = null;
  // let page4: HTMLDivElement | null = null;
  let page5: HTMLDivElement | null = null;
  let page6: HTMLDivElement | null = null;
  let page7: HTMLDivElement | null = null;
  let page8: HTMLDivElement | null = null;
  // let page9: HTMLDivElement | null = null;

  const techImages = tech_pack.technical_images
    ? Object.values(tech_pack.technical_images).filter((img: any) => img && img.url)
    : [];

  if (techImages.length > 0) {
    page5 = document.createElement("div");
    page6 = document.createElement("div");
    page7 = document.createElement("div");
    page8 = document.createElement("div");
    // page9 = document.createElement("div");

    // --- Page 3 ---

    // --- Page 4 (remaining technical images like callout, vector, measurement, etc.) ---
    page5.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.vectorImage.url}"
      alt="${tech_pack.technical_images.vectorImage.type || "Product"} - Vector view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Vector View</p>
  </div>
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.technicalImage.url}"
      alt="${tech_pack.technical_images.technicalImage.type || "Product"} - Technical view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Technical View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    page6.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.frontViewImage.url}"
      alt="${tech_pack.technical_images.frontViewImage.type || "Product"} - Front view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Front View</p>
  </div>
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.backViewImage.url}"
      alt="${tech_pack.technical_images.backViewImage.type || "Product"} - Back view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Back View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    page7.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.constructionImage.url}"
      alt="${tech_pack.technical_images.constructionImage.type || "Product"} - Construction view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Construction View</p>
  </div>
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.calloutImage.url}"
      alt="${tech_pack.technical_images.calloutImage.type || "Product"} - CalloutImage view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Callout View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    page8.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${tech_pack.technical_images.detailImage.url}"
      alt="${tech_pack.technical_images.detailImage.type || "Product"} - Detail view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Detail View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

  }

  // ============================
  // FACTORY SPECS PAGES - Using shared utilities
  // ============================

  // Get tech files data from the passed structure
  const techFilesData = tech_pack.tech_files_data || {};
  const productName = tech_pack.tech_pack?.productName || "Product Name";

  // Create Factory Specs pages using shared utility function
  const factorySpecsPages = createAllFactorySpecsPages(techFilesData, productName);

  try {
    const pdf = new jsPDF("p", "mm", "a4");

    // Start with pages 1 and 2 (already styled)
    const pages: HTMLDivElement[] = [page1, page2, page3, page4];

    // Conditionally append technical image pages with styling via shared utility
    [page5, page6, page7, page8].forEach((page) => {
      if (page) {
        applyPageStyles([page]);
        pages.push(page);
      }
    });

    // Add Factory Specs pages (already styled by createAllFactorySpecsPages)
    factorySpecsPages.forEach((page) => {
      if (page) pages.push(page);
    });

    // Render all pages to PDF using shared utility
    let isFirstPdfPage = true;
    for (let i = 0; i < pages.length; i++) {
      document.body.appendChild(pages[i]);
      const canvas = await html2canvas(pages[i], HTML2CANVAS_OPTIONS);
      await addImageWithPagination(pdf, canvas, isFirstPdfPage);
      isFirstPdfPage = false;
      if (i >= 4) document.body.removeChild(pages[i]);
    }

    pdf.save((tech_pack.tech_pack.productName || "product") + ".pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    // Clean up all dynamically created pages
    cleanupPageElements([page5, page6, page7, page8, ...factorySpecsPages]);
  }
};

export const generatePdfBase64 = async (techPack: any) => {
  // Create pages using shared utility
  const page1 = createPageElement();
  const page2 = createPageElement();
  const page3 = createPageElement();
  const page4 = createPageElement();

  page1.innerHTML = `
<div style="padding:8px;">
  <div style="border:2px solid black;">

    <!-- Header -->
<div style="background:#fff; border-bottom:4px solid black; padding:12px; text-align:center;">
  <h1 style="font-size:1.5rem; font-weight:bold; padding: 12px 0; margin:0;">
    ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
  </h1>
</div>


    <!-- Product Details -->
    <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Product Details</p>
      </div>
    <div style="border:1px solid #e5e7eb; border-top:0; display:grid; grid-template-columns:repeat(2,1fr); border-bottom:2px solid black;">
  
  <!-- First Column (with right divider) -->
  <div style="padding:16px; border-bottom:1px solid #bfdbfe; border-right:2px solid black;">
    <p style="font-weight:600; font-size:0.875rem; color:#1f2937; margin:0 0 4px;">Product Description</p>
    <p style="color:#374151; margin:0;">${techPack.tech_pack.tech_pack.productOverview || "No description provided"}</p>
  </div>

  <!-- Second Column -->
  <div style="padding:16px; border-bottom:1px solid #bfdbfe;">
    <p style="font-weight:600; font-size:0.875rem; color:#1f2937; margin:0 0 4px;">Product Notes</p>
    <p style="color:#374151; margin:0;">${techPack.tech_pack.tech_pack.productionNotes || "No notes provided"}</p>
  </div>

  <!-- First Column (with right divider) -->
  <div style="padding:16px; border-bottom:1px solid #bfdbfe; border-right:2px solid black;">
    <p style="font-weight:600; font-size:0.875rem; color:#1f2937; margin:0 0 4px;">Product Category</p>
    <p style="color:#374151; margin:0;">${techPack.tech_pack.tech_pack.category_Subcategory || "Not specified"}</p>
  </div>

</div>

    </div>

   <div style="margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">

  <!-- Left Column: Measurements & Packaging -->
  <div style="display:flex; flex-direction:column; gap:16px;">
    <!-- Measurements -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Measurements & Tolerance</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; overflow-x:auto;">
       ${
         techPack.tech_pack.tech_pack.dimensions && Object.keys(techPack.tech_pack.tech_pack.dimensions).length > 0
           ? `
      <table style="width:100%; border:1px solid #e5e7eb; border-collapse:collapse; font-size:0.875rem;">
        <thead style="background:#f3f4f6;">
          <tr>
            <th style="border:1px solid #e5e7eb; padding:8px 16px; font-weight:600; text-align:center; vertical-align:middle;">Measurement</th>
            <th style="border:1px solid #e5e7eb; padding:8px 16px; font-weight:600; text-align:center; vertical-align:middle;">Value</th>
            <th style="border:1px solid #e5e7eb; padding:8px 16px; font-weight:600; text-align:center; vertical-align:middle;">Tolerance</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(techPack.tech_pack.tech_pack.dimensions)
            .map(([key, val]: any) => {
              const value = val.value || "-";
              const tolerance = val.tolerance || "-";
              const description = val.description || "-";
              return `
                <tr>
                  <td style="border:1px solid #e5e7eb; padding:8px 16px; text-align:center; vertical-align:middle; text-transform:capitalize;">${key}</td>
                  <td style="border:1px solid #e5e7eb; padding:8px 16px; text-align:center; vertical-align:middle;">${value}</td>
                  <td style="border:1px solid #e5e7eb; padding:8px 16px; text-align:center; vertical-align:middle;">${tolerance}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
        `
           : `<p style="color:#6b7280; margin:0;">No measurements provided.</p>`
       }
      </div>
    </div>

    <!-- Packaging -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Packaging</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px; line-height:1.6;">
        <ul style="list-style:disc; padding-left:24px; margin:0;">
          <li><strong>Packaging Type:</strong> ${
            techPack.tech_pack.tech_pack.packaging?.packagingDetails?.packagingType || ""
          }</li>
          <li><strong>Material Spec:</strong> ${
            techPack.tech_pack.tech_pack.packaging?.packagingDetails?.materialSpec || ""
          }</li>
          <li><strong>Closure Type:</strong> ${
            techPack.tech_pack.tech_pack.packaging?.packagingDetails?.closureType || ""
          }</li>
          <li><strong>Artwork File Reference:</strong> ${
            techPack.tech_pack.tech_pack.packaging?.packagingDetails?.artworkFileReference || ""
          }</li>
          <li><strong>Inner Packaging:</strong> ${
            techPack.tech_pack.tech_pack.packaging?.packagingDetails?.innerPackaging || ""
          }</li>
          <li><strong>Barcode & Label Placement:</strong> ${
            techPack.tech_pack.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || ""
          }</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Right Column: Colorways, Quality, Sizes, Construction -->
  <div style="display:flex; flex-direction:column; gap:16px;">
    <!-- Colorways -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Colorways</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; background:#f9fafb;">
        ${
          techPack?.tech_pack?.tech_pack?.colors.primaryColors?.length > 0
            ? `
        <div>
          <h3 style="font-weight:600; color:#374151; margin:0;">Primary Colors</h3>
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:8px;">
            ${techPack.tech_pack.tech_pack.colors.primaryColors
              .map(
                (color: any) => `
              <div style="display:flex; align-items:center;">
                 <span style="margin-top:14px; width:20px; height:20px; border-radius:50%; margin-right:8px; border:1px solid #ccc; background-color:${color.hex};"></span>
                <span>${color.name} <span style="font-size:0.75rem; color:#6b7280;">(${color.hex})</span></span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : `<p style="color:#6b7280; font-size:0.875rem; margin:0;">No primary colors specified</p>`
        }

        ${
          techPack.tech_pack.tech_pack.colors.accentColors?.length > 0
            ? `
        <div style="margin-top:16px;">
          <h3 style="font-weight:600; color:#374151; margin:0;">Accent Colors</h3>
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:8px;">
            ${techPack.tech_pack.tech_pack.colors.accentColors
              .map(
                (color: any) => `
              <div style="display:flex; align-items:center;">
                <span style="margin-top:14px; width:20px; height:20px; border-radius:50%; margin-right:8px; border:1px solid #ccc; background-color:${color.hex};"></span>
                <span>${color.name} <span style="font-size:0.75rem; color:#6b7280;">(${color.hex})</span></span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : `<p style="color:#6b7280; font-size:0.875rem; margin:0;">No accent colors specified</p>`
        }
      </div>
    </div>

    <!-- Quality Standards -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Quality Standards</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px;">
        ${
          techPack.tech_pack.tech_pack.qualityStandards
            ? `<p style="color:#374151; margin:0;">${techPack.tech_pack.tech_pack.qualityStandards}</p>`
            : `<p style="color:#374151; margin:0;">No Quality Standards information provided</p>`
        }
      </div>
    </div>

    <!-- Sizes -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding-left:16px; padding-bottom:24px; margin:0;">Sizes</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px;">
        ${techPack.tech_pack.tech_pack.sizeRange?.gradingLogic || ""}
        <div style="margin-top:8px; font-weight:600;">
          ${techPack.tech_pack.tech_pack.sizeRange?.sizes?.join(", ") || ""}
        </div>
      </div>
    </div>

  
    </div>
    
      
        <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
                <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
            </div>
      </div>
</div>
`;

  page2.innerHTML = `
  <!-- Outer Wrapper with Border -->
  <div style="border:2px solid black; margin:8px;">

    <!-- Header -->
    <div style="background:#fff; border-bottom:4px solid black; padding:12px; text-align:center;">
      <h1 style="font-size:1.5rem; font-weight:bold; padding:12px 0; margin:0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>

    <!-- BOM -->
    <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding:16px; margin:0;">Bill of Materials (BOM)</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; overflow-x:auto;">
        ${
          techPack.tech_pack.tech_pack.materials && techPack.tech_pack.tech_pack.materials.length > 0
            ? `
        <table style="width:100%; font-size:0.875rem; border-collapse:collapse;">
          <thead style="background:#f3f4f6;">
            <tr>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Component Name</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Material</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Specification</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Qty per unit</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Unit Cost</th>
              <th style="text-align:left; padding:8px 16px; font-weight:600;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${techPack.tech_pack.tech_pack.materials
              .map(
                (material: any) => `
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:8px 16px;">${material.component || ""}</td>
                <td style="padding:8px 16px;">${material.material || ""}</td>
                <td style="padding:8px 16px;">${material.specification || ""}</td>
                <td style="padding:8px 16px;">${material.quantityPerUnit || ""}</td>
                <td style="padding:8px 16px;">${material.unitCost || ""}</td>
                <td style="padding:8px 16px;">${material.notes || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : `<p style="color:#6b7280; padding:16px; margin:0;">No materials specified</p>`
        }
      </div>
    </div>

    <!-- Construction Details -->
    <div>
      <div style="display:flex; align-items:center; background:#d8d1ca; color:black;">
        <p style="font-size:1.5rem; font-weight:bold; padding:16px; margin:0;">Construction Details</p>
      </div>
      <div style="border:1px solid #e5e7eb; border-top:0; padding:16px; font-size:14px; line-height:1.6;">
        <p style="margin:0 0 8px; color:#374151;">
          ${techPack.tech_pack.tech_pack.constructionDetails?.description || ""}
        </p>
        ${
          techPack.tech_pack.tech_pack.constructionDetails?.constructionFeatures?.length > 0
            ? `
        <ul style="list-style:disc; padding-left:24px; margin:0;">
          ${techPack.tech_pack.tech_pack.constructionDetails.constructionFeatures
            .map(
              (item: any) => `
            <li>
              <p style="font-size:14px; color:#4B5563; margin:0;">
                <strong>${item.featureName || "Not specified"}</strong>: ${item.details || "Not specified"}
              </p>
            </li>
          `
            )
            .join("")}
        </ul>
        `
            : ""
        }
      </div>
    </div>

    <!-- Footer Logo -->
    <div style="position:absolute; bottom:16px; right:16px; height:48px; width:48px;">
      <img src="/favicon.png" alt="Logo" style="height:100%; width:100%; object-fit:contain;" />
    </div>
  </div>
`;

  const preferredOrder = ["front", "back", "side", "bottom", "other"];
  const existingImages = preferredOrder.filter((key) => techPack.tech_pack.image_data[key]?.url);

  page3.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
        ${existingImages
          .slice(0, 2)
          .map((key: any) => {
            const { url } = techPack.tech_pack.image_data[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            return `
              <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
                <img
                  src="${url}"
                  alt="${techPack.tech_pack.tech_pack?.name || "Product"} - ${label} view"
                  style="width: 100%; height: auto; object-fit: contain;"
                  onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
                />
                <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">${label}</p>
              </div>
            `;
          })
          .join("")}
      </div>


      <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
        <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
      </div>
    </div>
  </div>
</div>
`;

  page4.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
        ${existingImages
          .slice(2, 4)
          .map((key: any) => {
            const { url } = techPack.tech_pack.image_data[key];
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            return `
              <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
                <img
                  src="${url}"
                  alt="${techPack.tech_pack.tech_pack?.name || "Product"} - ${label} view"
                  style="width: 100%; height: auto; object-fit: contain;"
                  onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
                />
                <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">${label}</p>
              </div>
            `;
          })
          .join("")}
      </div>


      <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
        <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
      </div>
    </div>
  </div>
</div>
`;

  let page5: HTMLDivElement | null = null;
  let page6: HTMLDivElement | null = null;
  let page7: HTMLDivElement | null = null;
  let page8: HTMLDivElement | null = null;
  // let page9: HTMLDivElement | null = null;

  const techImages = techPack.tech_pack.technical_images
    ? Object.values(techPack.tech_pack.technical_images).filter((img: any) => img && img.url)
    : [];

  if (techImages.length > 0) {
    page5 = document.createElement("div");
    page6 = document.createElement("div");
    page7 = document.createElement("div");
    page8 = document.createElement("div");
    // page9 = document.createElement("div");

    // --- Page 3 ---

    // --- Page 4 (remaining technical images like callout, vector, measurement, etc.) ---
    page5.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  techPack.tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.vectorImage.url}"
      alt="${techPack.tech_pack.technical_images.vectorImage.type || "Product"} - Vector view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Vector View</p>
  </div>
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.technicalImage.url}"
      alt="${techPack.tech_pack.technical_images.technicalImage.type || "Product"} - Technical view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Technical View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    page6.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  techPack.tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.frontViewImage.url}"
      alt="${techPack.tech_pack.technical_images.frontViewImage.type || "Product"} - Front view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Front View</p>
  </div>
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.backViewImage.url}"
      alt="${techPack.tech_pack.technical_images.backViewImage.type || "Product"} - Back view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Back View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    page7.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  techPack.tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.constructionImage.url}"
      alt="${techPack.tech_pack.technical_images.constructionImage.type || "Product"} - Construction view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Construction View</p>
  </div>
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.calloutImage.url}"
      alt="${techPack.tech_pack.technical_images.calloutImage.type || "Product"} - CalloutImage view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Callout View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    page8.innerHTML = `
<div style="padding: 8px;">
  <div style="border: 2px solid black;">
    <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
      <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
        ${techPack.tech_pack.tech_pack.productName || "Product Name"} Tech Pack
      </h1>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
        <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
      </div>
      
      <!-- Updated image section with flexbox and responsive styling -->
            <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
${
  techPack.tech_pack.technical_images
    ? `
  <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    <img
      src="${techPack.tech_pack.technical_images.detailImage.url}"
      alt="${techPack.tech_pack.technical_images.detailImage.type || "Product"} - Detail view"
      style="width: 100%; height: auto; object-fit: contain;"
      onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    />
    <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Detail View</p>
  </div>
`
    : ""
}
</div>

<div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
  <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
</div>
    </div>
  </div>
</div>
`;

    //     page9.innerHTML =`
    // <div style="padding: 8px;">
    //   <div style="border: 2px solid black;">
    //     <div style="background: #fff; border-bottom: 4px solid black; padding: 12px; text-align: center;">
    //       <h1 style="font-size: 1.5rem; font-weight: bold; padding: 12px 0; margin: 0;">
    //         ${tech_pack.tech_pack.productName || "Product Name"} Tech Pack
    //       </h1>
    //     </div>
    //     <div style="margin-bottom: 24px;">
    //       <div style="display: flex; align-items: center; background: #d8d1ca; color: black;">
    //         <p style="font-size: 1.5rem; font-weight: bold; padding-left: 16px; padding-bottom: 24px; margin: 0;">Product Images</p>
    //       </div>

    //       <!-- Updated image section with flexbox and responsive styling -->
    //             <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
    // ${
    //   tech_pack.technical_images
    //     ? `
    //   <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    //     <img
    //       src="${tech_pack.technical_images.measurementImage.url}"
    //       alt="${tech_pack.technical_images.measurementImage.type || "Product"} - Measurement view"
    //       style="width: 100%; height: auto; object-fit: contain;"
    //       onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    //     />
    //     <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Measurement View</p>
    //   </div>
    //   <div style="width: 100%; max-width: 500px; padding: 16px; text-align: center; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 24px;">
    //     <img
    //       src="${tech_pack.technical_images.scaleProportionImage.url}"
    //       alt="${tech_pack.technical_images.scaleProportionImage.type || "Product"} - Scale Proportion view"
    //       style="width: 100%; height: auto; object-fit: contain;"
    //       onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
    //     />
    //     <p style="font-weight: bold; margin-top: 12px; font-size: 1rem;">Scale Proportion View</p>
    //   </div>
    // `
    //     : ""
    // }
    // </div>

    // <div style="position: absolute; bottom: 16px; right: 16px; height: 32px; width: 32px;">
    //   <img src="/favicon.png" alt="Logo" style="height: 100%; width: 100%; object-fit: contain;" />
    // </div>
    //     </div>
    //   </div>
    // </div>
    // `;
  }
  // document.body.appendChild(page1);
  // document.body.appendChild(page2);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pages: HTMLDivElement[] = [page1, page2, page3, page4];

    // Conditionally append technical image pages with styling via shared utility
    [page5, page6, page7, page8].forEach((page) => {
      if (page) {
        applyPageStyles([page]);
        pages.push(page);
      }
    });

    // Render all pages to PDF using shared utilities
    let isFirstPdfPage = true;
    for (let i = 0; i < pages.length; i++) {
      document.body.appendChild(pages[i]);
      const canvas = await html2canvas(pages[i], HTML2CANVAS_OPTIONS);
      await addImageWithPagination(pdf, canvas, isFirstPdfPage);
      isFirstPdfPage = false;
    }

    // Create base64 from Blob
    const pdfBlob = pdf.output("blob");
    const buffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    let binaryString = "";
    const chunkSize = 8192;

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, [...chunk]);
    }

    const base64 = btoa(binaryString);
    return base64;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    // Clean up DOM using shared utility
    cleanupPageElements([page1, page2, page3, page4, page5, page6, page7, page8]);
  }
};

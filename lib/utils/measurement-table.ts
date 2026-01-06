/**
 * Measurement Table Utilities
 * Generates structured measurement data tables from tech pack information
 */

export interface MeasurementPoint {
  indicator: string; // A, B, C, etc.
  label: string; // "Chest Width", "Total Length", etc.
  value: string | number; // "24 inches", "60 cm", etc.
  tolerance?: string; // "±0.5"
  notes?: string; // Additional specifications
}

export interface MeasurementTable {
  title: string;
  points: MeasurementPoint[];
  unit: 'cm' | 'inches' | 'mm';
}

/**
 * Generate measurement indicators (A, B, C...) for visual markers
 */
export function generateMeasurementIndicators(count: number): string[] {
  const indicators: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i < 26) {
      // A-Z
      indicators.push(String.fromCharCode(65 + i));
    } else {
      // AA, AB, AC...
      const firstLetter = String.fromCharCode(65 + Math.floor(i / 26) - 1);
      const secondLetter = String.fromCharCode(65 + (i % 26));
      indicators.push(firstLetter + secondLetter);
    }
  }
  return indicators;
}

/**
 * Extract measurements from tech pack data and create table
 */
export function generateMeasurementTable(techPack: any): MeasurementTable {
  const measurements: MeasurementPoint[] = [];
  const unit = techPack?.dimensions?.unit || 'cm';
  
  // First, try to extract actual dimensions from the tech pack
  if (techPack?.dimensions?.details && Array.isArray(techPack.dimensions.details)) {
    techPack.dimensions.details.forEach((detail: any) => {
      // Process each dimension dynamically
      Object.entries(detail).forEach(([key, value]: [string, any]) => {
        if (value && typeof value === 'object' && value.value) {
          measurements.push({
            indicator: String.fromCharCode(65 + measurements.length),
            label: value.label || key.charAt(0).toUpperCase() + key.slice(1),
            value: `${value.value} ${unit}`,
            tolerance: value.tolerance ? `±${value.tolerance}` : undefined,
            notes: value.notes || value.description
          });
        }
      });
    });
  }
  
  // If no measurements in tech pack, extract from tech pack description dynamically
  if (measurements.length === 0 && techPack?.constructionDetails?.keyMeasurements) {
    // If there are key measurements listed in construction details
    const keyMeasurements = techPack.constructionDetails.keyMeasurements;
    if (Array.isArray(keyMeasurements)) {
      keyMeasurements.forEach((measurement: any, index: number) => {
        measurements.push({
          indicator: String.fromCharCode(65 + index),
          label: measurement.name || measurement.label || `Measurement ${index + 1}`,
          value: measurement.value || 'TBD',
          tolerance: measurement.tolerance,
          notes: measurement.notes || 'To be confirmed'
        });
      });
    }
  }
  
  // If still no measurements, generate basic measurement points dynamically
  if (measurements.length === 0) {
    // Extract measurement needs from product description and materials
    const productName = techPack?.productName || 'Product';
    const category = techPack?.category_Subcategory || '';
    const materials = techPack?.materials || [];
    
    // Generate measurement points based on construction features
    const constructionFeatures = techPack?.constructionDetails?.constructionFeatures || [];
    const measurementPoints = new Set<string>();
    
    // Analyze construction features to determine measurement needs
    constructionFeatures.forEach((feature: any) => {
      const featureName = (feature.featureName || '').toLowerCase();
      
      // Dynamically determine measurements based on features
      if (featureName.includes('sleeve') || featureName.includes('arm')) {
        measurementPoints.add('Sleeve Length');
      }
      if (featureName.includes('collar') || featureName.includes('neck')) {
        measurementPoints.add('Neck Opening');
      }
      if (featureName.includes('hem') || featureName.includes('bottom')) {
        measurementPoints.add('Hem Width');
      }
      if (featureName.includes('chest') || featureName.includes('bust')) {
        measurementPoints.add('Chest Width');
      }
      if (featureName.includes('waist')) {
        measurementPoints.add('Waist Width');
      }
      if (featureName.includes('shoulder')) {
        measurementPoints.add('Shoulder Width');
      }
      if (featureName.includes('length') || featureName.includes('long')) {
        measurementPoints.add('Total Length');
      }
    });
    
    // Always include basic dimensions
    if (measurementPoints.size === 0) {
      measurementPoints.add('Width');
      measurementPoints.add('Height');
      measurementPoints.add('Depth');
    }
    
    // Convert to measurement array
    Array.from(measurementPoints).forEach((point, index) => {
      measurements.push({
        indicator: String.fromCharCode(65 + index),
        label: point,
        value: 'TBD',
        notes: `${productName} - ${point}`
      });
    });
  }
  
  return {
    title: `${techPack?.productName || 'Product'} Measurements`,
    points: measurements,
    unit: unit
  };
}

/**
 * Generate HTML table for measurements
 */
export function generateMeasurementTableHTML(table: MeasurementTable): string {
  let html = `
    <div class="measurement-table">
      <h3>${table.title}</h3>
      <table>
        <thead>
          <tr>
            <th>Indicator</th>
            <th>Measurement</th>
            <th>Value (${table.unit})</th>
            <th>Tolerance</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  table.points.forEach(point => {
    html += `
          <tr>
            <td class="indicator">${point.indicator}</td>
            <td>${point.label}</td>
            <td>${point.value}</td>
            <td>${point.tolerance || '-'}</td>
            <td>${point.notes || '-'}</td>
          </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
}

/**
 * Generate React component for measurement table
 */
export function MeasurementTableComponent({ table }: { table: MeasurementTable }) {
  return {
    jsx: `
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{table.title}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Point
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Measurement
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value ({table.unit})
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tolerance
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.points.map((point) => (
                <tr key={point.indicator}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-blue-600 rounded-full">
                      {point.indicator}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{point.label}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">{point.value}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{point.tolerance || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{point.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    `,
    table
  };
}

/**
 * Format measurements for prompt inclusion (simplified indicators only)
 */
export function formatMeasurementPrompt(table: MeasurementTable): string {
  const indicators = table.points.map(p => `${p.indicator}: ${p.label}`).join(', ');
  
  return `
    MEASUREMENT INDICATORS:
    Place circular markers with the following letters at appropriate measurement points:
    ${indicators}
    
    IMPORTANT: 
    - Use clear, bold letter indicators (A, B, C, etc.) in circles
    - Position indicators at exact measurement points
    - Do NOT include actual measurement values in the image
    - Keep indicators clean and professional
    - Use consistent sizing and styling for all indicators
  `;
}

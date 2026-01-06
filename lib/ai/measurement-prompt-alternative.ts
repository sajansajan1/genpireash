/**
 * Alternative prompt strategy for measurement images
 * Uses explicit positioning and minimal complexity
 */

import { ComponentMeasurementTable } from "@/lib/utils/component-measurement-table";
import { TechPackData } from "@/lib/types/sketch-generation";

export function buildAlternativeMeasurementPrompt(
  data: TechPackData, 
  componentTable: ComponentMeasurementTable
): string {
  const productName = data.tech_pack?.productName || "product";
  
  // DRASTICALLY REDUCE - only 3 main components
  const mainComponents = componentTable.components.slice(0, 3);
  
  // Ultra-simple placement
  const placements = [
    "left side",
    "center", 
    "right side"
  ];
  
  return `Draw ${productName} with 3 letter markers.

Put these 3 letters on the drawing:
- A on the ${placements[0]}
- B on the ${placements[1]}
- C on the ${placements[2]}

Rules:
• Draw the ${productName} clearly
• Add only 3 circles with letters: A, B, C
• One A, one B, one C - no more, no less
• No other letters or numbers

Simple technical drawing.`;
}

function getPositionDescription(index: number, total: number): string {
  // Provide clear position guidance based on typical product layouts
  const positions = [
    "top-left area",
    "top-right area", 
    "bottom-left area",
    "bottom-right area",
    "center area",
    "middle-left area",
    "middle-right area",
    "lower-center area"
  ];
  
  return positions[index] || "visible area";
}

/**
 * Ultra-minimal measurement prompt
 */
export function buildMinimalMeasurementPrompt(
  productName: string
): string {
  return `Technical drawing of ${productName}.

Add exactly 3 markers:
(A) - left
(B) - middle  
(C) - right

Nothing else. Just the product and these 3 letters.`;
}

/**
 * Two-step approach: First get clean drawing
 */
export function buildCleanDrawingPrompt(
  productName: string
): string {
  return `Create a clean technical line drawing of ${productName}.
Show all main components clearly.
No text, no letters, no numbers.
Just the product drawing.`;
}

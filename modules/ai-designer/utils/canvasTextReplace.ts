/**
 * Canvas Text Replacement Utility
 * Replaces detected text in images using canvas manipulation
 * Also supports adding text anywhere on an image
 */

import type { DetectedTextRegion } from "./textDetection";

export interface AddTextOptions {
  /** Font size in pixels */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Text color */
  textColor?: string;
  /** Background color behind text */
  backgroundColor?: string;
  /** Padding around text */
  padding?: number;
  /** Font weight */
  fontWeight?: "normal" | "bold";
}

export interface TextBoxOptions {
  /** Font family */
  fontFamily?: string;
  /** Text color */
  textColor?: string;
  /** Background color behind text */
  backgroundColor?: string;
  /** Padding inside the box */
  padding?: number;
  /** Font weight */
  fontWeight?: "normal" | "bold";
  /** Text alignment */
  textAlign?: "left" | "center" | "right";
  /** Line height multiplier */
  lineHeight?: number;
}

export interface TextBoxRect {
  /** Start X coordinate (normalized 0-1) */
  x1: number;
  /** Start Y coordinate (normalized 0-1) */
  y1: number;
  /** End X coordinate (normalized 0-1) */
  x2: number;
  /** End Y coordinate (normalized 0-1) */
  y2: number;
}

export interface TextReplacementOptions {
  /** Font family to use for replacement text */
  fontFamily?: string;
  /** Text color (CSS color value) */
  textColor?: string;
  /** Background color behind text (null for transparent) */
  backgroundColor?: string | null;
  /** Padding around text replacement area */
  padding?: number;
  /** Font weight */
  fontWeight?:
    | "normal"
    | "bold"
    | "bolder"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  /** Text alignment */
  textAlign?: "left" | "center" | "right";
}

const DEFAULT_OPTIONS: TextReplacementOptions = {
  fontFamily: "Arial, sans-serif",
  textColor: "#000000",
  backgroundColor: "#FFFFFF",
  padding: 1,
  fontWeight: "normal",
  textAlign: "left",
};

/**
 * Load an image and return it as an HTMLImageElement
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Replace text in an image at a specific region
 * Strategy:
 * 1. Fill the detected rectangle with background color (erase old text)
 * 2. Draw new user text centered in the white rectangle
 *
 * @param imageUrl - URL of the original image
 * @param region - The detected text region to replace
 * @param newText - The new text to insert
 * @param options - Styling options for the replacement
 * @returns Promise<string> - Data URL of the modified image
 */
export async function replaceTextInImage(
  imageUrl: string,
  region: DetectedTextRegion,
  newText: string,
  options: TextReplacementOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Load the original image
  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  // Create canvas at full image resolution
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Get the exact bounding box from OCR (pixel coordinates)
  const boxX = region.bbox.x0;
  const boxY = region.bbox.y0;
  const boxWidth = region.bbox.x1 - region.bbox.x0;
  const boxHeight = region.bbox.y1 - region.bbox.y0;

  // Step 1: Fill the rectangle with background color (erase old text)
  ctx.fillStyle = opts.backgroundColor || "#FFFFFF";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Step 2: Draw user's new text centered in the rectangle
  if (newText.trim()) {
    // Calculate font size to fit within the box
    // Start with box height and adjust down if text is too wide
    let fontSize = boxHeight * 0.8;
    ctx.font = `${opts.fontWeight} ${fontSize}px ${opts.fontFamily}`;

    // Reduce font size if text is wider than the box
    while (ctx.measureText(newText).width > boxWidth * 0.95 && fontSize > 8) {
      fontSize -= 1;
      ctx.font = `${opts.fontWeight} ${fontSize}px ${opts.fontFamily}`;
    }

    // Draw the text centered in the box
    ctx.fillStyle = opts.textColor || "#000000";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(newText, boxX + boxWidth / 2, boxY + boxHeight / 2);
  }

  return canvas.toDataURL("image/png");
}

/**
 * Erase text from an image by filling the region with background color
 * @param imageUrl - URL of the original image
 * @param region - The detected text region to erase
 * @param backgroundColor - Color to fill the region with
 * @returns Promise<string> - Data URL of the modified image
 */
export async function eraseTextRegion(
  imageUrl: string,
  region: DetectedTextRegion,
  backgroundColor: string
): Promise<string> {
  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.drawImage(img, 0, 0);

  // Add padding to ensure complete coverage
  const padding = 3;
  const fillX = region.bbox.x0 - padding;
  const fillY = region.bbox.y0 - padding;
  const fillWidth = region.bbox.x1 - region.bbox.x0 + padding * 2;
  const fillHeight = region.bbox.y1 - region.bbox.y0 + padding * 2;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(fillX, fillY, fillWidth, fillHeight);

  return canvas.toDataURL("image/png");
}

/**
 * Replace multiple text regions in an image
 * @param imageUrl - URL of the original image
 * @param replacements - Array of { region, newText } pairs
 * @param options - Styling options for all replacements
 * @returns Promise<string> - Data URL of the modified image
 */
export async function replaceMultipleTexts(
  imageUrl: string,
  replacements: Array<{ region: DetectedTextRegion; newText: string }>,
  options: TextReplacementOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.drawImage(img, 0, 0);

  for (const { region, newText } of replacements) {
    const boxX = region.bbox.x0;
    const boxY = region.bbox.y0;
    const boxWidth = region.bbox.x1 - region.bbox.x0;
    const boxHeight = region.bbox.y1 - region.bbox.y0;

    // Fill rectangle with background
    ctx.fillStyle = opts.backgroundColor || "#FFFFFF";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Draw new text if provided
    if (newText.trim()) {
      let fontSize = boxHeight * 0.8;
      ctx.font = `${opts.fontWeight} ${fontSize}px ${opts.fontFamily}`;

      while (ctx.measureText(newText).width > boxWidth * 0.95 && fontSize > 8) {
        fontSize -= 1;
        ctx.font = `${opts.fontWeight} ${fontSize}px ${opts.fontFamily}`;
      }

      ctx.fillStyle = opts.textColor || "#000000";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(newText, boxX + boxWidth / 2, boxY + boxHeight / 2);
    }
  }

  return canvas.toDataURL("image/png");
}

/**
 * Sample background color from the image around a region
 * Uses multiple sample points and filters out text-like colors (dark pixels)
 * to get a more accurate background color
 */
export async function sampleBackgroundColor(
  imageUrl: string,
  region: DetectedTextRegion
): Promise<string> {
  const img = await loadImage(imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "#FFFFFF";
  }

  ctx.drawImage(img, 0, 0);

  // Sample more pixels from around the region edges
  const samplePoints = [
    // Left edge samples
    { x: region.bbox.x0 - 3, y: region.bbox.y0 },
    {
      x: region.bbox.x0 - 3,
      y: region.bbox.y0 + (region.bbox.y1 - region.bbox.y0) / 2,
    },
    { x: region.bbox.x0 - 3, y: region.bbox.y1 },
    // Right edge samples
    { x: region.bbox.x1 + 3, y: region.bbox.y0 },
    {
      x: region.bbox.x1 + 3,
      y: region.bbox.y0 + (region.bbox.y1 - region.bbox.y0) / 2,
    },
    { x: region.bbox.x1 + 3, y: region.bbox.y1 },
    // Top edge samples
    { x: region.bbox.x0, y: region.bbox.y0 - 3 },
    {
      x: region.bbox.x0 + (region.bbox.x1 - region.bbox.x0) / 2,
      y: region.bbox.y0 - 3,
    },
    // Bottom edge samples
    { x: region.bbox.x0, y: region.bbox.y1 + 3 },
    {
      x: region.bbox.x0 + (region.bbox.x1 - region.bbox.x0) / 2,
      y: region.bbox.y1 + 3,
    },
  ];

  const colors: number[][] = [];

  for (const point of samplePoints) {
    // Ensure point is within bounds
    const x = Math.max(0, Math.min(Math.round(point.x), canvas.width - 1));
    const y = Math.max(0, Math.min(Math.round(point.y), canvas.height - 1));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0],
      g = pixel[1],
      b = pixel[2];

    // Filter out very dark pixels (likely text) and very bright pixels
    const brightness = (r + g + b) / 3;
    if (brightness > 100 && brightness < 250) {
      colors.push([r, g, b]);
    }
  }

  // If no valid colors found, default to white or sample center of edges
  if (colors.length === 0) {
    // Try to get a single pixel from just outside the left edge
    const x = Math.max(0, region.bbox.x0 - 2);
    const y = region.bbox.y0 + (region.bbox.y1 - region.bbox.y0) / 2;
    const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }

  // Average the colors
  const avgColor = colors
    .reduce(
      (acc, color) => [acc[0] + color[0], acc[1] + color[1], acc[2] + color[2]],
      [0, 0, 0]
    )
    .map((c) => Math.round(c / colors.length));

  return `rgb(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]})`;
}

/**
 * Add text to an image at a specific position
 * Draws text with a white background box at the clicked coordinates
 *
 * @param imageUrl - URL of the original image
 * @param x - X coordinate (normalized 0-1, where clicked on displayed image)
 * @param y - Y coordinate (normalized 0-1, where clicked on displayed image)
 * @param text - The text to add
 * @param options - Styling options
 * @returns Promise<string> - Data URL of the modified image
 */
export async function addTextToImage(
  imageUrl: string,
  x: number,
  y: number,
  text: string,
  options: AddTextOptions = {}
): Promise<string> {
  const {
    fontSize = 24,
    fontFamily = "Arial, sans-serif",
    textColor = "#000000",
    backgroundColor = "#FFFFFF",
    padding = 8,
    fontWeight = "normal",
  } = options;

  // Load the original image
  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  // Create canvas at full image resolution
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Convert normalized coordinates to pixel coordinates
  const pixelX = x * width;
  const pixelY = y * height;

  // Set up font to measure text
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Calculate box dimensions with padding
  const boxWidth = textWidth + padding * 2;
  const boxHeight = textHeight + padding * 2;

  // Calculate box position (centered on click point)
  let boxX = pixelX - boxWidth / 2;
  let boxY = pixelY - boxHeight / 2;

  // Ensure box stays within image bounds
  boxX = Math.max(0, Math.min(boxX, width - boxWidth));
  boxY = Math.max(0, Math.min(boxY, height - boxHeight));

  // Draw background rectangle
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Draw text centered in the box
  ctx.fillStyle = textColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);

  return canvas.toDataURL("image/png");
}

/**
 * Add text to an image within a user-defined rectangle with line wrapping
 * User drags to define the text area, text wraps within that area
 *
 * @param imageUrl - URL of the original image
 * @param rect - Rectangle coordinates (normalized 0-1)
 * @param text - The text to add
 * @param options - Styling options
 * @returns Promise<string> - Data URL of the modified image
 */
export async function addTextInRect(
  imageUrl: string,
  rect: TextBoxRect,
  text: string,
  options: TextBoxOptions = {}
): Promise<string> {
  const {
    fontFamily = "Arial, sans-serif",
    textColor = "#000000",
    backgroundColor = "#FFFFFF",
    padding = 8,
    fontWeight = "normal",
    textAlign = "left",
    lineHeight = 1.3,
  } = options;

  // Load the original image
  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  // Create canvas at full image resolution
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Convert normalized coordinates to pixel coordinates
  // Ensure x1 < x2 and y1 < y2
  const pixelX1 = Math.min(rect.x1, rect.x2) * width;
  const pixelY1 = Math.min(rect.y1, rect.y2) * height;
  const pixelX2 = Math.max(rect.x1, rect.x2) * width;
  const pixelY2 = Math.max(rect.y1, rect.y2) * height;

  const boxWidth = pixelX2 - pixelX1;
  const boxHeight = pixelY2 - pixelY1;

  // Draw background rectangle with black border
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(pixelX1, pixelY1, boxWidth, boxHeight);

  // Draw black border around the label box
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(pixelX1, pixelY1, boxWidth, boxHeight);

  // Calculate available text area (inside padding)
  const textAreaWidth = boxWidth - padding * 2;
  const textAreaHeight = boxHeight - padding * 2;

  if (textAreaWidth <= 0 || textAreaHeight <= 0 || !text.trim()) {
    return canvas.toDataURL("image/png");
  }

  // Use fixed 11px font size
  const fontSize = 16;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Wrap text to fit within the box width
  const lines = wrapText(ctx, text, textAreaWidth);
  const totalTextHeight = lines.length * fontSize * lineHeight;

  // Draw text lines
  ctx.fillStyle = textColor;
  ctx.textBaseline = "top";
  ctx.textAlign = textAlign;

  // Calculate starting Y position to vertically center text
  const startY = pixelY1 + padding + (textAreaHeight - totalTextHeight) / 2;

  // Calculate X position based on alignment
  let textX: number;
  switch (textAlign) {
    case "center":
      textX = pixelX1 + padding + textAreaWidth / 2;
      break;
    case "right":
      textX = pixelX1 + padding + textAreaWidth;
      break;
    default:
      textX = pixelX1 + padding;
  }

  // Draw text without stroke for cleaner, lighter appearance
  lines.forEach((line, index) => {
    const y = startY + index * fontSize * lineHeight;
    ctx.fillText(line, textX, y);
  });

  return canvas.toDataURL("image/png");
}

/**
 * Helper function to wrap text to fit within a given width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Arrow drawing options
 */
export interface ArrowOptions {
  /** Arrow color */
  color?: string;
  /** Line width in pixels (at full image resolution) */
  lineWidth?: number;
  /** Arrowhead size in pixels */
  headSize?: number;
}

/**
 * Add an arrow to an image
 * @param imageUrl - URL of the original image
 * @param start - Start point (normalized 0-1)
 * @param end - End point (normalized 0-1)
 * @param options - Styling options
 * @returns Promise<string> - Data URL of the modified image
 */
export async function addArrowToImage(
  imageUrl: string,
  start: { x: number; y: number },
  end: { x: number; y: number },
  options: ArrowOptions = {}
): Promise<string> {
  const { color = "#000000", lineWidth = 3, headSize = 15 } = options;

  // Load the original image
  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  // Create canvas at full image resolution
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Convert normalized coordinates to pixel coordinates
  const startX = start.x * width;
  const startY = start.y * height;
  const endX = end.x * width;
  const endY = end.y * height;

  // Scale line width based on image size
  const scaledLineWidth = (lineWidth * Math.max(width, height)) / 1000;
  const scaledHeadSize = (headSize * Math.max(width, height)) / 1000;

  // Calculate arrow angle
  const angle = Math.atan2(endY - startY, endX - startX);

  // Draw the arrow line
  ctx.strokeStyle = color;
  ctx.lineWidth = scaledLineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw the arrowhead
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - scaledHeadSize * Math.cos(angle - Math.PI / 6),
    endY - scaledHeadSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - scaledHeadSize * Math.cos(angle + Math.PI / 6),
    endY - scaledHeadSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL("image/png");
}

/**
 * Eraser options
 */
export interface EraserOptions {
  /** Brush size in pixels (at full image resolution) */
  brushSize?: number;
  /** Erase color (defaults to white) */
  color?: string;
}

/**
 * Erase parts of an image by drawing over a path
 * @param imageUrl - URL of the original image
 * @param path - Array of points (normalized 0-1) representing the eraser path
 * @param options - Styling options
 * @returns Promise<string> - Data URL of the modified image
 */
export async function eraseOnImage(
  imageUrl: string,
  path: Array<{ x: number; y: number }>,
  options: EraserOptions = {}
): Promise<string> {
  const { brushSize = 20, color = "#FFFFFF" } = options;

  if (path.length === 0) {
    return imageUrl;
  }

  // Load the original image
  const img = await loadImage(imageUrl);
  const { naturalWidth: width, naturalHeight: height } = img;

  // Create canvas at full image resolution
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Scale brush size based on image size
  const scaledBrushSize = (brushSize * Math.max(width, height)) / 1000;

  // Set up eraser style
  ctx.strokeStyle = color;
  ctx.lineWidth = scaledBrushSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Draw the eraser path
  ctx.beginPath();
  const firstPoint = path[0];
  ctx.moveTo(firstPoint.x * width, firstPoint.y * height);

  for (let i = 1; i < path.length; i++) {
    const point = path[i];
    ctx.lineTo(point.x * width, point.y * height);
  }

  ctx.stroke();

  // Also draw circles at each point for smoother erasing
  ctx.fillStyle = color;
  for (const point of path) {
    ctx.beginPath();
    ctx.arc(
      point.x * width,
      point.y * height,
      scaledBrushSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  return canvas.toDataURL("image/png");
}

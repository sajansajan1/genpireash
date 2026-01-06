export function hexToRgb(hex: string) {
    // Remove the # if present
    hex = hex.replace("#", "");
  
    // Parse the hex values
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
  
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  export function hexToCmyk(hex: string) {
    // Remove the # if present
    hex = hex.replace("#", "");
  
    // Parse the hex values to RGB
    const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
    const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
    const b = Number.parseInt(hex.substring(4, 6), 16) / 255;
  
    // Calculate CMYK values
    let k = 1 - Math.max(r, g, b);
    let c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    let m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    let y = k === 1 ? 0 : (1 - b - k) / (1 - k);
  
    // Convert to percentages
    c = Math.round(c * 100);
    m = Math.round(m * 100);
    y = Math.round(y * 100);
    k = Math.round(k * 100);
  
    return `C:${c}% M:${m}% Y:${y}% K:${k}%`;
  }

/**
 * Formats text containing URLs by replacing long URLs with shortened placeholders
 * and converting markdown image syntax to image placeholders
 * 
 * @param text - The text to format
 * @returns Formatted text with shortened URLs and image placeholders
 */
export function formatTextWithUrls(text: string): string | React.ReactNode {
  if (!text) return '';
  
  // Pattern to match markdown image syntax ![alt](url)
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  // Pattern to match plain URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  // First, replace markdown image syntax with a placeholder
  let formatted = text.replace(imagePattern, (_match, alt, _url) => {
    return `[${alt || 'Image'}]`;
  });
  
  // Then replace any remaining URLs with shortened versions (first 10 chars ... last 6 chars)
  formatted = formatted.replace(urlPattern, (url) => {
    if (url.length > 20) {
      return `[${url.substring(0, 10)}...${url.substring(url.length - 6)}]`;
    }
    return url;
  });
  
  return formatted;
}

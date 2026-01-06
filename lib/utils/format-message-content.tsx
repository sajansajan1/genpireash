import React from 'react';

/**
 * Extracts image URLs from markdown format in text
 * @param text - The text containing markdown images
 * @returns Object with cleaned text and extracted image URLs
 */
export function extractImagesFromText(text: string): {
  cleanedText: string;
  images: Array<{ alt: string; url: string }>;
} {
  if (!text) return { cleanedText: '', images: [] };
  
  const images: Array<{ alt: string; url: string }> = [];
  
  // Pattern to match markdown image syntax ![alt](url)
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  // Extract all images and store them
  let match;
  while ((match = imagePattern.exec(text)) !== null) {
    images.push({
      alt: match[1] || 'Image',
      url: match[2]
    });
  }
  
  // Remove markdown image syntax from text
  let cleanedText = text.replace(imagePattern, '');
  
  // Also shorten any remaining plain URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  cleanedText = cleanedText.replace(urlPattern, (url) => {
    // Check if this URL is one of our extracted images
    if (images.some(img => img.url === url)) {
      return ''; // Remove it, it's already in images
    }
    // Otherwise shorten it
    if (url.length > 30) {
      return `[${url.substring(0, 10)}...${url.substring(url.length - 6)}]`;
    }
    return url;
  });
  
  // Clean up extra whitespace
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  return { cleanedText, images };
}

/**
 * Formats message content with proper image handling
 * Returns JSX with text and embedded images
 */
export function formatMessageWithImages(content: string): React.ReactNode {
  const { cleanedText, images } = extractImagesFromText(content);
  
  if (images.length === 0) {
    return cleanedText;
  }
  
  return (
    <div className="space-y-2">
      {cleanedText && (
        <p className="whitespace-pre-wrap">{cleanedText}</p>
      )}
      {images.map((image, index) => (
        <div key={index} className="flex items-center gap-2 text-xs opacity-75">
          <span>📎</span>
          <span className="italic">{image.alt}</span>
        </div>
      ))}
    </div>
  );
}

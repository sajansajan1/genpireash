/**
 * Message formatting utilities
 */

import { MESSAGE_TEMPLATES } from '../constants/messages';

/**
 * Get a random message from an array
 */
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get dynamic message based on context
 */
export function getDynamicMessage(context: {
  type: string;
  viewType?: string;
  productName?: string;
  progress?: number;
}) {
  const { type, viewType, productName, progress } = context;

  if (type === 'image-ready' && viewType) {
    const viewMessages = MESSAGE_TEMPLATES['image-ready'][viewType as keyof typeof MESSAGE_TEMPLATES['image-ready']];
    if (Array.isArray(viewMessages)) {
      return getRandomMessage(viewMessages);
    }
  }

  if (type === 'success') {
    return getRandomMessage(MESSAGE_TEMPLATES.success);
  }

  if (type === 'completion') {
    return getRandomMessage(MESSAGE_TEMPLATES.completion);
  }

  if (type === 'processing' && progress !== undefined) {
    if (progress < 30) {
      return getRandomMessage(MESSAGE_TEMPLATES.processing.early);
    } else if (progress < 70) {
      return getRandomMessage(MESSAGE_TEMPLATES.processing.mid);
    } else {
      return getRandomMessage(MESSAGE_TEMPLATES.processing.late);
    }
  }

  if (type === 'analysis') {
    return getRandomMessage(MESSAGE_TEMPLATES.analysis);
  }

  return 'Processing your request...';
}

/**
 * Get progress message based on view being processed
 */
export function getProgressMessage(view: string, progress: number): string {
  const viewName = view.charAt(0).toUpperCase() + view.slice(1);

  if (progress < 30) {
    return `Initializing ${viewName} view generation...`;
  } else if (progress < 60) {
    return `Processing ${viewName} view details...`;
  } else if (progress < 90) {
    return `Finalizing ${viewName} view...`;
  } else {
    return `${viewName} view complete!`;
  }
}

/**
 * Get follow-up suggestion based on context
 */
export function getFollowUpSuggestion(editType: string, productType?: string): string {
  const suggestions = [
    "Try adjusting the colors or materials for a different look.",
    "You can add logos or brand elements to personalize further.",
    "Consider changing the style or adding decorative details.",
    "Experiment with different textures or patterns.",
    "Add accessories or complementary elements to enhance the design.",
  ];

  return getRandomMessage(suggestions);
}

/**
 * Format text with URL detection and conversion
 */
export function formatTextWithUrls(text: string): string {
  // Simple URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return text.replace(urlPattern, (url) => {
    const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;
    return `[${displayUrl}](${url})`;
  });
}

/**
 * Clean message content from screenshots and technical markers
 */
export function cleanMessageContent(content: string): string {
  return content
    .replace(/\[Current Design Screenshot: https?:\/\/[^\]]+\]/g, '')
    .replace(/!\[Annotated Screenshot\]\([^)]+\)/g, '')
    .trim();
}

/**
 * Extract images from message text
 */
export function extractImagesFromText(text: string): Array<{ url: string; alt?: string }> {
  const images: Array<{ url: string; alt?: string }> = [];

  // Markdown image format: ![alt](url)
  const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownRegex.exec(text)) !== null) {
    images.push({
      alt: match[1] || undefined,
      url: match[2]
    });
  }

  // Direct URL format: [Current Design Screenshot: url]
  const directRegex = /\[Current Design Screenshot: (https?:\/\/[^\]]+)\]/g;

  while ((match = directRegex.exec(text)) !== null) {
    images.push({
      alt: 'Current Design Screenshot',
      url: match[1]
    });
  }

  return images;
}

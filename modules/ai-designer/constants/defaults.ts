/**
 * Default configurations and constants
 */

// Editor defaults
export const EDITOR_DEFAULTS = {
  ZOOM_MIN: 25,
  ZOOM_MAX: 200,
  ZOOM_DEFAULT: 65,
  ZOOM_STEP: 5,
  MAX_FUNCTION_LENGTH: 50,
  MAX_FILE_LENGTH: 500,
  MAX_CHAT_MESSAGES: 250,
};

// UI defaults
export const UI_DEFAULTS = {
  TOAST_DURATION: 3000,
  LOADING_OVERLAY_DELAY: 500,
  MESSAGE_ANIMATION_DELAY: 200,
  SKELETON_TIMEOUT: 5000,
  AUTO_SCROLL_DELAY: 100,
};

// API defaults
export const API_DEFAULTS = {
  TEMPERATURE_INTENT: 0.3,
  TEMPERATURE_CHAT: 0.7,
  MAX_TOKENS_INTENT: 20,
  MAX_TOKENS_CHAT: 300,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Canvas defaults
export const CANVAS_DEFAULTS = {
  LINE_WIDTH: 2,
  ANNOTATION_COLOR: '#FF0000',
  ANNOTATION_SIZE: 8,
  ARROW_HEAD_LENGTH: 10,
  ARROW_HEAD_ANGLE: Math.PI / 6,
};

// Tool configurations
export const TOOL_CONFIGS = {
  PEN_CURSOR: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"></path><path d="m9 11 4 4"></path><path d="m5 19-2 1"></path><path d="m14 4 6 6"></path></svg>') 2 18, crosshair`,
  TEXT_CURSOR: 'text',
  POINTER_CURSOR: 'pointer',
  CROSSHAIR_CURSOR: 'crosshair',
};

// File size limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
};

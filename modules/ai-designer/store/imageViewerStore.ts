/**
 * Shared Image Viewer Store
 * Provides a global image viewer modal that can be used by any component
 * Supports multiple editing tools: text, arrow, eraser
 */

import { create } from 'zustand';

export interface ImageViewerData {
  url: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  /** Enable text editing for this image (typically for sketches) */
  allowTextEditing?: boolean;
  /** Callback when image is edited locally (receives base64 data URL) */
  onImageEdited?: (newImageUrl: string) => void;
  /**
   * Callback to save the edited image to a backend/database.
   * Receives the base64 image data and should return the new URL on success.
   * If not provided, Save button won't be shown.
   */
  onSave?: (imageData: string) => Promise<{ success: boolean; newImageUrl?: string; error?: string }>;
}

export interface SelectionRect {
  x1: number; // Normalized 0-1
  y1: number; // Normalized 0-1
  x2: number; // Normalized 0-1
  y2: number; // Normalized 0-1
}

/** Available editing tools */
export type EditTool = 'text' | 'arrow' | 'eraser';

/** Point coordinates (normalized 0-1) */
export interface Point {
  x: number;
  y: number;
}

interface ImageViewerState {
  isOpen: boolean;
  image: ImageViewerData | null;

  // Edit mode state
  isEditMode: boolean;
  currentTool: EditTool;
  isDragging: boolean;
  dragStart: Point | null;

  // Text tool state
  selectionRect: SelectionRect | null;
  isAddingText: boolean;

  // Arrow tool state
  arrowStart: Point | null;
  arrowEnd: Point | null;

  // Eraser tool state
  eraserPath: Point[];
  isErasing: boolean;

  // Actions
  openViewer: (image: ImageViewerData) => void;
  closeViewer: () => void;

  // Edit mode actions
  enterEditMode: () => void;
  exitEditMode: () => void;
  setCurrentTool: (tool: EditTool) => void;

  // Drag actions (used by all tools)
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: (x: number, y: number) => void;
  cancelDrag: () => void;

  // Text tool actions
  clearSelection: () => void;
  setAddingText: (adding: boolean) => void;

  // Arrow tool actions
  clearArrow: () => void;

  // Eraser tool actions
  addEraserPoint: (point: Point) => void;
  clearEraserPath: () => void;

  // Legacy aliases for backward compatibility
  isTextEditMode: boolean;
  enterTextEditMode: () => void;
  exitTextEditMode: () => void;
  clearTextEditState: () => void;
}

const initialEditState = {
  isEditMode: false,
  currentTool: 'text' as EditTool,
  isDragging: false,
  dragStart: null,
  selectionRect: null,
  isAddingText: false,
  arrowStart: null,
  arrowEnd: null,
  eraserPath: [] as Point[],
  isErasing: false,
};

export const useImageViewerStore = create<ImageViewerState>((set, get) => ({
  isOpen: false,
  image: null,

  // Initial edit state
  ...initialEditState,

  // Legacy alias
  get isTextEditMode() {
    return get().isEditMode;
  },

  openViewer: (image) => set({
    isOpen: true,
    image,
    // Reset all edit state when opening new image
    ...initialEditState,
  }),

  closeViewer: () => set({
    isOpen: false,
    image: null,
    ...initialEditState,
  }),

  // Edit mode actions
  enterEditMode: () => set({ isEditMode: true }),
  exitEditMode: () => set({
    isEditMode: false,
    isDragging: false,
    dragStart: null,
    selectionRect: null,
    arrowStart: null,
    arrowEnd: null,
    eraserPath: [],
    isErasing: false,
  }),

  setCurrentTool: (tool) => set({
    currentTool: tool,
    // Clear tool-specific state when switching tools
    selectionRect: null,
    arrowStart: null,
    arrowEnd: null,
    eraserPath: [],
    isDragging: false,
    dragStart: null,
  }),

  // Drag actions - behavior depends on current tool
  startDrag: (x, y) => {
    const { currentTool } = get();

    if (currentTool === 'text') {
      set({
        isDragging: true,
        dragStart: { x, y },
        selectionRect: { x1: x, y1: y, x2: x, y2: y },
      });
    } else if (currentTool === 'arrow') {
      set({
        isDragging: true,
        dragStart: { x, y },
        arrowStart: { x, y },
        arrowEnd: { x, y },
      });
    } else if (currentTool === 'eraser') {
      set({
        isDragging: true,
        isErasing: true,
        dragStart: { x, y },
        eraserPath: [{ x, y }],
      });
    }
  },

  updateDrag: (x, y) => {
    const { dragStart, currentTool, eraserPath } = get();
    if (!dragStart) return;

    if (currentTool === 'text') {
      set({
        selectionRect: { x1: dragStart.x, y1: dragStart.y, x2: x, y2: y },
      });
    } else if (currentTool === 'arrow') {
      set({
        arrowEnd: { x, y },
      });
    } else if (currentTool === 'eraser') {
      set({
        eraserPath: [...eraserPath, { x, y }],
      });
    }
  },

  endDrag: (x, y) => {
    const { dragStart, currentTool } = get();
    if (!dragStart) return;

    if (currentTool === 'text') {
      // Calculate the final rectangle
      const rect: SelectionRect = {
        x1: dragStart.x,
        y1: dragStart.y,
        x2: x,
        y2: y,
      };

      // Check if rectangle is big enough
      const width = Math.abs(rect.x2 - rect.x1);
      const height = Math.abs(rect.y2 - rect.y1);

      if (width < 0.02 || height < 0.02) {
        // Rectangle too small, cancel
        set({
          isDragging: false,
          dragStart: null,
          selectionRect: null,
        });
        return;
      }

      set({
        isDragging: false,
        dragStart: null,
        selectionRect: rect,
      });
    } else if (currentTool === 'arrow') {
      // Check if arrow is long enough
      const length = Math.sqrt(
        Math.pow(x - dragStart.x, 2) + Math.pow(y - dragStart.y, 2)
      );

      if (length < 0.02) {
        // Arrow too short, cancel
        set({
          isDragging: false,
          dragStart: null,
          arrowStart: null,
          arrowEnd: null,
        });
        return;
      }

      set({
        isDragging: false,
        dragStart: null,
        arrowEnd: { x, y },
        // Keep arrowStart and arrowEnd for rendering
      });
    } else if (currentTool === 'eraser') {
      set({
        isDragging: false,
        isErasing: false,
        dragStart: null,
        // Keep eraserPath for applying the erase
      });
    }
  },

  cancelDrag: () => set({
    isDragging: false,
    dragStart: null,
    selectionRect: null,
    arrowStart: null,
    arrowEnd: null,
    eraserPath: [],
    isErasing: false,
  }),

  // Text tool actions
  clearSelection: () => set({
    selectionRect: null,
  }),

  setAddingText: (adding) => set({ isAddingText: adding }),

  // Arrow tool actions
  clearArrow: () => set({
    arrowStart: null,
    arrowEnd: null,
  }),

  // Eraser tool actions
  addEraserPoint: (point) => {
    const { eraserPath } = get();
    set({ eraserPath: [...eraserPath, point] });
  },

  clearEraserPath: () => set({
    eraserPath: [],
    isErasing: false,
  }),

  // Legacy aliases for backward compatibility
  enterTextEditMode: () => set({ isEditMode: true, currentTool: 'text' }),
  exitTextEditMode: () => set({
    isEditMode: false,
    isDragging: false,
    dragStart: null,
    selectionRect: null,
    arrowStart: null,
    arrowEnd: null,
    eraserPath: [],
  }),

  clearTextEditState: () => set({
    isEditMode: false,
    isDragging: false,
    dragStart: null,
    selectionRect: null,
    isAddingText: false,
    arrowStart: null,
    arrowEnd: null,
    eraserPath: [],
    isErasing: false,
  }),
}));

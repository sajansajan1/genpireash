/**
 * Annotation state management using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Annotation,
  AnnotationTool,
  DrawingState,
  DragState,
  ViewType
} from '../types';

interface AnnotationState {
  // Annotations
  annotations: Annotation[];
  selectedAnnotation: string | null;

  // Drawing state
  drawing: DrawingState;

  // Dragging state
  drag: DragState;

  // Canvas state
  canvasInitialized: boolean;

  // Actions
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: (viewType?: ViewType) => void;
  selectAnnotation: (id: string | null) => void;
  setDrawingState: (state: Partial<DrawingState>) => void;
  startDrawing: (x: number, y: number, viewType: ViewType) => void;
  addDrawingPoint: (x: number, y: number) => void;
  finishDrawing: () => void;
  setDragState: (state: Partial<DragState>) => void;
  startDragging: (annotationId: string, offsetX: number, offsetY: number) => void;
  stopDragging: () => void;
  setCanvasInitialized: (initialized: boolean) => void;
  undo: () => void;
  reset: () => void;
}

const initialState = {
  annotations: [],
  selectedAnnotation: null,
  drawing: {
    isDrawing: false,
    currentDrawing: [],
    drawStartPoint: null,
  },
  drag: {
    isDragging: false,
    draggedAnnotationId: null,
    dragOffset: { x: 0, y: 0 },
  },
  canvasInitialized: false,
};

export const useAnnotationStore = create<AnnotationState>()(
  devtools(
    (set) => ({
      ...initialState,

      addAnnotation: (annotation) =>
        set((state) => ({
          annotations: [...state.annotations, annotation],
        })),

      updateAnnotation: (id, updates) =>
        set((state) => ({
          annotations: state.annotations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      removeAnnotation: (id) =>
        set((state) => ({
          annotations: state.annotations.filter((a) => a.id !== id),
          selectedAnnotation: state.selectedAnnotation === id ? null : state.selectedAnnotation,
        })),

      clearAnnotations: (viewType) =>
        set((state) => ({
          annotations: viewType
            ? state.annotations.filter((a) => a.viewType !== viewType)
            : [],
          selectedAnnotation: null,
        })),

      selectAnnotation: (id) =>
        set({ selectedAnnotation: id }),

      setDrawingState: (drawingUpdate) =>
        set((state) => ({
          drawing: { ...state.drawing, ...drawingUpdate },
        })),

      startDrawing: (x, y, viewType) =>
        set({
          drawing: {
            isDrawing: true,
            currentDrawing: [{ x, y }],
            drawStartPoint: { x, y, viewType },
          },
        }),

      addDrawingPoint: (x, y) =>
        set((state) => ({
          drawing: {
            ...state.drawing,
            currentDrawing: [...state.drawing.currentDrawing, { x, y }],
          },
        })),

      finishDrawing: () =>
        set({
          drawing: {
            isDrawing: false,
            currentDrawing: [],
            drawStartPoint: null,
          },
        }),

      setDragState: (dragUpdate) =>
        set((state) => ({
          drag: { ...state.drag, ...dragUpdate },
        })),

      startDragging: (annotationId, offsetX, offsetY) =>
        set({
          drag: {
            isDragging: true,
            draggedAnnotationId: annotationId,
            dragOffset: { x: offsetX, y: offsetY },
          },
        }),

      stopDragging: () =>
        set({
          drag: {
            isDragging: false,
            draggedAnnotationId: null,
            dragOffset: { x: 0, y: 0 },
          },
        }),

      setCanvasInitialized: (initialized) =>
        set({ canvasInitialized: initialized }),

      undo: () =>
        set((state) => {
          if (state.annotations.length === 0) return state;
          const newAnnotations = state.annotations.slice(0, -1);
          return {
            annotations: newAnnotations,
            selectedAnnotation: null,
          };
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'ai-designer-annotations',
    }
  )
);

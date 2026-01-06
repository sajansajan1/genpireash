/**
 * Visual annotation type definitions
 */

import type { ViewType } from './editor.types';

export type AnnotationType = "point" | "text" | "arrow" | "circle" | "square" | "drawing";
export type AnnotationTool = "pointer" | "pen" | "text" | "arrow" | "circle" | "square";

export interface Annotation {
  id: string;
  x: number;
  y: number;
  label: string;
  isEditing: boolean;
  viewType: ViewType;
  type?: AnnotationType;
  color?: string;
  path?: Array<{ x: number; y: number }>;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
}

export interface DrawingState {
  isDrawing: boolean;
  currentDrawing: Array<{ x: number; y: number }>;
  drawStartPoint: {
    x: number;
    y: number;
    viewType: ViewType;
  } | null;
}

export interface DragState {
  isDragging: boolean;
  draggedAnnotationId: string | null;
  dragOffset: { x: number; y: number };
}

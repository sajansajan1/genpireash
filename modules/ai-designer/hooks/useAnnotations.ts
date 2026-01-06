/**
 * Custom hook for visual annotations
 */

import { useCallback } from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import { useEditorStore } from '../store/editorStore';
import type { Annotation, ViewType } from '../types';

export function useAnnotations() {
  const {
    annotations,
    selectedAnnotation,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    selectAnnotation,
    clearAnnotations,
    undo,
  } = useAnnotationStore();

  const { isVisualEditMode, selectedTool, drawColor } = useEditorStore();

  const createAnnotation = useCallback(
    (x: number, y: number, viewType: ViewType, label = '') => {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        x,
        y,
        label,
        isEditing: false,
        viewType,
        type: selectedTool === 'pen' ? 'drawing' : 'point',
        color: drawColor,
      };

      addAnnotation(newAnnotation);
      return newAnnotation;
    },
    [selectedTool, drawColor, addAnnotation]
  );

  const handleAnnotationClick = useCallback(
    (e: React.MouseEvent, annotationId: string) => {
      e.stopPropagation();
      selectAnnotation(annotationId);
    },
    [selectAnnotation]
  );

  const handleAnnotationDelete = useCallback(
    (annotationId: string) => {
      removeAnnotation(annotationId);
    },
    [removeAnnotation]
  );

  return {
    annotations,
    selectedAnnotation,
    isVisualEditMode,
    createAnnotation,
    updateAnnotation,
    handleAnnotationClick,
    handleAnnotationDelete,
    clearAnnotations,
    undo,
  };
}

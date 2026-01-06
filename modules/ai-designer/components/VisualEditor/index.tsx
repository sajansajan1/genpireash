/**
 * VisualEditor component for annotations and drawing
 */

import React from 'react';
import type { Annotation, AnnotationTool } from '../../types';

interface VisualEditorProps {
  isActive: boolean;
  selectedTool: AnnotationTool;
  drawColor: string;
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
}

export function VisualEditor({
  isActive,
  selectedTool,
  drawColor,
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
}: VisualEditorProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Annotation layer will be implemented here */}
      <div className="relative w-full h-full">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="absolute"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
            }}
          >
            <div className="bg-red-500 w-2 h-2 rounded-full" />
            {annotation.label && (
              <div className="bg-white px-1 text-xs">{annotation.label}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VisualEditor;

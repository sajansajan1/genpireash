/**
 * Annotation toolbar for AI Micro Edits
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Pen,
  Type,
  ArrowUp,
  Circle,
  Square,
  Palette,
  Undo,
  X,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'pointer' | 'pen' | 'text' | 'arrow' | 'circle' | 'square';

interface AnnotationToolbarProps {
  isVisible: boolean;
  selectedTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  drawColor: string;
  onColorChange: (color: string) => void;
  annotationCount: number;
  onUndo: () => void;
  onCancel: () => void;
  onApply: () => void;
  canUndo: boolean;
  canApply: boolean;
}

const AnnotationToolbarComponent = ({
  isVisible,
  selectedTool,
  onToolSelect,
  drawColor,
  onColorChange,
  annotationCount,
  onUndo,
  onCancel,
  onApply,
  canUndo,
  canApply
}: AnnotationToolbarProps) => {
  if (!isVisible) return null;

  const tools: { type: ToolType; icon: React.ElementType; tooltip: string }[] = [
    { type: 'pointer', icon: Sparkles, tooltip: 'AI Assist' },
    { type: 'pen', icon: Pen, tooltip: 'Draw' },
    { type: 'text', icon: Type, tooltip: 'Add Text' },
    { type: 'arrow', icon: ArrowUp, tooltip: 'Arrow' },
    { type: 'circle', icon: Circle, tooltip: 'Circle' },
    { type: 'square', icon: Square, tooltip: 'Rectangle' }
  ];

  return (
    <div className="fixed bottom-8 inset-x-0 flex justify-center items-center z-50 px-4">
      <div className="flex items-center gap-6">
        {/* Tools Section */}
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200">
          <div className="flex items-center gap-0.5 px-2 py-2">
            {tools.map((tool) => (
              <Button
                key={tool.type}
                variant={selectedTool === tool.type ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolSelect(tool.type)}
                className={cn(
                  'h-10 w-10 rounded-full transition-all',
                  selectedTool === tool.type
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'hover:bg-gray-100'
                )}
                title={tool.tooltip}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-300" />

          {/* Color Picker */}
          <div className="flex items-center gap-2 px-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100"
                title="Pick Color"
              >
                <Palette className="h-4 w-4" />
              </Button>
              <input
                type="color"
                value={drawColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
              />
            </div>
            <div
              className="w-7 h-7 rounded-full border-2 border-gray-400 shadow-inner"
              style={{ backgroundColor: drawColor }}
            />
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-300" />

          {/* Undo */}
          <div className="px-2 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              className="h-10 w-10 rounded-full hover:bg-gray-100 disabled:opacity-30"
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Edit Count & Actions */}
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200">
          <div className="flex items-center">
            {/* Edit count */}
            <div className="px-4 py-3">
              <span className="text-sm font-medium text-gray-700">
                {annotationCount} edit{annotationCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Cancel button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-10 rounded-full hover:bg-red-50 hover:text-red-600 px-5 mr-2"
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>

            {/* Apply button */}
            <Button
              onClick={onApply}
              disabled={!canApply}
              size="sm"
              className={cn(
                "h-10 bg-gradient-to-r from-green-600 to-emerald-600",
                "hover:from-green-700 hover:to-emerald-700",
                "text-white rounded-full shadow-md",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "px-6 mr-2"
              )}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply Edits
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnnotationToolbar = React.memo(AnnotationToolbarComponent);
export default AnnotationToolbar;

/**
 * Editable Analysis Field Component
 * Allows inline editing of analysis data with validation
 */

import React, { useState } from 'react';
import { Check, X, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EditableAnalysisFieldProps {
  label: string;
  value: string | number;
  onSave: (newValue: string) => Promise<void>;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function EditableAnalysisField({
  label,
  value,
  onSave,
  type = 'text',
  placeholder,
  className,
  editable = true,
}: EditableAnalysisFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (editValue === String(value)) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className={cn('group flex items-center justify-between gap-2', className)}>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
          <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </div>
        </div>
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="text-[10px] text-gray-500 dark:text-gray-400">{label}</div>
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-7 text-xs"
          autoFocus
          disabled={isSaving}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-[10px] text-red-600">{error}</p>
      )}
    </div>
  );
}

/**
 * Editable Material Component
 * For editing material data with multiple fields
 */
interface EditableMaterialProps {
  material: {
    material_type: string;
    confidence: number;
    properties?: string[];
  };
  onSave: (updatedMaterial: any) => Promise<void>;
  editable?: boolean;
}

export function EditableMaterial({
  material,
  onSave,
  editable = true,
}: EditableMaterialProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="group relative">
        <div className="flex items-start justify-between mb-1">
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {material.material_type}
          </span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px]">
              {Math.round(material.confidence * 100)}%
            </Badge>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {material.properties && material.properties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {material.properties.map((prop, propIdx) => (
              <Badge key={propIdx} variant="secondary" className="text-[10px]">
                {prop}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // TODO: Add inline editing form for material
  return (
    <div className="p-2 border border-gray-300 rounded-md">
      <p className="text-xs text-gray-600 mb-2">Editing: {material.material_type}</p>
      <Button size="sm" onClick={() => setIsEditing(false)}>
        Close
      </Button>
    </div>
  );
}

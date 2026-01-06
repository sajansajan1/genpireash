/**
 * EditFieldModal Component
 *
 * AI-assisted field editing modal with:
 * - Field selection from dropdown
 * - AI edit prompt input
 * - Current value display
 * - Loading states
 * - Success/error feedback
 * - Credit cost display (1 credit per edit)
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wand2, Loader2, AlertCircle, Info } from 'lucide-react';
import type { BaseViewData } from '../../store/techPackV2Store';

interface EditFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseView: BaseViewData | null;
  onEditField: (revisionId: string, fieldPath: string, editPrompt: string) => Promise<void>;
}

interface FieldOption {
  label: string;
  value: string;
  description: string;
  currentValue?: any;
}

export function EditFieldModal({
  isOpen,
  onClose,
  baseView,
  onEditField,
}: EditFieldModalProps) {
  const [selectedField, setSelectedField] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract field options from analysis data
  const fieldOptions: FieldOption[] = React.useMemo(() => {
    if (!baseView?.analysisData) return [];

    const options: FieldOption[] = [];
    const data = baseView.analysisData;

    // Materials
    if (data.materials_detected && Array.isArray(data.materials_detected)) {
      data.materials_detected.forEach((material: any, idx: number) => {
        options.push({
          label: `Material #${idx + 1}: ${material.material_type || 'Unknown'}`,
          value: `materials_detected.${idx}.material_type`,
          description: 'Edit the material type',
          currentValue: material.material_type,
        });

        if (material.properties) {
          options.push({
            label: `Material #${idx + 1} Properties`,
            value: `materials_detected.${idx}.properties`,
            description: 'Edit material properties',
            currentValue: Array.isArray(material.properties)
              ? material.properties.join(', ')
              : material.properties,
          });
        }
      });
    }

    // Colors
    if (data.colors_identified && Array.isArray(data.colors_identified)) {
      data.colors_identified.forEach((color: any, idx: number) => {
        options.push({
          label: `Color #${idx + 1}: ${color.name || 'Unknown'}`,
          value: `colors_identified.${idx}.name`,
          description: 'Edit the color name',
          currentValue: color.name,
        });

        if (color.location) {
          options.push({
            label: `Color #${idx + 1} Location`,
            value: `colors_identified.${idx}.location`,
            description: 'Edit where this color appears',
            currentValue: color.location,
          });
        }
      });
    }

    // Construction Details
    if (data.construction_details && Array.isArray(data.construction_details)) {
      data.construction_details.forEach((detail: any, idx: number) => {
        options.push({
          label: `Construction #${idx + 1}: ${detail.feature || 'Unknown'}`,
          value: `construction_details.${idx}.feature`,
          description: 'Edit the construction feature name',
          currentValue: detail.feature,
        });

        if (detail.description) {
          options.push({
            label: `Construction #${idx + 1} Description`,
            value: `construction_details.${idx}.description`,
            description: 'Edit the construction description',
            currentValue: detail.description,
          });
        }
      });
    }

    // Key Features
    if (data.key_features && Array.isArray(data.key_features)) {
      data.key_features.forEach((feature: string, idx: number) => {
        options.push({
          label: `Key Feature #${idx + 1}`,
          value: `key_features.${idx}`,
          description: 'Edit this key feature',
          currentValue: feature,
        });
      });
    }

    return options;
  }, [baseView]);

  // Get current value for selected field
  const selectedFieldData = fieldOptions.find((f) => f.value === selectedField);

  const handleSubmit = async () => {
    if (!baseView || !selectedField || !editPrompt.trim()) {
      setError('Please select a field and provide an edit instruction');
      return;
    }

    setIsEditing(true);
    setError(null);

    try {
      await onEditField(baseView.revisionId, selectedField, editPrompt.trim());

      // Success - close modal
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit field');
    } finally {
      setIsEditing(false);
    }
  };

  const handleClose = () => {
    setSelectedField('');
    setEditPrompt('');
    setError(null);
    onClose();
  };

  if (!baseView) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wand2 className="h-4 w-4 text-[#1C1917]" />
            AI-Assisted Field Edit
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select a field to edit and describe how you want to change it. AI will update the field
            intelligently while maintaining context.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Credit Cost Alert */}
          <Alert className="bg-gray-50 border-gray-200">
            <Info className="h-4 w-4 text-[#1C1917]" />
            <AlertDescription className="text-xs text-gray-900">
              Each field edit costs <strong>1 credit</strong>. Changes are applied instantly and
              saved automatically.
            </AlertDescription>
          </Alert>

          {/* View Information */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">Editing:</span>
            <Badge variant="outline" className="capitalize text-[10px]">
              {baseView.viewType.replace('-', ' ')} View
            </Badge>
          </div>

          {/* Field Selection */}
          <div className="space-y-2">
            <Label htmlFor="field-select" className="text-xs">Select Field to Edit</Label>
            <Select value={selectedField} onValueChange={setSelectedField} disabled={isEditing}>
              <SelectTrigger id="field-select" className="text-xs">
                <SelectValue placeholder="Choose a field..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {fieldOptions.length === 0 ? (
                  <div className="p-4 text-xs text-gray-500 text-center">
                    No editable fields found in this view
                  </div>
                ) : (
                  fieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{option.label}</span>
                        <span className="text-[10px] text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Current Value Display */}
          {selectedFieldData && (
            <div className="space-y-2">
              <Label className="text-xs">Current Value</Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {selectedFieldData.currentValue || <em className="text-gray-400">Empty</em>}
                </p>
              </div>
            </div>
          )}

          {/* Edit Prompt */}
          <div className="space-y-2">
            <Label htmlFor="edit-prompt" className="text-xs">How should this be changed?</Label>
            <Textarea
              id="edit-prompt"
              placeholder="Example: Change from 'Cotton' to 'Organic Cotton' or 'Make this more detailed and professional'"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              disabled={isEditing || !selectedField}
              rows={4}
              className="resize-none text-xs"
            />
            <p className="text-[10px] text-gray-500">
              Be specific about the changes you want. The AI will understand your intent and update
              the field accordingly.
            </p>
          </div>

          {/* Example Prompts */}
          {selectedField && !editPrompt && (
            <div className="space-y-2">
              <Label className="text-[10px] text-gray-600">Example prompts:</Label>
              <div className="space-y-1">
                {[
                  'Change to organic cotton',
                  'Make this more detailed and technical',
                  'Update color to navy blue',
                  'Add more specific measurements',
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setEditPrompt(example)}
                    className="block w-full text-left px-2 py-1.5 text-[10px] bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded transition-colors"
                    disabled={isEditing}
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isEditing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isEditing || !selectedField || !editPrompt.trim()}
          >
            {isEditing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Editing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Edit Field (1 credit)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

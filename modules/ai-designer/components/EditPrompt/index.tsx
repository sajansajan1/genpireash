/**
 * EditPrompt component for entering design modifications
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2 } from 'lucide-react';

interface EditPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  placeholder?: string;
}

export function EditPrompt({
  value,
  onChange,
  onSubmit,
  isProcessing,
  placeholder = "Describe what you want to change...",
}: EditPromptProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 resize-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
        rows={2}
        disabled={isProcessing}
      />
      <div className="flex items-center">
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || isProcessing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          size="default"
        >
          <Wand2 className="h-5 w-5 mr-2" />
          {isProcessing ? 'Processing...' : 'Apply Changes'}
        </Button>
      </div>
    </div>
  );
}

export default EditPrompt;

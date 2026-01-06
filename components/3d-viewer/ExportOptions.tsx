'use client';

import { Button } from '@/components/ui/button';
import { Download, FileCode, Box, Printer, FileType } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  modelUrl: string;
  techPackName: string;
}

const exportFormats = [
  {
    format: 'glb',
    label: 'GLB',
    description: 'Web 3D',
    icon: Box,
    category: '3D',
  },
  {
    format: 'dxf',
    label: 'DXF',
    description: 'AutoCAD Exchange',
    icon: FileCode,
    category: 'AutoCAD',
  },
  {
    format: 'step',
    label: 'STEP',
    description: 'CAD Standard',
    icon: FileCode,
    category: 'AutoCAD',
  },
  {
    format: 'obj',
    label: 'OBJ',
    description: '3D Mesh',
    icon: Box,
    category: '3D',
  },
  {
    format: 'stl',
    label: 'STL',
    description: '3D Printing',
    icon: Printer,
    category: '3D Print',
  },
  {
    format: 'fbx',
    label: 'FBX',
    description: 'Autodesk Format',
    icon: FileType,
    category: '3D',
  },
];

export function ExportOptions({ modelUrl, techPackName }: ExportOptionsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setExporting(format);

    try {
      // For GLB, directly download the model
      if (format === 'glb') {
        const link = document.createElement('a');
        link.href = modelUrl;
        link.download = `${techPackName}.glb`;
        link.click();

        toast({
          title: 'Download Started',
          description: `${format.toUpperCase()} file is downloading...`,
        });

        setExporting(null);
        return;
      }

      // For other formats, use conversion API
      const response = await fetch('/api/convert-to-cad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelUrl,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const { download_url } = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = download_url;
      link.download = `${techPackName}.${format}`;
      link.click();

      toast({
        title: 'Export Successful',
        description: `${format.toUpperCase()} file downloaded successfully!`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: `Failed to export ${format.toUpperCase()} file. Please try again.`,
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download 3D Model
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Choose a format to download your 3D model. AutoCAD formats are ready for manufacturing.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {exportFormats.map((item) => {
          const Icon = item.icon;
          const isExporting = exporting === item.format;
          const isGLB = item.format === 'glb';
          const isDisabled = !isGLB || !!exporting;

          return (
            <Button
              key={item.format}
              variant="outline"
              onClick={() => handleExport(item.format)}
              disabled={isDisabled}
              className={`flex flex-col items-center gap-2 h-auto py-4 transition-all ${
                isGLB
                  ? 'hover:border-[rgb(24,24,27)] hover:bg-gray-50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${isExporting ? 'animate-pulse' : ''} ${!isGLB ? 'text-gray-400' : ''}`} />
              <div className="text-center">
                <div className={`font-medium text-sm ${!isGLB ? 'text-gray-400' : ''}`}>{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              {isExporting && (
                <div className="text-xs text-[rgb(24,24,27)] animate-pulse">Exporting...</div>
              )}
              {!isGLB && (
                <div className="text-xs text-gray-400 font-medium">Coming Soon</div>
              )}
            </Button>
          );
        })}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-700">
          <strong>Tip:</strong> Use DXF or STEP for AutoCAD. Use STL for 3D printing. Use GLB/OBJ for 3D software.
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import {
    Pencil,
    Eraser,
    Square,
    Circle,
    MousePointer2,
    Trash2,
    Undo,
    Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tool } from '../types/Toolbar.types';
import { cn } from '@/lib/utils';

interface ToolbarProps {
    onToolSelect: (tool: Tool) => void;
    onUndo: () => void;
    onColorChange: (color: string) => void;
    selectedColor: string;
    selectedTool: Tool;
}

export const Toolbar = ({
    onToolSelect,
    onUndo,
    onColorChange,
    selectedColor,
    selectedTool
}: ToolbarProps) => {
    const tools: { name: string; tool: Tool; icon: React.ReactNode }[] = [
        { name: 'Select', tool: 'select', icon: <MousePointer2 className="h-4 w-4" /> },
        { name: 'Pencil', tool: 'pencil', icon: <Pencil className="h-4 w-4" /> },
        { name: 'Rectangle', tool: 'rectangle', icon: <Square className="h-4 w-4" /> },
        { name: 'Circle', tool: 'circle', icon: <Circle className="h-4 w-4" /> },
        { name: 'Eraser', tool: 'eraser', icon: <Eraser className="h-4 w-4" /> },
    ];

    const colors = [
        '#000000', // Black
        '#EF4444', // Red
        '#22C55E', // Green
        '#3B82F6', // Blue
        '#EAB308', // Yellow
        '#A855F7', // Purple
    ];

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Main Toolbar */}
            <div className="flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/90">
                <TooltipProvider>
                    {tools.map(({ name, tool, icon }) => (
                        <Tooltip key={tool}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onToolSelect(tool)}
                                    className={cn(
                                        "h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                                        selectedTool === tool && "bg-slate-100 dark:bg-slate-800 text-primary ring-2 ring-primary/20"
                                    )}
                                >
                                    {icon}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onUndo}
                                className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Undo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onToolSelect('clear')}
                                className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear Canvas</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/90">
                {colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => onColorChange(color)}
                        className={cn(
                            "w-6 h-6 rounded-full border border-slate-200 transition-all hover:scale-110",
                            selectedColor === color && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                ))}
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden hover:scale-110 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-80" />
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => onColorChange(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        title="Custom Color"
                    />
                </div>
            </div>
        </div>
    );
};
'use client';

import React, { useState } from 'react';
import { Toolbar } from './Toolbar';
import { useCanvas } from '../hooks/useCanvas';
import { useToolHandlers } from '../hooks/useToolHandlers';
import { Tool } from '../types/Toolbar.types';
import { Button } from '@/components/ui/button';
import { Check, X, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { FabricImage } from "fabric";

interface WhiteboardProps {
    onSave?: (imageData: string) => void;
    onClose?: () => void;
    initialImage?: string;
}

export const Whiteboard = ({ onSave, onClose, initialImage }: WhiteboardProps) => {
    const { canvasRef, fabricCanvas } = useCanvas();
    const [selectedTool, setSelectedTool] = useState<Tool>('pencil');
    const [selectedColor, setSelectedColor] = useState<string>('#000000');
    const [isSaving, setIsSaving] = useState(false);
    const fabricRef = React.useRef<any>(null);

    React.useEffect(() => {
        import("fabric").then((mod) => {
            fabricRef.current = mod;
        });
    }, []);

    React.useEffect(() => {
        if (!fabricCanvas || !canvasRef.current) return;

        const resizeCanvas = () => {
            if (!canvasRef.current || !fabricRef.current) return;
            const parent = canvasRef.current.parentElement;
            if (!parent) return;

            const width = parent.clientWidth;
            const height = parent.clientHeight;

            fabricCanvas.setDimensions({
                width: width,
                height: height,
            });

            // Zoom to fit content
            const objects = fabricCanvas.getObjects();
            if (objects.length > 0) {
                const group = new fabricRef.current.Group(objects);
                const contentWidth = group.width || 1;
                const contentHeight = group.height || 1;
                const scaleX = (width * 0.9) / contentWidth;
                const scaleY = (height * 0.9) / contentHeight;
                const zoom = Math.min(scaleX, scaleY, 1);

                fabricCanvas.setZoom(zoom);

                // Center content
                const vpt = fabricCanvas.viewportTransform;
                if (vpt) {
                    vpt[4] = (width - contentWidth * zoom) / 2;
                    vpt[5] = (height - contentHeight * zoom) / 2;
                    fabricCanvas.requestRenderAll();
                }

                group.destroy();
            } else {
                fabricCanvas.setZoom(1);
                const vpt = fabricCanvas.viewportTransform;
                if (vpt) {
                    vpt[4] = 0;
                    vpt[5] = 0;
                    fabricCanvas.requestRenderAll();
                }
            }
            fabricCanvas.renderAll();
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        return () => window.removeEventListener("resize", resizeCanvas);
    }, [fabricCanvas]);


    React.useEffect(() => {
        if (!fabricCanvas || !initialImage) return;

        FabricImage.fromURL(initialImage).then((img) => {
            const w = fabricCanvas.getWidth();
            const h = fabricCanvas.getHeight();

            img.set({
                selectable: true,
                evented: true,
            });

            // Scale proportionally to fit canvas
            img.scaleToWidth(w);
            img.scaleToHeight(h);

            fabricCanvas.clear();
            fabricCanvas.add(img);
            fabricCanvas.sendObjectToBack(img);
            fabricCanvas.renderAll();
        }).catch((err) => {
            console.error("Error loading initial image:", err);
            toast({
                title: "Error",
                description: "Failed to load existing sketch.",
                variant: "destructive"
            });
        });
    }, [fabricCanvas, initialImage]);



    // Handle clear tool separately
    const handleToolSelect = (tool: Tool) => {
        if (tool === 'clear') {
            if (fabricCanvas) {
                fabricCanvas.clear();
                fabricCanvas.backgroundColor = '#fff'; // Restore background color after clear
                fabricCanvas.renderAll();
            }
        } else {
            setSelectedTool(tool);
        }
    };

    const handleUndo = () => {
        if (fabricCanvas) {
            const objects = fabricCanvas.getObjects();
            if (objects.length > 0) {
                fabricCanvas.remove(objects[objects.length - 1]);
                fabricCanvas.renderAll();
            }
        }
    };

    const handleSave = () => {
        if (!fabricCanvas) return;
        setIsSaving(true);
        try {
            // Get data URL from canvas
            const dataUrl = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2 // Higher resolution
            });

            if (onSave) {
                onSave(dataUrl);
            }
        } catch (error) {
            console.error("Error saving whiteboard:", error);
            toast({
                title: "Error",
                description: "Failed to save sketch.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    useToolHandlers(fabricCanvas, selectedTool, selectedColor);

    return (
        <div className="relative w-full h-full flex flex-col bg-white">
            {/* Toolbar - Floating at Top */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <Toolbar
                        onToolSelect={handleToolSelect}
                        onUndo={handleUndo}
                        onColorChange={setSelectedColor}
                        selectedColor={selectedColor}
                        selectedTool={selectedTool}
                    />
                </div>
            </div>

            {/* Action Buttons - Bottom Right */}
            <div className="absolute bottom-9 right-28 z-20 flex gap-2">
                {onClose && (
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm rounded-full hover:bg-slate-100 text-slate-600"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                )}
                {onSave && (
                    <Button
                        onClick={handleSave}
                        variant="default"
                        className="rounded-full shadow-md"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                            <Check className="h-4 w-4 mr-2" />
                        )}
                        Save Sketch
                    </Button>
                )}
            </div>

            {/* Canvas Container */}
            <div className="flex-1 w-full h-full relative">
                <canvas ref={canvasRef} className="block w-full h-full" />
            </div>
        </div>
    );
};
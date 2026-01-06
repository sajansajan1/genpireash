import { useCallback, useEffect, useRef } from 'react';
import { Canvas, Circle, Rect, PencilBrush } from 'fabric';
import { Tool } from '../types/Toolbar.types';
import { ExtendedFabricObject } from '../types/global.types';
import { generateId } from '../utitls/Whiteboard.utils';

export const useToolHandlers = (
    canvas: Canvas | null,
    selectedTool: Tool,
    selectedColor: string
) => {
    const isDrawing = useRef(false);
    const startPoint = useRef<{ x: number; y: number } | null>(null);
    const activeObject = useRef<ExtendedFabricObject | null>(null);

    const handleMouseDown = useCallback(
        (e: any) => {
            if (!canvas || selectedTool === 'select' || selectedTool === 'clear') return;

            isDrawing.current = true;
            const pointer = canvas.getPointer(e.e);
            startPoint.current = { x: pointer.x, y: pointer.y };

            if (selectedTool === 'rectangle') {
                const rect = new Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: selectedColor,
                    strokeWidth: 2,
                    selectable: false,
                }) as unknown as ExtendedFabricObject;

                rect.id = generateId();
                canvas.add(rect);
                activeObject.current = rect;
            } else if (selectedTool === 'circle') {
                const circle = new Circle({
                    left: pointer.x,
                    top: pointer.y,
                    radius: 0,
                    fill: 'transparent',
                    stroke: selectedColor,
                    strokeWidth: 2,
                    selectable: false,
                }) as unknown as ExtendedFabricObject;

                circle.id = generateId();
                canvas.add(circle);
                activeObject.current = circle;
            }
        },
        [canvas, selectedTool, selectedColor]
    );

    const handleMouseMove = useCallback(
        (e: any) => {
            if (!isDrawing.current || !canvas || !activeObject.current || !startPoint.current) return;

            const pointer = canvas.getPointer(e.e);

            if (selectedTool === 'rectangle') {
                const rect = activeObject.current as unknown as Rect;
                const width = Math.abs(pointer.x - startPoint.current.x);
                const height = Math.abs(pointer.y - startPoint.current.y);

                if (startPoint.current.x > pointer.x) {
                    rect.set({ left: pointer.x });
                }
                if (startPoint.current.y > pointer.y) {
                    rect.set({ top: pointer.y });
                }

                rect.set({ width, height });
            } else if (selectedTool === 'circle') {
                const circle = activeObject.current as unknown as Circle;
                const radius = Math.abs(pointer.x - startPoint.current.x) / 2;

                if (startPoint.current.x > pointer.x) {
                    circle.set({ left: pointer.x });
                }
                if (startPoint.current.y > pointer.y) {
                    circle.set({ top: pointer.y });
                }

                circle.set({ radius });
            }

            canvas.renderAll();
        },
        [canvas, selectedTool]
    );

    const handleMouseUp = useCallback(() => {
        isDrawing.current = false;
        startPoint.current = null;

        if (activeObject.current) {
            activeObject.current.setCoords();
            activeObject.current = null;
        }

        if (canvas) {
            canvas.renderAll();
        }
    }, [canvas]);

    useEffect(() => {
        if (!canvas) return;

        // Set drawing mode for pencil and eraser
        canvas.isDrawingMode = selectedTool === 'pencil' || selectedTool === 'eraser';

        if (selectedTool === 'pencil' || selectedTool === 'eraser') {
            if (!canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
            }
            const brush = canvas.freeDrawingBrush;
            if (brush) {
                if (selectedTool === 'eraser') {
                    brush.width = 20; // Eraser width
                    brush.color = '#ffffff'; // White color for eraser (assuming white background)
                } else {
                    brush.width = 5;
                    brush.color = selectedColor;
                }
            }
        }

        // Make objects selectable only in select mode
        canvas.getObjects().forEach((obj) => {
            obj.selectable = selectedTool === 'select';
        });

        // Add event listeners
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
        };
    }, [canvas, selectedTool, selectedColor, handleMouseDown, handleMouseMove, handleMouseUp]);
};
import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricObject } from 'fabric';
import { ExtendedFabricObject } from '../types/global.types';
import { generateId } from '../utitls/Whiteboard.utils';

export const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
    useEffect(() => {
        const init = () => {
            //If canvasRef is not attached yet, it exits early checking it attached or not to pass the canvas to fabric
            const canvasEl = canvasRef.current;
            if (!canvasEl) return;

            // extended FabricObject to include id in serialization to give id to every obj created
            FabricObject.prototype.toObject = (function (toObject) {
                return function (this: FabricObject, properties: string[] = []) {
                    return toObject.call(this, [...properties, 'id']);
                };
            })(FabricObject.prototype.toObject);

            // Create Fabric Canvas
            const canvas = new Canvas(canvasEl, {
                backgroundColor: '#fff',
            });
            canvas.setDimensions({
                width: window.innerWidth,
                height: window.innerHeight - 80,
            });
            canvas.renderAll();
            // add unique IDs to objects when they're created
            canvas.on('object:added', (e: { target: ExtendedFabricObject }) => {
                if (!e.target) return;
                if (!e.target.id) {
                    e.target.id = generateId();
                }
            });

            // save canvas state
            setFabricCanvas(canvas);

            // Updates canvas size when the window is resized.
            const resize = () => {
                canvas.setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight - 80,
                });
                canvas.renderAll();
            };

            // deletes the currently selected object for(  Delete or Backspace is pressed)
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    const active = canvas.getActiveObject();
                    if (active) {
                        canvas.remove(active);
                        canvas.renderAll();
                    }
                }
            };

            // Listeners for window resize and keyboard events.
            window.addEventListener('resize', resize);
            window.addEventListener('keydown', handleKeyDown);

            // Clears state.
            return () => {
                window.removeEventListener('resize', resize);
                window.removeEventListener('keydown', handleKeyDown);
                // Remove canvas event listeners
                canvas.off('object:added');
                if (canvas) {
                    canvas.dispose();
                    setFabricCanvas(null);
                }
            };
        };
        const cleanup = init();
        return cleanup;
    }, []);
    return { canvasRef, fabricCanvas };
};
/**
 * Custom hook for viewport controls (zoom, pan)
 */

import { useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { EDITOR_DEFAULTS } from '../constants';

export function useViewportControls() {
  const { viewport, setViewport, resetViewport } = useEditorStore();

  const handleZoom = useCallback(
    (delta: number) => {
      const newZoom = Math.min(
        Math.max(viewport.zoomLevel + delta, EDITOR_DEFAULTS.ZOOM_MIN),
        EDITOR_DEFAULTS.ZOOM_MAX
      );
      setViewport({ zoomLevel: newZoom });
    },
    [viewport.zoomLevel, setViewport]
  );

  const handlePan = useCallback(
    (deltaX: number, deltaY: number) => {
      setViewport({
        viewPosition: {
          x: viewport.viewPosition.x + deltaX,
          y: viewport.viewPosition.y + deltaY,
        },
      });
    },
    [viewport.viewPosition, setViewport]
  );

  // Handle mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -EDITOR_DEFAULTS.ZOOM_STEP : EDITOR_DEFAULTS.ZOOM_STEP;
        handleZoom(delta);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleZoom]);

  return {
    zoomLevel: viewport.zoomLevel,
    viewPosition: viewport.viewPosition,
    isDragging: viewport.isDragging,
    handleZoom,
    handlePan,
    resetViewport,
  };
}

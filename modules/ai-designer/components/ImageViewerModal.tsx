/**
 * Global Image Viewer Modal
 * Can be opened from anywhere using useImageViewerStore
 * Supports multiple editing tools: text, arrow, eraser
 * Generic component - all save logic is passed via onSave callback
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, X, Type, RotateCcw, Download, Save, Loader2, MoveUpRight, Eraser } from 'lucide-react';
import { useImageViewerStore } from '../store/imageViewerStore';
import { addTextInRect, addArrowToImage, eraseOnImage } from '../utils/canvasTextReplace';
import { TextInputModal } from './TextEditModal';
import { toast } from 'sonner';

export function ImageViewerModal() {
  const {
    isOpen,
    image,
    closeViewer,
    isEditMode,
    currentTool,
    isDragging,
    selectionRect,
    isAddingText,
    arrowStart,
    arrowEnd,
    eraserPath,
    enterEditMode,
    exitEditMode,
    setCurrentTool,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    clearSelection,
    setAddingText,
    clearArrow,
    clearEraserPath,
  } = useImageViewerStore();

  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));

  const handleClose = () => {
    closeViewer();
    setZoomLevel(0.75);
    setEditedImageUrl(null);
  };

  // Get normalized coordinates from mouse or touch event
  const getNormalizedCoords = useCallback((e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    if (!imageRef.current) return null;

    const rect = imageRef.current.getBoundingClientRect();

    // Handle both mouse and touch events
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      // Touch event
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        // For touchend, use changedTouches
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        return null;
      }
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    // Clamp to image bounds
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  }, []);

  // Handle mouse down on image to start drag
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    const coords = getNormalizedCoords(e);
    if (coords) {
      startDrag(coords.x, coords.y);
    }
  }, [isEditMode, getNormalizedCoords, startDrag]);

  // Handle touch start on image to start drag (mobile support)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLImageElement>) => {
    if (!isEditMode) return;

    // Prevent default to avoid scrolling while drawing
    e.preventDefault();
    e.stopPropagation();

    const coords = getNormalizedCoords(e);
    if (coords) {
      startDrag(coords.x, coords.y);
    }
  }, [isEditMode, getNormalizedCoords, startDrag]);

  // Handle mouse/touch move during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getNormalizedCoords(e);
      if (coords) {
        updateDrag(coords.x, coords.y);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const coords = getNormalizedCoords(e);
      if (coords) {
        endDrag(coords.x, coords.y);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const coords = getNormalizedCoords(e);
      if (coords) {
        updateDrag(coords.x, coords.y);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const coords = getNormalizedCoords(e);
      if (coords) {
        endDrag(coords.x, coords.y);
      }
    };

    // Mouse events
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // Touch events
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, getNormalizedCoords, updateDrag, endDrag]);

  // Handle saving text in the selected rectangle
  const handleSaveText = useCallback(async (text: string) => {
    if (!selectionRect || !image?.url) return;

    setAddingText(true);

    try {
      const currentImageUrl = editedImageUrl || image.url;

      // Add text to the image in the selected rectangle
      const newImageUrl = await addTextInRect(
        currentImageUrl,
        selectionRect,
        text,
        {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          padding: 8,
          fontWeight: 'normal',
          textAlign: 'left',
        }
      );

      setEditedImageUrl(newImageUrl);
      clearSelection();

      toast.success('Text added successfully!');

      // Notify parent if callback provided
      if (image.onImageEdited) {
        image.onImageEdited(newImageUrl);
      }
    } catch (error) {
      console.error('Add text error:', error);
      toast.error('Failed to add text. Please try again.');
    } finally {
      setAddingText(false);
    }
  }, [selectionRect, image, editedImageUrl, clearSelection, setAddingText]);

  // Handle canceling text input
  const handleCancelTextInput = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Handle applying arrow to image
  const handleApplyArrow = useCallback(async () => {
    if (!arrowStart || !arrowEnd || !image?.url) return;

    try {
      const currentImageUrl = editedImageUrl || image.url;

      const newImageUrl = await addArrowToImage(
        currentImageUrl,
        arrowStart,
        arrowEnd,
        {
          color: '#000000',
          lineWidth: 3,
          headSize: 15,
        }
      );

      setEditedImageUrl(newImageUrl);
      clearArrow();

      toast.success('Arrow added!');

      if (image.onImageEdited) {
        image.onImageEdited(newImageUrl);
      }
    } catch (error) {
      console.error('Add arrow error:', error);
      toast.error('Failed to add arrow. Please try again.');
      clearArrow();
    }
  }, [arrowStart, arrowEnd, image, editedImageUrl, clearArrow]);

  // Handle applying eraser to image
  const handleApplyEraser = useCallback(async () => {
    if (eraserPath.length === 0 || !image?.url) return;

    try {
      const currentImageUrl = editedImageUrl || image.url;

      const newImageUrl = await eraseOnImage(
        currentImageUrl,
        eraserPath,
        {
          brushSize: 20,
          color: '#FFFFFF',
        }
      );

      setEditedImageUrl(newImageUrl);
      clearEraserPath();

      toast.success('Erased!');

      if (image.onImageEdited) {
        image.onImageEdited(newImageUrl);
      }
    } catch (error) {
      console.error('Eraser error:', error);
      toast.error('Failed to erase. Please try again.');
      clearEraserPath();
    }
  }, [eraserPath, image, editedImageUrl, clearEraserPath]);

  // Auto-apply arrow when drag ends and arrow is valid
  useEffect(() => {
    if (!isDragging && arrowStart && arrowEnd && currentTool === 'arrow') {
      handleApplyArrow();
    }
  }, [isDragging, arrowStart, arrowEnd, currentTool, handleApplyArrow]);

  // Auto-apply eraser when drag ends and path exists
  useEffect(() => {
    if (!isDragging && eraserPath.length > 0 && currentTool === 'eraser') {
      handleApplyEraser();
    }
  }, [isDragging, eraserPath.length, currentTool, handleApplyEraser]);

  // Handle resetting to original image
  const handleReset = useCallback(() => {
    setEditedImageUrl(null);
    exitEditMode();
    toast.info('Reset to original image');
  }, [exitEditMode]);

  // Handle downloading the edited image
  const handleDownload = useCallback(() => {
    const imageToDownload = editedImageUrl || image?.url;
    if (!imageToDownload) return;

    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `edited-${image?.title || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [editedImageUrl, image]);

  // Handle saving the edited image via the provided onSave callback
  const handleSave = useCallback(async () => {
    if (!editedImageUrl || !image?.onSave) {
      toast.error('No changes to save');
      return;
    }

    setIsSaving(true);

    try {
      const result = await image.onSave(editedImageUrl);

      if (result.success && result.newImageUrl) {
        toast.success('Image saved successfully!');

        // Notify parent component of the new URL
        if (image.onImageEdited) {
          image.onImageEdited(result.newImageUrl);
        }

        // Update local state to use the new URL
        setEditedImageUrl(null);

        // Close the viewer after successful save
        closeViewer();
      } else {
        toast.error(result.error || 'Failed to save image');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editedImageUrl, image, closeViewer]);

  // Handle escape key to cancel drag or exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDragging) {
          cancelDrag();
        } else if (selectionRect) {
          clearSelection();
        } else if (isEditMode) {
          exitEditMode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDragging, selectionRect, isEditMode, cancelDrag, clearSelection, exitEditMode]);

  if (!isOpen || !image) return null;

  const currentImageUrl = editedImageUrl || image.url;
  const showTextInputModal = selectionRect !== null && !isDragging;

  // Calculate selection overlay position
  const getSelectionStyle = () => {
    if (!selectionRect) return {};

    const left = Math.min(selectionRect.x1, selectionRect.x2) * 100;
    const top = Math.min(selectionRect.y1, selectionRect.y2) * 100;
    const width = Math.abs(selectionRect.x2 - selectionRect.x1) * 100;
    const height = Math.abs(selectionRect.y2 - selectionRect.y1) * 100;

    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`,
    };
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-3 sm:p-4"
        onClick={handleClose}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              {image.title && (
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white line-clamp-1 sm:truncate">
                  {image.title}
                  {editedImageUrl && (
                    <span className="ml-2 text-xs font-normal text-amber-400">(Edited)</span>
                  )}
                </h3>
              )}
              {image.description && (
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">{image.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Edit Tools - Only show if allowed */}
              {image.allowTextEditing && (
                <>
                  {isEditMode ? (
                    <>
                      {/* Tool Selector Buttons */}
                      <div className="flex items-center bg-white/10 rounded-lg p-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                            currentTool === 'text'
                              ? 'bg-white text-black'
                              : 'text-white hover:bg-white/20'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentTool('text');
                          }}
                          title="Text Tool"
                        >
                          <Type className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                            currentTool === 'arrow'
                              ? 'bg-white text-black'
                              : 'text-white hover:bg-white/20'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentTool('arrow');
                          }}
                          title="Arrow Tool"
                        >
                          <MoveUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                            currentTool === 'eraser'
                              ? 'bg-white text-black'
                              : 'text-white hover:bg-white/20'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentTool('eraser');
                          }}
                          title="Eraser Tool"
                        >
                          <Eraser className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                      {/* Reset Button */}
                      {editedImageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          title="Reset to original"
                        >
                          <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white h-7 sm:h-8 md:h-9 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        enterEditMode();
                      }}
                    >
                      <Type className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline text-xs">Edit</span>
                    </Button>
                  )}
                  {/* Save Button - Only show if there are edits and onSave callback is provided */}
                  {editedImageUrl && image.onSave && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-white h-7 sm:h-8 md:h-9 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                      disabled={isSaving}
                      title="Save changes to database"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 animate-spin sm:mr-1.5" />
                      ) : (
                        <Save className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1.5" />
                      )}
                      <span className="hidden sm:inline text-xs">{isSaving ? 'Saving...' : 'Save'}</span>
                    </Button>
                  )}
                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    title="Download image"
                  >
                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <div className="w-px h-6 bg-white/20 mx-1" />
                </>
              )}

              {/* Zoom Controls */}
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Button>

              <span className="text-white text-[10px] sm:text-xs md:text-sm px-0.5 sm:px-1 md:px-2 min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-center font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white h-7 sm:h-8 md:h-9 px-2 sm:ml-2 md:ml-4"
                onClick={handleClose}
              >
                <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1.5 md:mr-2" />
                <span className="hidden sm:inline text-xs md:text-sm">Close</span>
              </Button>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {isEditMode && (
            <div
              className="mb-3 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {currentTool === 'text' && <Type className="h-4 w-4 text-white" />}
              {currentTool === 'arrow' && <MoveUpRight className="h-4 w-4 text-white" />}
              {currentTool === 'eraser' && <Eraser className="h-4 w-4 text-white" />}
              <span className="text-xs text-white">
                {currentTool === 'text' && (
                  isDragging
                    ? 'Release to define text area'
                    : 'Click and drag to define a text area'
                )}
                {currentTool === 'arrow' && (
                  isDragging
                    ? 'Release to place arrow'
                    : 'Click and drag to draw an arrow'
                )}
                {currentTool === 'eraser' && (
                  isDragging
                    ? 'Release to apply eraser'
                    : 'Click and drag to erase (white)'
                )}
              </span>
            </div>
          )}

          {/* Image Container */}
          <div
            ref={containerRef}
            className="flex-1 relative bg-white/5 rounded-lg overflow-auto flex items-center justify-center"
          >
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image with selection overlay */}
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={currentImageUrl}
                  alt={image.title || "Image"}
                  className={`max-w-full max-h-[85vh] object-contain select-none ${
                    isEditMode ? 'cursor-crosshair' : ''
                  }`}
                  style={{ display: 'block', touchAction: isEditMode ? 'none' : 'auto' }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  draggable={false}
                />

                {/* Selection Rectangle Overlay (Text Tool) */}
                {selectionRect && currentTool === 'text' && (
                  <div
                    className="absolute pointer-events-none border-2 border-dashed"
                    style={{
                      ...getSelectionStyle(),
                      borderColor: isDragging ? '#fbbf24' : '#22c55e',
                      backgroundColor: isDragging
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    {!isDragging && (
                      <div className="absolute -top-6 left-0 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                        Click to add text
                      </div>
                    )}
                  </div>
                )}

                {/* Arrow Preview Overlay */}
                {arrowStart && arrowEnd && currentTool === 'arrow' && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill={isDragging ? '#fbbf24' : '#000000'}
                        />
                      </marker>
                    </defs>
                    <line
                      x1={`${arrowStart.x * 100}%`}
                      y1={`${arrowStart.y * 100}%`}
                      x2={`${arrowEnd.x * 100}%`}
                      y2={`${arrowEnd.y * 100}%`}
                      stroke={isDragging ? '#fbbf24' : '#000000'}
                      strokeWidth="3"
                      markerEnd="url(#arrowhead)"
                    />
                  </svg>
                )}

                {/* Eraser Path Preview Overlay */}
                {eraserPath.length > 0 && currentTool === 'eraser' && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <path
                      d={eraserPath.reduce((path, point, index) => {
                        const x = point.x * 100;
                        const y = point.y * 100;
                        return index === 0
                          ? `M ${x}% ${y}%`
                          : `${path} L ${x}% ${y}%`;
                      }, '')}
                      stroke={isDragging ? '#fbbf24' : '#FFFFFF'}
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      opacity={isDragging ? 0.5 : 1}
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Footer (optional) */}
          {image.metadata && Object.keys(image.metadata).length > 0 && !isEditMode && (
            <div
              className="mt-4 bg-black/60 rounded-lg p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(image.metadata).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-400 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-white font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={showTextInputModal}
        onSave={handleSaveText}
        onCancel={handleCancelTextInput}
        isProcessing={isAddingText}
      />
    </>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { Maximize2, MessageSquare, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
    id: string;
    content: string;
    user?: {
        full_name: string;
        avatar_url: string;
    };
    full_name?: string; // For anon
    metadata?: {
        x: number;
        y: number;
        view: string;
    };
}

interface FactorySpecsImageProps {
    src: string;
    alt: string;
    viewId: string; // The ID of the tech file or view name
    comments: Comment[];
    onAddComment?: (text: string, metadata: { x: number; y: number; view: string }) => void;
    onOpenViewer: () => void;
    isCommentMode: boolean;
    className?: string;
    children?: React.ReactNode; // For overlays like badges
}

export function FactorySpecsImage({
    src,
    alt,
    viewId,
    comments,
    onAddComment,
    onOpenViewer,
    isCommentMode,
    className,
    children,
}: FactorySpecsImageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tempMarker, setTempMarker] = useState<{ x: number; y: number } | null>(null);
    const [commentText, setCommentText] = useState("");

    const filteredComments = comments.filter((c) => c.metadata?.view === viewId);

    const handleImageClick = (e: React.MouseEvent) => {
        if (!isCommentMode) {
            onOpenViewer();
            return;
        }

        if (!containerRef.current) return;

        // Prevent adding if clicking on existing marker
        if ((e.target as HTMLElement).closest(".comment-marker")) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setTempMarker({ x, y });
        setCommentText(""); // Reset text
    };

    const handleSubmitComment = () => {
        if (commentText.trim() && tempMarker && onAddComment) {
            onAddComment(commentText, {
                x: tempMarker.x,
                y: tempMarker.y,
                view: viewId,
            });
            setTempMarker(null);
            setCommentText("");
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative group select-none", className)}
            onClick={handleImageClick}
            data-view={viewId} // Helping the scroller
        >
            <img
                src={src}
                alt={alt}
                className={cn(
                    "w-full h-full object-contain transition-all duration-200",
                    isCommentMode ? "cursor-crosshair" : "cursor-pointer"
                )}
            />

            {/* Overlays (Badges etc passed as children) */}
            {children}

            {/* Hover Overlay for View (only provided if not in comment mode) */}
            {!isCommentMode && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Maximize2 className="h-6 w-6 text-white" />
                </div>
            )}

            {/* Existing Comments */}
            {filteredComments.map((comment, index) => (
                <div
                    key={comment.id}
                    className="comment-marker absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${comment.metadata?.x}%`, top: `${comment.metadata?.y}%` }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Could scroll sidebar to this comment?
                    }}
                >
                    <div className="group/marker relative">
                        <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                            {comment.user?.avatar_url ? (
                                <img
                                    src={comment.user.avatar_url}
                                    alt={comment.user.full_name || "User"}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-[10px] font-bold text-white">
                                    {(comment.user?.full_name || comment.full_name || "A")
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute left-full top-0 ml-2 w-48 bg-white text-xs p-2 rounded-lg shadow-xl opacity-0 invisible group-hover/marker:opacity-100 group-hover/marker:visible transition-all z-20 pointer-events-none">
                            <p className="font-semibold mb-1">
                                {comment.user?.full_name || comment.full_name || "Anonymous"}
                            </p>
                            <p className="text-gray-600 line-clamp-3">{comment.content}</p>
                        </div>
                    </div>
                </div>
            ))}

            {/* Temporary Marker (New Comment) */}
            {tempMarker && isCommentMode && (
                <div
                    className="absolute z-20"
                    style={{ left: `${tempMarker.x}%`, top: `${tempMarker.y}%` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/30 animate-pulse" />

                    {/* Input Popover */}
                    <div className="absolute left-6 top-0 w-64 bg-white p-3 rounded-lg shadow-xl border border-border animate-in fade-in zoom-in-95 origin-top-left">
                        <h4 className="text-xs font-semibold mb-2">Add Comment</h4>
                        <div className="flex gap-2">
                            <Input
                                autoFocus
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Type your comment..."
                                className="h-8 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSubmitComment();
                                    if (e.key === "Escape") setTempMarker(null);
                                }}
                            />
                            <Button
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim()}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Press Enter to save</span>
                            <button
                                onClick={() => setTempMarker(null)}
                                className="text-[10px] text-red-500 hover:text-red-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

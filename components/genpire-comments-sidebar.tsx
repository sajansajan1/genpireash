"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Cookie utility functions
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
    return null;
}

function setCookie(name: string, value: string, days: number = 365): void {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

const COMMENTER_NAME_COOKIE = "genpire_commenter_name";

export function GenpireCommentSidebar({
    isOpen,
    onClose,
    product,
    comments,
    newComment,
    setNewComment,
    onPostComment,
    currentUser,
    onCommentClick,
}: {
    isOpen: boolean;
    onClose: () => void;
    product: any | null;
    comments: any[];
    newComment: string;
    setNewComment: (comment: string) => void;
    onPostComment: (fullName?: string) => void;
    currentUser: any | null;
    onCommentClick?: (comment: any) => void;
}) {
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [commenterName, setCommenterName] = useState("");
    const [tempName, setTempName] = useState("");

    // Load saved name from cookie on mount
    useEffect(() => {
        const savedName = getCookie(COMMENTER_NAME_COOKIE);
        if (savedName) {
            setCommenterName(savedName);
        }
    }, []);

    if (!product) return null;

    const handleInputFocus = () => {
        // If user is logged in, don't show name prompt
        if (currentUser) return;

        // If no name saved in cookie, show name prompt
        if (!commenterName) {
            setShowNamePrompt(true);
        }
    };

    const handleSaveName = () => {
        if (!tempName.trim()) return;

        const name = tempName.trim();
        setCommenterName(name);
        setCookie(COMMENTER_NAME_COOKIE, name);
        setShowNamePrompt(false);
        setTempName("");
    };

    const handleChangeName = () => {
        setTempName(commenterName);
        setShowNamePrompt(true);
    };

    const handlePostComment = () => {
        // Pass the commenter name for anonymous users
        if (!currentUser && commenterName) {
            onPostComment(commenterName);
        } else {
            onPostComment();
        }
    };

    const displayName = currentUser?.user_metadata?.full_name || commenterName || "Anonymous";
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />

                        {/* Sidebar Panel */}
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full lg:w-[550px] bg-white shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white p-6 border-b border-stone-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Product Image Thumbnail */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-700 flex-shrink-0">
                                            <img
                                                src={product.image_data?.front?.url || product.imageData?.front?.url || "/placeholder.svg"}
                                                alt={product.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {/* <MessageSquare className="w-5 h-5 text-stone-300" /> */}
                                                <h2 className="text-xl font-bold">Product Comments</h2>
                                            </div>
                                            <p className="text-stone-300 text-sm mt-0.5 line-clamp-2">Leave notes, feedback and questions about this product, you can also pin comments direclty on images or factory files.</p>
                                            <p className="text-stone-300 text-sm mt-0.5 line-clamp-1">{product.product_name}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={onClose}
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/10 rounded-full"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Comments Content Area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="p-4 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full mb-4">
                                            <MessageSquare className="h-8 w-8 text-stone-800" />
                                        </div>
                                        <h4 className="text-base font-semibold text-stone-900 mb-2">No Comments Yet</h4>
                                        <p className="text-xs text-stone-500 max-w-[250px]">
                                            Be the first to share your thoughts on this product.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <motion.div
                                                key={comment.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "flex items-start space-x-3 bg-stone-50 rounded-xl p-4 border border-stone-100 transition-colors",
                                                    onCommentClick && comment.metadata?.view && "cursor-pointer hover:bg-stone-100 hover:border-stone-200"
                                                )}
                                                onClick={() => {
                                                    if (onCommentClick && comment.metadata?.view) {
                                                        onCommentClick(comment);
                                                    }
                                                }}
                                            >
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={comment.user?.avatar_url} />
                                                    <AvatarFallback className="bg-stone-200 text-stone-700">
                                                        {comment.user?.full_name?.charAt(0) || comment?.full_name?.charAt(0) || "A"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="font-semibold text-sm text-stone-900">
                                                            {comment.user?.full_name || comment?.full_name || "Anonymous"}
                                                        </p>
                                                        {comment.metadata?.view && (
                                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full capitalize">
                                                                {(() => {
                                                                    const viewId = comment.metadata.view;
                                                                    const standardViews = ["front", "back", "side", "top", "bottom"];
                                                                    if (standardViews.includes(viewId)) return `${viewId} View`;

                                                                    if (product?.techFilesData) {
                                                                        const { baseViews, components, closeups, sketches, flatSketches, assemblyView } = product.techFilesData;
                                                                        const find = (arr: any[]) => arr?.find((f: any) => f.id === viewId);

                                                                        let f = find(baseViews);
                                                                        if (f) return `${f.view_type?.replace(/_/g, " ") || "Base"} View`;

                                                                        f = find(components);
                                                                        if (f) return f.file_category || f.analysis_data?.component_name || "Component";

                                                                        f = find(closeups);
                                                                        if (f) return f.file_category || "Close-Up";

                                                                        f = find(sketches);
                                                                        if (f) return `${f.view_type?.replace(/_/g, " ") || "Sketch"} View`;

                                                                        f = find(flatSketches);
                                                                        if (f) return `${f.view_type?.replace(/_/g, " ") || "Flat Sketch"} View`;

                                                                        if (assemblyView?.id === viewId) return "Assembly View";
                                                                    }

                                                                    return "Factory Spec"; // Fallback
                                                                })()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-stone-600 text-sm mt-1 leading-relaxed">{comment.content}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Comment Input Area - Fixed at Bottom */}
                            <div className="p-4 bg-white border-t border-stone-200">
                                <div className="flex items-start space-x-3">
                                    <Avatar className="w-10 h-10 flex-shrink-0">
                                        <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-stone-800 text-white">{displayInitial}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        {/* Show name badge that can be clicked to change */}
                                        {!currentUser && commenterName && (
                                            <button
                                                onClick={handleChangeName}
                                                className="mb-2 text-xs text-stone-500 hover:text-stone-700 hover:underline cursor-pointer"
                                            >
                                                Commenting as <span className="font-semibold text-stone-700">{commenterName}</span> (click to
                                                change)
                                            </button>
                                        )}
                                        <div className="relative">
                                            <Textarea
                                                placeholder={
                                                    !currentUser && !commenterName
                                                        ? "Click to enter your name and start commenting..."
                                                        : "Write a comment..."
                                                }
                                                className="w-full border-stone-300 rounded-xl resize-none min-h-[80px] pr-20 focus:ring-stone-400 focus:border-stone-400"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onFocus={handleInputFocus}
                                            />
                                            <Button
                                                type="button"
                                                className="absolute right-2 bottom-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-medium text-sm px-4 py-2 h-auto"
                                                onClick={handlePostComment}
                                                disabled={!newComment.trim() || (!currentUser && !commenterName)}
                                            >
                                                Post
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Name Prompt Dialog */}
            <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>What's your name?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your name will be displayed with your comments</Label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSaveName();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNamePrompt(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveName} disabled={!tempName.trim()}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Also export as GenpireCommentModal for backward compatibility
export const GenpireCommentModal = GenpireCommentSidebar;

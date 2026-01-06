/**
 * RevisionDetailModal component for displaying detailed revision information
 */

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Layers, Eye, Info, Hash, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MultiViewRevision } from '../../types';

interface RevisionDetailModalProps {
  revision: MultiViewRevision | null;
  isOpen: boolean;
  onClose: () => void;
  onRollback: (revision: MultiViewRevision) => void;
  formatContent: (content: string) => string;
}

export function RevisionDetailModal({
  revision,
  isOpen,
  onClose,
  onRollback,
  formatContent,
}: RevisionDetailModalProps) {
  if (!revision) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl h-[80vh] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Layers className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Revision Details
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {revision.editType === 'initial' ? 'Original Design' : 'AI Generated Design'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="px-6 py-4 space-y-5">
                  {/* Preview Images */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      Design Views
                    </h4>
                    {/* First row: Front, Back, Side */}
                    <div className="grid grid-cols-3 gap-3">
                      {revision.views ? (
                        <>
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600 text-center">Front View</div>
                            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {revision.views.front?.imageUrl ? (
                                <img
                                  src={revision.views.front.imageUrl}
                                  alt="Front view"
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                  <span className="text-sm font-medium">FRONT</span>
                                  <span className="text-xs mt-1">Not generated</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600 text-center">Back View</div>
                            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {revision.views.back?.imageUrl ? (
                                <img
                                  src={revision.views.back.imageUrl}
                                  alt="Back view"
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                  <span className="text-sm font-medium">BACK</span>
                                  <span className="text-xs mt-1">Not generated</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600 text-center">Side View</div>
                            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {revision.views.side?.imageUrl ? (
                                <img
                                  src={revision.views.side.imageUrl}
                                  alt="Side view"
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                  <span className="text-sm font-medium">SIDE</span>
                                  <span className="text-xs mt-1">Not generated</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-3 py-8 text-center text-gray-400">
                          No preview images available
                        </div>
                      )}
                    </div>

                    {/* Second row: Top and Bottom views */}
                    {revision.views && (revision.views.top?.imageUrl || revision.views.bottom?.imageUrl) && (
                      <div className="grid grid-cols-2 gap-3 mt-3 max-w-md mx-auto">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 text-center">Top View</div>
                          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {revision.views.top?.imageUrl ? (
                              <img
                                src={revision.views.top.imageUrl}
                                alt="Top view"
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="text-sm font-medium">TOP</span>
                                <span className="text-xs mt-1">Not generated</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 text-center">Bottom View</div>
                          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {revision.views.bottom?.imageUrl ? (
                              <img
                                src={revision.views.bottom.imageUrl}
                                alt="Bottom view"
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="text-sm font-medium">BOTTOM</span>
                                <span className="text-xs mt-1">Not generated</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Prompt */}
                  {revision.editPrompt && revision.editPrompt !== 'Original design' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        Edit Prompt
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {formatContent(revision.editPrompt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5" />
                      Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-600">Revision ID</span>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{revision.id}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-600">Created</span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(revision.createdAt).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {revision.editPrompt && revision.editPrompt !== 'Original design' && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-xs font-medium text-gray-600">Prompt Statistics</span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {revision.editPrompt.length} characters • {revision.editPrompt.split(' ').length} words
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      {revision.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                          Active Version
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          Previous Version
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer - Only show if there's an action button */}
              {!revision.isActive && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => {
                        onRollback(revision);
                        onClose();
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Activate This Revision
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

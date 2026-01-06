import React from 'react';
import { CheckCircle2, Clock, CreditCard, Package, Lightbulb, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractImagesFromText } from '@/lib/utils/format-message-content';

export interface RevisionSummaryProps {
  revisionNumber?: number;
  productName?: string;
  editPrompt?: string;
  changes: string[];
  viewsGenerated: string[];
  processingTime?: number;
  creditsUsed?: number;
  tips: string[];
  className?: string;
}

export function RevisionSummaryCard({
  revisionNumber,
  productName,
  editPrompt,
  changes,
  viewsGenerated,
  processingTime,
  creditsUsed,
  tips,
  className
}: RevisionSummaryProps) {
  const processingSeconds = processingTime ? Math.round(processingTime / 1000) : 0;

  return (
    <div className={cn(
      "relative",
      className
    )}>
      {/* Simple left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
      
      <div className="pl-4 space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {revisionNumber ? `Revision #${revisionNumber} Complete` : 'Revision Complete'}
            </h3>
          </div>
          {productName && (
            <p className="text-xs text-slate-700 dark:text-slate-300 ml-6">
              {productName}
            </p>
          )}
        </div>

        {/* Edit Request */}
        {editPrompt && (() => {
          const { cleanedText } = extractImagesFromText(editPrompt);
          return (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5">
              <p className="text-xs text-slate-800 dark:text-slate-200 break-words">
                <span className="font-medium text-slate-600 dark:text-slate-400">Request:</span> {cleanedText || editPrompt}
              </p>
            </div>
          );
        })()}

        {/* Changes Applied */}
        {changes.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              Changes Applied:
            </h4>
            <div className="space-y-1">
              {changes.map((change, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 dark:text-purple-300 mt-0.5">•</span>
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    {change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Views Generated */}
        {viewsGenerated.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              Views Generated:
            </h4>
            <div className="flex gap-2 flex-wrap">
              {viewsGenerated.map((view, i) => (
                <div 
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700"
                >
                  <CheckCircle2 className="h-3 w-3 text-purple-400 dark:text-purple-300" />
                  <span className="text-xs text-slate-800 dark:text-white">
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {(processingTime || creditsUsed) && (
          <div className="flex gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {processingTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-200">
                  {processingSeconds}s
                </span>
              </div>
            )}
            {creditsUsed && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-200">
                  {creditsUsed} credits
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400" />
              Next Steps:
            </h4>
            <div className="space-y-1">
              {tips.map((tip, i) => (
                <p key={i} className="text-xs text-slate-700 dark:text-slate-200 ml-4 break-words">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

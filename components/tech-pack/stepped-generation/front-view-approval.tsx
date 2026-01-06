"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface FrontViewApprovalProps {
  approvalId: string;
  frontViewUrl: string;
  status: 'pending' | 'approved' | 'revision_requested';
  onApprove: (feedback?: string) => Promise<void>;
  onReject: (feedback: string) => Promise<void>;
  onRegenerateRequest?: () => void;
  isProcessing?: boolean;
}

export function FrontViewApproval({
  approvalId,
  frontViewUrl,
  status,
  onApprove,
  onReject,
  onRegenerateRequest,
  isProcessing = false,
}: FrontViewApprovalProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(feedback);
      setFeedback('');
      setShowFeedback(false);
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for revision');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject(feedback);
      setFeedback('');
      setShowFeedback(false);
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'revision_requested':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <RefreshCw className="w-3 h-3 mr-1" />
            Revision Requested
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Front View</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Preview */}
        <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-50 border">
          <Image
            src={frontViewUrl}
            alt="Product Front View"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Status-based content */}
        {status === 'pending' && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please review the front view carefully. This will be used as the reference for generating back and side views.
              </AlertDescription>
            </Alert>

            {/* Feedback Section */}
            {showFeedback && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Feedback (Optional for approval, required for revision)
                </label>
                <Textarea
                  placeholder="Describe what changes you'd like to see..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting || isProcessing}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve & Continue
                  </>
                )}
              </Button>
              
              {!showFeedback ? (
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(true)}
                  disabled={isSubmitting || isProcessing}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Request Changes
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting || isProcessing || !feedback.trim()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Request Revision
                </Button>
              )}
            </div>
          </>
        )}

        {status === 'approved' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Front view approved! Back and side views are being generated based on this reference.
            </AlertDescription>
          </Alert>
        )}

        {status === 'revision_requested' && onRegenerateRequest && (
          <>
            <Alert className="bg-yellow-50 border-yellow-200">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Revision requested. A new front view will be generated based on your feedback.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={onRegenerateRequest}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Version
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

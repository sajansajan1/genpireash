/**
 * Progress Stepper Component
 * Reusable stepper component for showing progress through multiple steps
 */

"use client";

import React from 'react';
import { Check } from 'lucide-react';

export interface StepData {
  id: string;
  label: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: StepData[];
  currentStep: number; // 0-indexed
  completedSteps?: number[]; // Array of completed step indices
  variant?: 'arrow' | 'circle' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  completedSteps = [],
  variant = 'arrow',
  size = 'md',
  className = '',
}: ProgressStepperProps) {
  const sizeClasses = {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-3 px-4',
    lg: 'text-base py-4 px-6',
  };

  const stepSizeClasses = sizeClasses[size];

  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(index)) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  if (variant === 'arrow') {
    return (
      <div className={`flex items-center ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="relative flex-1 flex items-center"
              style={{ marginRight: isLast ? 0 : '-12px' }}
            >
              {/* Arrow Step */}
              <div
                className={`
                  relative flex items-center justify-center
                  ${stepSizeClasses}
                  w-full transition-all duration-300
                  ${
                    status === 'completed'
                      ? 'bg-green-600 text-white'
                      : status === 'current'
                      ? 'bg-[#1C1917] text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }
                  ${!isLast ? 'clip-arrow' : 'rounded-r-lg'}
                  ${index === 0 ? 'rounded-l-lg' : ''}
                `}
                style={{
                  clipPath: !isLast
                    ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                    : index > 0
                    ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)'
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2 relative z-10">
                  {status === 'completed' && (
                    <Check className="h-4 w-4" />
                  )}
                  <span className="font-medium whitespace-nowrap">{step.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Circle Step */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 font-semibold
                    ${
                      status === 'completed'
                        ? 'bg-green-600 text-white'
                        : status === 'current'
                        ? 'bg-[#1C1917] text-white ring-4 ring-gray-200 dark:ring-gray-700'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-medium ${
                      status === 'current'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 -mt-6">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completedSteps.includes(index + 1) || currentStep > index
                        ? 'bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);

        return (
          <div
            key={step.id}
            className={`
              flex-1 ${stepSizeClasses} text-center
              rounded-lg transition-all duration-300
              ${
                status === 'completed'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : status === 'current'
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }
            `}
          >
            <span className="font-medium">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

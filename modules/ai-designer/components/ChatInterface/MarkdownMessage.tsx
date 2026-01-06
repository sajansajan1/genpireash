/**
 * Custom Markdown Message Component
 * Handles basic markdown formatting for chat messages
 */

import React from "react";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className = "" }: MarkdownMessageProps) {
  // Parse and format markdown content
  const formatContent = (text: string) => {
    // Split by line breaks to preserve paragraph structure
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    let inNumberedList = false;
    let inBulletList = false;
    let numberedListItems: string[] = [];
    let bulletListItems: string[] = [];
    let listStartIndex = 0;

    lines.forEach((line, lineIndex) => {
      // Check for header-like lines (all caps with colons)
      const headerMatch = line.match(/^([A-Z\s]+):$/);
      if (headerMatch) {
        // Close any open lists
        if (inNumberedList) {
          elements.push(renderNumberedList(numberedListItems, listStartIndex));
          inNumberedList = false;
          numberedListItems = [];
        }
        if (inBulletList) {
          elements.push(renderBulletList(bulletListItems, listStartIndex));
          inBulletList = false;
          bulletListItems = [];
        }

        elements.push(
          <div key={`header-${lineIndex}`} className="font-semibold text-gray-900 mt-3 mb-2 text-sm">
            {headerMatch[1]}:
          </div>
        );
        return;
      }

      // Check if it's a numbered list item (e.g., "1.", "2.", etc.)
      const numberedListMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*:\s*(.*)$/);
      const simpleNumberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);

      if (numberedListMatch || simpleNumberedListMatch) {
        // Close bullet list if open
        if (inBulletList) {
          elements.push(renderBulletList(bulletListItems, listStartIndex));
          inBulletList = false;
          bulletListItems = [];
        }

        // Start a new numbered list if not already in one
        if (!inNumberedList) {
          inNumberedList = true;
          numberedListItems = [];
          listStartIndex = lineIndex;
        }
        numberedListItems.push(line);
      } else if (line.match(/^\s*[-•]\s+/)) {
        // Check if it's a bullet point (- or •)
        // Close numbered list if open
        if (inNumberedList) {
          elements.push(renderNumberedList(numberedListItems, listStartIndex));
          inNumberedList = false;
          numberedListItems = [];
        }

        // Start a new bullet list if not already in one
        if (!inBulletList) {
          inBulletList = true;
          bulletListItems = [];
          listStartIndex = lineIndex;
        }
        bulletListItems.push(line);
      } else {
        // If we were in a list and this line isn't a list item, close the list
        if (inNumberedList) {
          elements.push(renderNumberedList(numberedListItems, listStartIndex));
          inNumberedList = false;
          numberedListItems = [];
        }
        if (inBulletList) {
          elements.push(renderBulletList(bulletListItems, listStartIndex));
          inBulletList = false;
          bulletListItems = [];
        }

        // Process regular line with inline markdown
        if (line.trim()) {
          elements.push(
            <p key={`p-${lineIndex}`} className="mb-2 last:mb-0">
              {parseInlineMarkdown(line)}
            </p>
          );
        } else {
          // Empty line - add spacing
          elements.push(<div key={`space-${lineIndex}`} className="h-2" />);
        }
      }
    });

    // Close lists if they were the last elements
    if (inNumberedList) {
      elements.push(renderNumberedList(numberedListItems, listStartIndex));
    }
    if (inBulletList) {
      elements.push(renderBulletList(bulletListItems, listStartIndex));
    }

    return elements;
  };

  // Helper function to render numbered lists
  const renderNumberedList = (items: string[], startIndex: number) => {
    return (
      <div key={`numbered-list-${startIndex}`} className="space-y-2 my-2">
        {items.map((item, idx) => {
          const match = item.match(/^(\d+)\.\s+\*\*(.+?)\*\*:\s*(.*)$/) ||
                       item.match(/^(\d+)\.\s+(.+)$/);
          if (match) {
            const number = match[1];
            if (match[3]) {
              return (
                <div key={idx} className="flex gap-2">
                  <span className="font-medium text-gray-900 flex-shrink-0">{number}.</span>
                  <div>
                    <strong className="font-semibold text-gray-900">{match[2]}</strong>
                    <span className="text-gray-700">: {parseInlineMarkdown(match[3])}</span>
                  </div>
                </div>
              );
            } else {
              const content = match[2];
              return (
                <div key={idx} className="flex gap-2">
                  <span className="font-medium text-gray-900 flex-shrink-0">{number}.</span>
                  <div>{parseInlineMarkdown(content)}</div>
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    );
  };

  // Helper function to render bullet lists
  const renderBulletList = (items: string[], startIndex: number) => {
    return (
      <div key={`bullet-list-${startIndex}`} className="space-y-1.5 my-2">
        {items.map((item, idx) => {
          // Remove the bullet point and trim
          const content = item.replace(/^\s*[-•]\s+/, '').trim();
          return (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-900 flex-shrink-0">•</span>
              <div className="text-gray-700">{parseInlineMarkdown(content)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // Parse inline markdown (bold, italic, code)
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let key = 0;

    // Process bold text (**text**)
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(currentText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {currentText.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add bold text
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < currentText.length) {
      parts.push(
        <span key={`text-${key++}`}>
          {currentText.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={className}>
      {formatContent(content)}
    </div>
  );
}

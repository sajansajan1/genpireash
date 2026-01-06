import React, { useState, useEffect, useCallback } from "react";
import {
  getPersonalizedSuggestions,
  generatePersonalizedGreeting,
  trackUserEditPattern,
  getContextualTip,
} from "@/app/actions/ai-chat-personalization";

interface PersonalizedChatState {
  suggestions: string[];
  greeting: string;
  isLoading: boolean;
  sessionEdits: string[];
}

export function usePersonalizedChat(userId: string | undefined, productId: string | undefined, productName?: string) {
  const [state, setState] = useState<PersonalizedChatState>({
    suggestions: [],
    greeting: "",
    isLoading: true,
    sessionEdits: [],
  });

  // Load initial personalized content
  useEffect(() => {
    if (!userId || !productId) return;

    const loadPersonalization = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Get personalized greeting and suggestions in parallel
        const [greeting, suggestions] = await Promise.all([
          generatePersonalizedGreeting(userId, productName),
          getPersonalizedSuggestions(userId, productId, productName || "product"),
        ]);

        setState((prev) => ({
          ...prev,
          greeting,
          suggestions,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error loading personalization:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          greeting: `Welcome! Ready to enhance ${productName || "your product"}?`,
          suggestions: ["Change the background to white", "Make colors more vibrant", "Add professional lighting"],
        }));
      }
    };

    loadPersonalization();
  }, [userId, productId, productName]);

  // Track edit and update suggestions
  const trackEdit = useCallback(
    async (editPrompt: string) => {
      if (!userId || !productId) return;

      // Add to session edits
      setState((prev) => ({
        ...prev,
        sessionEdits: [...prev.sessionEdits, editPrompt],
      }));

      // Track in database
      await trackUserEditPattern(userId, productId, editPrompt);

      // Get new suggestions based on updated context
      const newSuggestions = await getPersonalizedSuggestions(userId, productId, editPrompt);

      setState((prev) => ({
        ...prev,
        suggestions: newSuggestions,
      }));
    },
    [userId, productId]
  );

  // Get contextual tip based on session
  const getSessionTip = useCallback(async () => {
    if (!userId || !productId || state.sessionEdits.length === 0) {
      return "💡 Tip: Try describing changes naturally, like 'make it more modern'";
    }

    return await getContextualTip(userId, productId, state.sessionEdits);
  }, [userId, productId, state.sessionEdits]);

  // Generate quick action from suggestion
  const applySuggestion = useCallback((suggestion: string) => {
    // This returns the suggestion as a ready-to-use prompt
    return suggestion.toLowerCase().replace("try ", "").replace("consider ", "");
  }, []);

  return {
    ...state,
    trackEdit,
    getSessionTip,
    applySuggestion,
  };
}

// Quick suggestions component
export function QuickSuggestions({
  suggestions,
  onSelect,
  isLoading,
}: {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-32 bg-muted/50 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t bg-muted/20">
      <span className="text-xs text-[#1C1917] self-center">Try:</span>
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-xs font-medium rounded-full 
                     bg-background/80 hover:bg-primary/10 
                     border border-border/50 hover:border-primary/50
                     transition-all duration-200 hover:scale-105"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

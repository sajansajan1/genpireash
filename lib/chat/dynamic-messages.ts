/**
 * Client-side dynamic message generator
 * Uses pre-defined variations to avoid server calls during UI updates
 */

export interface DynamicMessageContext {
  type: 'processing' | 'image-ready' | 'success' | 'completion' | 'analysis';
  viewType?: 'front' | 'back' | 'side';
  productName?: string;
  editPrompt?: string;
  progress?: number;
}

// Message templates with multiple variations
const messageTemplates = {
  'image-ready': {
    front: [
      "Front view looks amazing! The details are perfectly captured.",
      "Your front perspective is ready - looking sharp!",
      "Front view transformation complete! The changes look great.",
      "Perfect! The front angle showcases your edits beautifully.",
      "Front view has been masterfully updated!",
    ],
    back: [
      "Back view is ready! The consistency across views is impressive.",
      "Your back perspective has been beautifully rendered!",
      "Back view complete - the details match perfectly.",
      "Excellent! The back angle maintains all your requested changes.",
      "Back view transformation successful!",
    ],
    side: [
      "Side profile complete! Your product looks stunning from every angle.",
      "Side view has been expertly generated!",
      "Perfect side perspective achieved - great consistency!",
      "Side view ready! The three-dimensional effect is fantastic.",
      "Side angle transformation complete - looking professional!",
    ],
    default: [
      "View generated successfully! The quality is outstanding.",
      "Image ready! Your vision is taking shape beautifully.",
      "Transformation complete for this view!",
      "Looking great! This perspective captures your edits perfectly.",
      "View updated with precision and style!",
    ]
  },
  'success': [
    "Brilliant work! All views have been transformed to match your vision perfectly.",
    "Success! Your product now showcases the requested changes beautifully across all angles.",
    "Outstanding! The transformation is complete and looking professional.",
    "Perfect execution! Every view reflects your creative direction flawlessly.",
    "Fantastic results! Your product images have been elevated to the next level.",
    "Impressive transformation! All perspectives now align with your specifications.",
    "Excellent work! The consistency across all views is remarkable.",
    "Mission accomplished! Your product looks stunning from every angle.",
  ],
  'completion': [
    "Your creative vision has been brought to life! Feel free to refine further or save these stunning results.",
    "Transformation complete! Continue experimenting or lock in these professional-quality images.",
    "All set! Your product looks amazing - ready for any adjustments or final approval.",
    "Excellence achieved! Make any final touches or save this masterpiece.",
    "Your product images are ready! Continue perfecting or preserve these impressive results.",
    "Design goals met! Further refinements are welcome, or save your work now.",
    "Looking fantastic! Ready for additional edits or to finalize these changes.",
    "Creative process complete! The canvas is yours for more edits or to save.",
  ],
  'processing': {
    early: [
      "Initializing your creative transformation...",
      "Getting started on your vision...",
      "Preparing to bring your ideas to life...",
      "Setting up the enhancement process...",
    ],
    mid: [
      "The AI is crafting your perfect images...",
      "Transformation in progress - looking good so far!",
      "Working on the details of your request...",
      "Your edits are being carefully applied...",
    ],
    late: [
      "Almost there! Finalizing the details...",
      "Putting the finishing touches on your images...",
      "Nearly complete - perfecting the results...",
      "Final adjustments being made...",
    ]
  },
  'analysis': [
    "Analyzing your product with advanced AI vision technology...",
    "Understanding the nuances of your design for perfect edits...",
    "Studying every detail to ensure flawless transformation...",
    "AI is examining your product's unique characteristics...",
    "Comprehending your vision through intelligent analysis...",
    "Mapping out the perfect approach for your edits...",
  ]
};

/**
 * Get a random message from an array
 */
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate a dynamic message based on context
 */
export function getDynamicMessage(context: DynamicMessageContext): string {
  const { type, viewType, productName, progress } = context;

  switch (type) {
    case 'image-ready':
      if (viewType && messageTemplates['image-ready'][viewType]) {
        return getRandomMessage(messageTemplates['image-ready'][viewType]);
      }
      return getRandomMessage(messageTemplates['image-ready'].default);

    case 'success':
      return getRandomMessage(messageTemplates.success);

    case 'completion':
      return getRandomMessage(messageTemplates.completion);

    case 'processing':
      if (progress !== undefined) {
        if (progress < 30) {
          return getRandomMessage(messageTemplates.processing.early);
        } else if (progress < 70) {
          return getRandomMessage(messageTemplates.processing.mid);
        } else {
          return getRandomMessage(messageTemplates.processing.late);
        }
      }
      return getRandomMessage(messageTemplates.processing.mid);

    case 'analysis':
      return getRandomMessage(messageTemplates.analysis);

    default:
      return "Operation in progress...";
  }
}

/**
 * Generate a progress-specific message
 */
export function getProgressMessage(progress: number, viewType?: string): string {
  const view = viewType ? `${viewType} view` : 'image';
  
  const messages = [
    `Processing ${view}... ${progress}% complete`,
    `Crafting your ${view}... ${progress}% done`,
    `Generating ${view}... ${progress}% progress`,
    `Working on ${view}... ${progress}% completed`,
    `Creating ${view}... ${progress}% finished`,
  ];
  
  return getRandomMessage(messages);
}

/**
 * Generate contextual follow-up suggestions
 */
export function getFollowUpSuggestion(previousEdits: string[]): string {
  const suggestions = [
    "💡 Try adjusting the lighting for even more impact",
    "💡 Consider changing the background for a different mood",
    "💡 Experiment with color temperature for variety",
    "💡 Add subtle shadows for more depth",
    "💡 Try a minimalist approach for a clean look",
    "💡 Enhance textures for a premium feel",
    "💡 Adjust contrast for better visual pop",
    "💡 Consider a lifestyle setting for context",
  ];
  
  // Filter out suggestions that might be redundant based on previous edits
  const relevantSuggestions = suggestions.filter(suggestion => {
    const suggestionLower = suggestion.toLowerCase();
    return !previousEdits.some(edit => 
      edit.toLowerCase().includes(suggestionLower.slice(2, 10))
    );
  });
  
  return getRandomMessage(relevantSuggestions.length > 0 ? relevantSuggestions : suggestions);
}

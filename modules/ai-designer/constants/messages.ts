/**
 * Dynamic message templates and variations
 */

// Message templates with multiple variations
export const MESSAGE_TEMPLATES = {
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
  ],
  'acknowledgements': [
    "I'll transform your product with: \"{prompt}\". Starting now!",
    "Great idea! Let me apply \"{prompt}\" to all views.",
    "Understood! Working on: \"{prompt}\" for you.",
    "Perfect! I'll implement \"{prompt}\" across all angles.",
    "Got it! Processing your request: \"{prompt}\"",
  ],
  'follow_up': [
    "Your product is ready! You can now refine specific details or add variations.",
    "Great start! Feel free to adjust colors, materials, or styling.",
    "Your design is generated! You can modify any aspect or add brand elements.",
    "Looking good! Try adding logos, changing materials, or adjusting the style."
  ]
};

// Affirmative response patterns for intent detection
export const AFFIRMATIVE_PATTERNS = [
  "ok",
  "okay",
  "yes",
  "yeah",
  "yep",
  "sure",
  "go ahead",
  "do it",
  "proceed",
  "implement",
  "apply",
  "let's do it",
  "sounds good",
  "make those changes",
  "implement that",
  "apply that",
];

// Greeting patterns for intent detection
export const GREETING_PATTERNS = [
  "hello",
  "hi",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "howdy",
];

// Design keywords for intent detection
export const DESIGN_KEYWORDS = [
  "change",
  "make",
  "add",
  "remove",
  "modify",
  "update",
  "color",
  "size",
  "style",
];

// Intent labels for display
export const INTENT_LABELS = {
  design_edit: "Design Edit Request",
  question: "Question",
  technical_info: "Technical Info Request",
  feedback: "Feedback/Opinion Request",
  general_chat: "General Discussion",
  greeting: "Greeting",
};

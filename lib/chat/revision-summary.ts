/**
 * Generate context-aware revision summary with bullet points
 */

export interface RevisionSummaryContext {
  editPrompt: string;
  productName?: string;
  viewsGenerated: string[];
  revisionNumber?: number;
  processingTime?: number;
  creditsUsed?: number;
}

/**
 * Analyze the edit prompt to extract key changes
 */
function analyzeEditPrompt(prompt: string): string[] {
  const changes: string[] = [];
  const promptLower = prompt.toLowerCase();
  
  // Color changes
  if (promptLower.includes('color') || promptLower.includes('colour')) {
    if (promptLower.includes('red')) changes.push('🎨 Changed color scheme to red');
    else if (promptLower.includes('blue')) changes.push('🎨 Changed color scheme to blue');
    else if (promptLower.includes('green')) changes.push('🎨 Changed color scheme to green');
    else if (promptLower.includes('black')) changes.push('🎨 Changed color scheme to black');
    else if (promptLower.includes('white')) changes.push('🎨 Changed color scheme to white');
    else if (promptLower.includes('yellow')) changes.push('🎨 Changed color scheme to yellow');
    else if (promptLower.includes('purple')) changes.push('🎨 Changed color scheme to purple');
    else if (promptLower.includes('pink')) changes.push('🎨 Changed color scheme to pink');
    else if (promptLower.includes('orange')) changes.push('🎨 Changed color scheme to orange');
    else if (promptLower.includes('vibrant')) changes.push('🎨 Enhanced color vibrancy');
    else if (promptLower.includes('muted')) changes.push('🎨 Applied muted color palette');
    else if (promptLower.includes('pastel')) changes.push('🎨 Applied pastel color palette');
    else changes.push('🎨 Modified color scheme');
  }
  
  // Background changes
  if (promptLower.includes('background')) {
    if (promptLower.includes('white')) changes.push('🖼️ Set white background');
    else if (promptLower.includes('transparent')) changes.push('🖼️ Made background transparent');
    else if (promptLower.includes('gradient')) changes.push('🖼️ Added gradient background');
    else if (promptLower.includes('remove')) changes.push('🖼️ Removed background elements');
    else changes.push('🖼️ Modified background');
  }
  
  // Style changes
  if (promptLower.includes('modern')) changes.push('✨ Applied modern aesthetic');
  if (promptLower.includes('vintage') || promptLower.includes('retro')) changes.push('✨ Applied vintage/retro style');
  if (promptLower.includes('minimal')) changes.push('✨ Created minimalist design');
  if (promptLower.includes('professional')) changes.push('✨ Enhanced professional appearance');
  if (promptLower.includes('elegant')) changes.push('✨ Added elegant styling');
  
  // Lighting changes
  if (promptLower.includes('light') || promptLower.includes('bright')) {
    if (promptLower.includes('studio')) changes.push('💡 Applied studio lighting');
    else if (promptLower.includes('natural')) changes.push('💡 Enhanced natural lighting');
    else if (promptLower.includes('dramatic')) changes.push('💡 Added dramatic lighting');
    else changes.push('💡 Adjusted lighting');
  }
  
  // Shadow/depth changes
  if (promptLower.includes('shadow')) {
    if (promptLower.includes('remove')) changes.push('🔲 Removed shadows');
    else if (promptLower.includes('add') || promptLower.includes('drop')) changes.push('🔲 Added shadow effects');
    else changes.push('🔲 Modified shadows');
  }
  
  // Texture/material changes
  if (promptLower.includes('texture') || promptLower.includes('material')) {
    if (promptLower.includes('smooth')) changes.push('🧵 Smoothed textures');
    else if (promptLower.includes('rough')) changes.push('🧵 Added rough texture');
    else if (promptLower.includes('glossy') || promptLower.includes('shiny')) changes.push('🧵 Applied glossy finish');
    else if (promptLower.includes('matte')) changes.push('🧵 Applied matte finish');
    else changes.push('🧵 Modified textures/materials');
  }
  
  // Size/scale changes
  if (promptLower.includes('larger') || promptLower.includes('bigger')) changes.push('📏 Increased size/scale');
  if (promptLower.includes('smaller') || promptLower.includes('reduce')) changes.push('📏 Reduced size/scale');
  
  // Detail enhancements
  if (promptLower.includes('detail')) {
    if (promptLower.includes('more') || promptLower.includes('add')) changes.push('🔍 Enhanced details');
    else if (promptLower.includes('less') || promptLower.includes('simplif')) changes.push('🔍 Simplified details');
  }
  
  // Quality improvements
  if (promptLower.includes('quality') || promptLower.includes('enhance') || promptLower.includes('improve')) {
    changes.push('⬆️ Enhanced overall quality');
  }
  
  // Composition changes
  if (promptLower.includes('zoom')) {
    if (promptLower.includes('in')) changes.push('🔍 Zoomed in on product');
    else if (promptLower.includes('out')) changes.push('🔍 Zoomed out for wider view');
  }
  if (promptLower.includes('crop')) changes.push('✂️ Cropped image composition');
  if (promptLower.includes('center')) changes.push('🎯 Centered product in frame');
  if (promptLower.includes('rotate')) changes.push('🔄 Rotated product orientation');
  
  // Atmosphere changes
  if (promptLower.includes('warm')) changes.push('🌅 Applied warm tone adjustments');
  if (promptLower.includes('cool') || promptLower.includes('cold')) changes.push('❄️ Applied cool tone adjustments');
  if (promptLower.includes('soft')) changes.push('☁️ Softened overall appearance');
  if (promptLower.includes('sharp')) changes.push('🔪 Sharpened image details');
  
  // Environment changes
  if (promptLower.includes('outdoor')) changes.push('🌳 Set outdoor environment');
  if (promptLower.includes('indoor')) changes.push('🏠 Set indoor environment');
  if (promptLower.includes('studio')) changes.push('📸 Applied studio setting');
  if (promptLower.includes('lifestyle')) changes.push('🛍️ Created lifestyle context');
  
  // If no specific changes detected, add generic
  if (changes.length === 0) {
    changes.push('🔄 Applied requested modifications');
  }
  
  // Limit to 5 most relevant changes
  return changes.slice(0, 5);
}

export interface RevisionSummaryData {
  revisionNumber?: number;
  productName?: string;
  editPrompt?: string;
  changes: string[];
  viewsGenerated: string[];
  processingTime?: number;
  creditsUsed?: number;
  tips: string[];
}

/**
 * Generate a complete revision summary as structured data
 */
export function generateRevisionSummaryData(context: RevisionSummaryContext): RevisionSummaryData {
  const { editPrompt, productName, viewsGenerated, revisionNumber, processingTime, creditsUsed } = context;
  
  // Extract changes from prompt
  const changes = analyzeEditPrompt(editPrompt);
  
  // Generate tips
  const tips = generateContextualTips(editPrompt);
  
  return {
    revisionNumber,
    productName,
    editPrompt,
    changes,
    viewsGenerated,
    processingTime,
    creditsUsed,
    tips
  };
}

/**
 * Generate a complete revision summary (legacy markdown version)
 */
export function generateRevisionSummary(context: RevisionSummaryContext): string {
  const data = generateRevisionSummaryData(context);
  
  // Build summary header
  const header = data.revisionNumber 
    ? `## 📋 Revision #${data.revisionNumber} Complete`
    : `## 📋 Revision Complete`;
  
  // Build product info
  const productInfo = data.productName 
    ? `**Product:** ${data.productName}\n`
    : '';
  
  // Build changes section
  const changesSection = `**Changes Applied:**\n${data.changes.map(c => `• ${c}`).join('\n')}`;
  
  // Build views section
  const viewsSection = data.viewsGenerated.length > 0
    ? `\n**Views Generated:**\n${data.viewsGenerated.map(v => `• ✅ ${v.charAt(0).toUpperCase() + v.slice(1)} view updated`).join('\n')}`
    : '';
  
  // Build stats section
  let statsSection = '';
  if (data.processingTime || data.creditsUsed) {
    statsSection = '\n**Stats:**';
    if (data.processingTime) {
      const seconds = Math.round(data.processingTime / 1000);
      statsSection += `\n• ⏱️ Processing time: ${seconds} seconds`;
    }
    if (data.creditsUsed) {
      statsSection += `\n• 💳 Credits used: ${data.creditsUsed}`;
    }
  }
  
  // Build tips section
  const tipsSection = data.tips.length > 0
    ? `\n**Next Steps:**\n${data.tips.map(t => `• ${t}`).join('\n')}`
    : '';
  
  // Combine all sections
  return [header, productInfo, changesSection, viewsSection, statsSection, tipsSection]
    .filter(Boolean)
    .join('\n');
}

/**
 * Generate contextual tips based on what was done
 */
function generateContextualTips(editPrompt: string): string[] {
  const tips: string[] = [];
  const promptLower = editPrompt.toLowerCase();
  
  // Suggest complementary actions
  if (promptLower.includes('color')) {
    tips.push('💡 Try adjusting the lighting to complement the new colors');
  }
  
  if (promptLower.includes('background')) {
    tips.push('💡 Consider adding shadows for better depth perception');
  }
  
  if (promptLower.includes('modern') || promptLower.includes('minimal')) {
    tips.push('💡 You might want to simplify any text or logos as well');
  }
  
  if (promptLower.includes('vintage') || promptLower.includes('retro')) {
    tips.push('💡 Adding a subtle grain effect could enhance the vintage feel');
  }
  
  // Always add save reminder
  tips.push('💾 Remember to save your work if you\'re happy with the results');
  
  // Limit to 2 tips
  return tips.slice(0, 2);
}

/**
 * Generate a brief success message
 */
export function generateBriefSuccess(editPrompt: string, productName?: string): string {
  const actions = [
    `Successfully applied "${editPrompt}" to all views!`,
    `Your ${productName || 'product'} has been transformed as requested!`,
    `All views updated with "${editPrompt}"!`,
    `Perfect! The "${editPrompt}" effect has been applied consistently.`,
    `Excellent! Your vision for "${editPrompt}" is now reality.`,
  ];
  
  return actions[Math.floor(Math.random() * actions.length)];
}

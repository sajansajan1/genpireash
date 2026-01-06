"use server";

import { SpatialGridAnalysis, GridSquare } from "./image-analysis-service";

/**
 * Convert user's spatial edit instructions to precise prompts
 * Example: "Add logo to top-left" -> specific grid squares
 */
export function convertSpatialEditToPrompt(
  editInstruction: string,
  spatialGrid?: SpatialGridAnalysis
): string {
  if (!spatialGrid) {
    return editInstruction;
  }

  let enhancedPrompt = editInstruction;
  
  // Map common position references to grid squares
  const positionMappings: { [key: string]: string[] } = {
    'top-left': ['A1'],
    'top-right': ['A4'],
    'bottom-left': ['D1'],
    'bottom-right': ['D4'],
    'center': ['B2', 'B3', 'C2', 'C3'],
    'top': ['A1', 'A2', 'A3', 'A4'],
    'bottom': ['D1', 'D2', 'D3', 'D4'],
    'left': ['A1', 'B1', 'C1', 'D1'],
    'right': ['A4', 'B4', 'C4', 'D4'],
    'upper-half': ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'],
    'lower-half': ['C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'],
    'chest': ['B2', 'B3'], // For clothing
    'collar': ['A2', 'A3'], // For shirts
    'sleeve': ['B1', 'B4'], // For shirts
    'pocket': ['B2', 'C2'], // Common pocket position
  };

  // Check if instruction contains position references
  for (const [position, squares] of Object.entries(positionMappings)) {
    if (editInstruction.toLowerCase().includes(position)) {
      // Get current content in those squares
      const currentContent = squares
        .map(sq => {
          const square = spatialGrid.squares.find(s => s.id === sq);
          return square ? `${sq}: ${square.content}` : '';
        })
        .filter(Boolean)
        .join(', ');
      
      // Add spatial context to prompt
      enhancedPrompt += ` [Spatial context: Target area ${position} includes grid squares ${squares.join(', ')}. Current content: ${currentContent}]`;
    }
  }
  
  return enhancedPrompt;
}

/**
 * Get specific edit instructions based on spatial grid
 */
export function getSpatialEditInstructions(
  editType: string,
  targetSquares: string[],
  spatialGrid?: SpatialGridAnalysis
): string {
  if (!spatialGrid) {
    return "";
  }

  const instructions: string[] = [];
  
  // Analyze target squares
  targetSquares.forEach(squareId => {
    const square = spatialGrid.squares.find(s => s.id === squareId);
    if (square) {
      if (square.hasProduct) {
        instructions.push(`Square ${squareId} contains product - modify carefully`);
      }
      if (square.isEmpty) {
        instructions.push(`Square ${squareId} is empty - good for adding new elements`);
      }
      if (square.hasLogo) {
        instructions.push(`Square ${squareId} already has a logo - consider placement`);
      }
    }
  });
  
  return instructions.join('. ');
}

/**
 * Identify which squares need modification for an edit
 */
export function identifyAffectedSquares(
  editPrompt: string,
  spatialGrid: SpatialGridAnalysis
): string[] {
  const affectedSquares: Set<string> = new Set();
  const lowerPrompt = editPrompt.toLowerCase();
  
  // Check for specific square references (A1, B2, etc.)
  const squarePattern = /[A-D][1-4]/g;
  const matches = editPrompt.match(squarePattern);
  if (matches) {
    matches.forEach(sq => affectedSquares.add(sq));
  }
  
  // Check for color changes - affects squares with that color
  if (lowerPrompt.includes('color') || lowerPrompt.includes('colour')) {
    spatialGrid.squares.forEach(square => {
      if (square.hasProduct) {
        affectedSquares.add(square.id);
      }
    });
  }
  
  // Check for logo additions
  if (lowerPrompt.includes('logo') || lowerPrompt.includes('brand')) {
    // Common logo positions
    ['A1', 'A4', 'B2', 'B3', 'C2'].forEach(sq => affectedSquares.add(sq));
  }
  
  // Check for background changes
  if (lowerPrompt.includes('background')) {
    spatialGrid.squares.forEach(square => {
      if (square.hasBackground || square.isEmpty) {
        affectedSquares.add(square.id);
      }
    });
  }
  
  return Array.from(affectedSquares);
}

/**
 * Generate a visual grid representation for debugging
 */
export function visualizeGrid(spatialGrid: SpatialGridAnalysis): string {
  const grid: string[][] = [];
  
  // Initialize 4x4 grid
  for (let i = 0; i < 4; i++) {
    grid.push(new Array(4).fill(''));
  }
  
  // Fill grid with content indicators
  spatialGrid.squares.forEach(square => {
    let indicator = '□'; // Empty
    if (square.hasProduct) indicator = '■'; // Product
    if (square.hasLogo) indicator = '◆'; // Logo
    if (square.hasText) indicator = 'T'; // Text
    if (square.isEmpty) indicator = '·'; // Empty/Background
    
    grid[square.row][square.col] = `${square.id}:${indicator}`;
  });
  
  // Create visual representation
  let visual = '\n=== Spatial Grid Visualization ===\n';
  visual += '   1     2     3     4\n';
  
  const rowLabels = ['A', 'B', 'C', 'D'];
  grid.forEach((row, i) => {
    visual += `${rowLabels[i]} ${row.map(cell => cell.padEnd(6)).join('')}\n`;
  });
  
  visual += '\nLegend: ■=Product □=Mixed ◆=Logo T=Text ·=Empty\n';
  visual += '\nRegion Summary:\n';
  
  if (spatialGrid.dominantRegions) {
    Object.entries(spatialGrid.dominantRegions).forEach(([region, content]) => {
      visual += `  ${region}: ${content}\n`;
    });
  }
  
  return visual;
}

/**
 * Calculate edit precision based on spatial targeting
 */
export function calculateEditPrecision(
  intendedSquares: string[],
  actuallyAffectedSquares: string[],
  spatialGrid: SpatialGridAnalysis
): {
  precision: number;
  accuracy: number;
  unintendedChanges: string[];
  missedTargets: string[];
} {
  const intendedSet = new Set(intendedSquares);
  const affectedSet = new Set(actuallyAffectedSquares);
  
  // Calculate metrics
  const correctlyModified = intendedSquares.filter(sq => affectedSet.has(sq));
  const unintendedChanges = actuallyAffectedSquares.filter(sq => !intendedSet.has(sq));
  const missedTargets = intendedSquares.filter(sq => !affectedSet.has(sq));
  
  const precision = actuallyAffectedSquares.length > 0
    ? correctlyModified.length / actuallyAffectedSquares.length
    : 0;
    
  const accuracy = intendedSquares.length > 0
    ? correctlyModified.length / intendedSquares.length
    : 0;
  
  return {
    precision: Math.round(precision * 100),
    accuracy: Math.round(accuracy * 100),
    unintendedChanges,
    missedTargets
  };
}

/**
 * Generate region-specific edit prompts
 */
export function generateRegionPrompt(
  region: 'top' | 'bottom' | 'left' | 'right' | 'center',
  action: string,
  spatialGrid: SpatialGridAnalysis
): string {
  const regionContent = spatialGrid.dominantRegions?.[region] || "Mixed content";
  
  const regionSquares: { [key: string]: string[] } = {
    'top': ['A1', 'A2', 'A3', 'A4'],
    'bottom': ['D1', 'D2', 'D3', 'D4'],
    'left': ['A1', 'B1', 'C1', 'D1'],
    'right': ['A4', 'B4', 'C4', 'D4'],
    'center': ['B2', 'B3', 'C2', 'C3']
  };
  
  const squares = regionSquares[region];
  const currentState = squares.map(sq => {
    const square = spatialGrid.squares.find(s => s.id === sq);
    return square ? `${sq}: ${square.content}` : '';
  }).filter(Boolean);
  
  return `Apply "${action}" to the ${region} region (squares: ${squares.join(', ')}). ` +
         `Current ${region} contains: ${regionContent}. ` +
         `Detailed state: ${currentState.join('; ')}`;
}

/**
 * Suggest optimal placement for new elements
 */
export function suggestOptimalPlacement(
  elementType: 'logo' | 'text' | 'pattern' | 'decoration',
  spatialGrid: SpatialGridAnalysis
): {
  primarySuggestion: string[];
  alternativeSuggestions: string[][];
  reasoning: string;
} {
  const emptySquares = spatialGrid.squares.filter(s => s.isEmpty || s.hasBackground);
  const productSquares = spatialGrid.squares.filter(s => s.hasProduct);
  
  let primarySuggestion: string[] = [];
  let alternativeSuggestions: string[][] = [];
  let reasoning = "";
  
  switch (elementType) {
    case 'logo':
      // Prefer chest area for clothing, top corners for general products
      if (productSquares.some(s => ['B2', 'B3'].includes(s.id))) {
        primarySuggestion = ['B2'];
        alternativeSuggestions = [['A1'], ['C2'], ['B3']];
        reasoning = "Chest area is ideal for logo placement on clothing";
      } else {
        primarySuggestion = ['A1'];
        alternativeSuggestions = [['A4'], ['D1'], ['D4']];
        reasoning = "Corner placement provides good visibility without obscuring product";
      }
      break;
      
    case 'text':
      // Prefer bottom area for text
      primarySuggestion = ['D2', 'D3'];
      alternativeSuggestions = [['D1', 'D4'], ['C2', 'C3']];
      reasoning = "Bottom area is conventional for text and labels";
      break;
      
    case 'pattern':
      // Suggest based on empty areas
      const emptyGroups = findContiguousEmptySquares(emptySquares);
      if (emptyGroups.length > 0) {
        primarySuggestion = emptyGroups[0];
        alternativeSuggestions = emptyGroups.slice(1, 3);
        reasoning = "Pattern applied to contiguous empty areas for visual coherence";
      }
      break;
      
    case 'decoration':
      // Corners or edges
      primarySuggestion = ['A1', 'A4'];
      alternativeSuggestions = [['D1', 'D4'], ['A2', 'A3']];
      reasoning = "Decorative elements work best in corners or edges";
      break;
  }
  
  return { primarySuggestion, alternativeSuggestions, reasoning };
}

/**
 * Find groups of contiguous empty squares
 */
function findContiguousEmptySquares(emptySquares: GridSquare[]): string[][] {
  const groups: string[][] = [];
  const visited = new Set<string>();
  
  emptySquares.forEach(square => {
    if (!visited.has(square.id)) {
      const group: string[] = [];
      const queue = [square];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current.id)) continue;
        
        visited.add(current.id);
        group.push(current.id);
        
        // Check adjacent squares
        const adjacentPositions = [
          [current.row - 1, current.col], // top
          [current.row + 1, current.col], // bottom
          [current.row, current.col - 1], // left
          [current.row, current.col + 1], // right
        ];
        
        adjacentPositions.forEach(([row, col]) => {
          if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            const adjacent = emptySquares.find(s => s.row === row && s.col === col);
            if (adjacent && !visited.has(adjacent.id)) {
              queue.push(adjacent);
            }
          }
        });
      }
      
      if (group.length > 0) {
        groups.push(group);
      }
    }
  });
  
  // Sort groups by size (larger groups first)
  return groups.sort((a, b) => b.length - a.length);
}

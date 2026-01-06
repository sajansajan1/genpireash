/**
 * Utility functions to repair and parse potentially malformed JSON from LLM responses
 */

/**
 * Attempts to repair common JSON formatting issues
 */
export function repairJSON(jsonString: string): string {
  let repaired = jsonString;

  // Remove any markdown code block markers
  repaired = repaired.replace(/```(?:json)?\s*/g, '');
  repaired = repaired.replace(/```\s*$/g, '');

  // Remove BOM and zero-width characters
  repaired = repaired.replace(/^\uFEFF/, '');
  repaired = repaired.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Fix truncated strings by closing them
  repaired = repaired.replace(/("(?:[^"\\]|\\.)*$)/gm, '$1"');

  // Fix missing commas between properties
  repaired = repaired.replace(/"\s*\n\s*"/g, '",\n"');
  repaired = repaired.replace(/}\s*\n\s*{/g, '},\n{');
  repaired = repaired.replace(/]\s*\n\s*\[/g, '],\n[');
  repaired = repaired.replace(/("\w+"\s*:\s*"[^"]*")\s*\n\s*"/g, '$1,\n"');
  repaired = repaired.replace(/(\d)\s*\n\s*"/g, '$1,\n"');
  repaired = repaired.replace(/"([^"]*)"(\s*\n\s*})/g, '"$1"$2');

  // Fix trailing commas
  repaired = repaired.replace(/,\s*}/g, '}');
  repaired = repaired.replace(/,\s*]/g, ']');

  // Escape unescaped quotes inside strings
  // This is tricky - we need to be careful not to escape already escaped quotes
  repaired = repaired.replace(/"([^"]*)":/g, (match, key) => {
    const escapedKey = key.replace(/(?<!\\)"/g, '\\"');
    return `"${escapedKey}":`;
  });

  // Fix unescaped newlines in string values
  repaired = repaired.replace(/:\s*"([^"]*)"/g, (match, value) => {
    const escapedValue = value
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `: "${escapedValue}"`;
  });

  // Ensure the JSON is wrapped in braces if it starts with a property
  if (/^"\w+":\s*/.test(repaired.trim()) && !repaired.trim().startsWith('{')) {
    repaired = `{${repaired}}`;
  }

  // Close any unclosed braces or brackets
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;

  if (openBraces > closeBraces) {
    repaired += '}'.repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    repaired += ']'.repeat(openBrackets - closeBrackets);
  }

  return repaired;
}

/**
 * Extracts JSON from a larger text response
 */
export function extractJSON(text: string): string | null {
  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // Try to find JSON array
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  return null;
}

/**
 * Attempts to parse JSON with multiple fallback strategies
 */
export function parseJSONSafely(jsonString: string): any {
  // Strategy 1: Try parsing as-is
  try {
    return JSON.parse(jsonString);
  } catch (e1) {
    // Continue to next strategy
  }

  // Strategy 2: Extract and parse JSON
  const extracted = extractJSON(jsonString);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch (e2) {
      // Continue to next strategy
    }
  }

  // Strategy 3: Repair and parse
  const repaired = repairJSON(extracted || jsonString);
  try {
    return JSON.parse(repaired);
  } catch (e3) {
    // Continue to next strategy
  }

  // Strategy 4: Try to extract just the object content if wrapped incorrectly
  const objectContentMatch = jsonString.match(/\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/);
  if (objectContentMatch) {
    try {
      return JSON.parse(objectContentMatch[0]);
    } catch (e4) {
      // Continue to next strategy
    }
  }

  // Strategy 5: Last resort - try to build a valid JSON from key-value pairs
  try {
    // Extract key-value pairs
    const keyValuePairs = jsonString.match(/"[^"]+"\s*:\s*(?:"[^"]*"|[\d.]+|true|false|null|\[[^\]]*\]|\{[^}]*\})/g);
    if (keyValuePairs && keyValuePairs.length > 0) {
      const reconstructed = `{${keyValuePairs.join(',')}}`;
      return JSON.parse(repairJSON(reconstructed));
    }
  } catch (e5) {
    // Final failure
  }

  // If all strategies fail, throw the original error
  throw new Error(`Failed to parse JSON after trying all repair strategies. Original content: ${jsonString.substring(0, 500)}...`);
}

/**
 * Validates that the parsed object has the expected tech pack structure
 */
export function validateTechPackStructure(obj: any): boolean {
  // Check for essential tech pack properties
  const essentialProps = ['productName', 'productDescription'];
  return essentialProps.some(prop => obj.hasOwnProperty(prop));
}

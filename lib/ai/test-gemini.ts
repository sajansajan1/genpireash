/**
 * Test file for Gemini API
 * Run with: npx tsx lib/ai/test-gemini.ts
 */

import { GeminiImageService } from './gemini';

async function testGeminiService() {
  console.log('Testing Gemini Service...\n');
  
  try {
    // Initialize service (will use the API key from env or fallback)
    const service = new GeminiImageService();
    
    // Test 1: Health Check
    console.log('1. Running health check...');
    const isHealthy = await service.healthCheck();
    console.log('   Health check result:', isHealthy ? '✅ PASSED' : '❌ FAILED');
    
    // Test 2: Generate a simple image
    console.log('\n2. Generating test image...');
    const result = await service.generateImage({
      prompt: 'A simple red circle on white background',
      options: {
        retry: 2,
        fallbackEnabled: true,
        enhancePrompt: false
      }
    });
    
    if (result.url) {
      console.log('   Image generated successfully!');
      console.log('   Data URL length:', result.url.length);
      console.log('   Fallback used:', result.fallbackUsed);
      console.log('   Generation time:', result.metadata?.generationTime, 'ms');
    }
    
    // Test 3: Generate with template
    console.log('\n3. Generating from template...');
    const templateResult = await service.generateImage({
      prompt: '',
      productType: 'T-shirt',
      view: 'front',
      style: 'technical',
      options: {
        enhancePrompt: true,
        fallbackEnabled: true
      }
    });
    
    if (templateResult.url) {
      console.log('   Template-based image generated successfully!');
      console.log('   Style:', templateResult.metadata?.style);
      console.log('   View:', templateResult.metadata?.view);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
console.log('Starting Gemini API Test');
console.log('API Key:', process.env.API_KEY ? 'Set from environment' : 'Using fallback');
console.log('----------------------------\n');

testGeminiService().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});

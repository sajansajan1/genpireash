import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint for 3D model files
 * Bypasses CORS issues by fetching the file server-side
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelUrl = searchParams.get('url');

    if (!modelUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Fetch the model file
    const response = await fetch(modelUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
    }

    // Get the file data
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'model/gltf-binary',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy model file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

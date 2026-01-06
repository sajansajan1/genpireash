'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface Model3DViewerProps {
  modelUrl: string;
  onError?: (error: Error) => void;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url); // useGLTF suspends during loading
  return <primitive object={scene} />;
}

// Preload the model to avoid suspense issues
function PreloadModel({ url }: { url: string }) {
  useEffect(() => {
    useGLTF.preload(url);
  }, [url]);
  return null;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(24,24,27)] mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </div>
  );
}

export function Model3DViewer({ modelUrl }: Model3DViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use proxy to bypass CORS issues
  const proxiedUrl = `/api/proxy-3d-model?url=${encodeURIComponent(modelUrl)}`;

  useEffect(() => {
    // Preload the model
    setLoading(true);
    setError(null);

    useGLTF.preload(proxiedUrl);

    // Simulate loading completion after a delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [proxiedUrl]);

  return (
    <div className="relative w-full h-[calc(100vh-300px)] sm:h-[500px] md:h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
      {loading && <LoadingFallback />}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Stage
            intensity={0.5}
            environment="city"
            shadows={{
              type: 'contact',
              opacity: 0.4,
              blur: 2
            }}
            adjustCamera={1.5}
          >
            <Model url={proxiedUrl} />
          </Stage>
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Suspense>
      </Canvas>

      {/* Controls Hint - Hidden on mobile */}
      <div className="hidden sm:block absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="space-y-1">
          <div>🖱️ Left Click + Drag: Rotate</div>
          <div>🖱️ Right Click + Drag: Pan</div>
          <div>🔍 Scroll: Zoom</div>
        </div>
      </div>

      {/* Mobile Controls Hint */}
      <div className="sm:hidden absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1.5 rounded-lg backdrop-blur-sm">
        <div>👆 Touch + Drag to rotate</div>
      </div>

      {/* Model Info */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-sm border border-gray-200">
        <p className="text-xs text-gray-600">3D Model Ready</p>
      </div>
    </div>
  );
}

/**
 * use3DModelViewer Hook
 * Manages 3D model viewer state
 */

import { useState } from "react";

export interface Use3DModelViewerReturn {
  has3DModel: boolean;
  model3DUrl: string | null;
  show3DViewer: boolean;
  setHas3DModel: (has: boolean) => void;
  setModel3DUrl: (url: string | null) => void;
  openViewer: () => void;
  closeViewer: () => void;
}

export function use3DModelViewer(): Use3DModelViewerReturn {
  const [has3DModel, setHas3DModel] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  const [show3DViewer, setShow3DViewer] = useState(false);

  const openViewer = () => setShow3DViewer(true);
  const closeViewer = () => setShow3DViewer(false);

  return {
    has3DModel,
    model3DUrl,
    show3DViewer,
    setHas3DModel,
    setModel3DUrl,
    openViewer,
    closeViewer,
  };
}

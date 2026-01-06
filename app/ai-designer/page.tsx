import React, { Suspense } from "react";
import AIDesignerPage from "./designer";

export const AiDesigner = () => {
  return (
    <Suspense>
      <AIDesignerPage />
    </Suspense>
  );
};

export default AiDesigner;

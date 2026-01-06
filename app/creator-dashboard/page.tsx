import CreatorDashboard from "@/components/creator/main";
import { Suspense } from "react"; // wherever it lives


export default function Page() {
  return (
    <Suspense>
      <CreatorDashboard />
    </Suspense>
  );
}

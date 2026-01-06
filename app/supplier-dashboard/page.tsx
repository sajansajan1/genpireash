import SupplierDashboardPage from "@/components/supplier/main";
import { Suspense } from "react"; // wherever it lives


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupplierDashboardPage />
    </Suspense>
  );
}

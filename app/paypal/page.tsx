import { Suspense } from "react"; // wherever it lives
import PaypalCustomCheckoutPage from "./paypal";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaypalCustomCheckoutPage />
    </Suspense>
  );
}

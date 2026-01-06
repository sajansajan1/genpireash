import { Suspense } from "react"; // wherever it lives
import ResetPasswordPage from "./resetpassword";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

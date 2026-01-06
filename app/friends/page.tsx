import type { Metadata } from "next";
import FriendsClientPage from "./friends-client-page";

export const metadata: Metadata = {
  title: "Friends of Genpire | Creator Referral Program",
  description:
    "Join Friends of Genpire and earn rewards by sharing the AI tech pack generator with creators and brands. Get perks, early access, and commissions.",
};

export default function FriendsPage() {
  return <FriendsClientPage />;
}

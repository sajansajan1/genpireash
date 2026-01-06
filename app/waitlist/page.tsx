import type { Metadata } from "next"
import WaitlistClientPage from "./WaitlistClientPage"
import { Volkhov } from "next/font/google"

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Genpire | Turn Product Ideas Into Real Samples With AI & Vetted Suppliers",
  description:
    "Design custom products, generate spec sheets & tech packs, and get real-time quotes from vetted global manufacturers — all in minutes with Genpire AI.",
}

export default function WaitlistPage() {
  return <WaitlistClientPage />
}

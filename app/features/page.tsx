import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950">
      <LandingNavbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Features</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Coming soon...</p>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

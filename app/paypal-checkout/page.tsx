"use client"

import { useSearchParams } from "next/navigation"

import { useRouter } from "next/navigation"

function PaypalCustomCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const priceParam = searchParams.get("price")
  const description = searchParams.get("des") ?? ""
  const costPerCredit = searchParams.get("cost") ?? ""
  const price = Number.parseFloat(priceParam ?? "0")

  const cleanDescription = description.replace(/\s*credits?\s*$/i, "").trim()

  if (isNaN(price) || price <= 0) {
    return <div className="text-white text-center mt-10">Invalid payment request</div>
  }
  ;<div className="mb-8">
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
      💡 Curious Plan
    </div>
    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
      {cleanDescription} Genpire Credits
    </h1>
    <p className="text-lg text-gray-600 font-medium">Only {costPerCredit} per credit</p>
  </div>
}

export default PaypalCustomCheckoutPage

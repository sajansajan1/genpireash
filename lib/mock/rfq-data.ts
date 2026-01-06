export type RFQStatus = "open" | "responded" | "archived"

export interface RFQ {
  id: string
  title: string
  creator: {
    name: string
    isAnonymous: boolean
  }
  status: RFQStatus
  receivedAt: string
  productIdea: string
  techPack: {
    materials: string[]
    dimensions: string
    components: string[]
  }
  attachedFiles: {
    name: string
    type: string
    url: string
  }[]
  timeline: string
  quantity: number
  budget?: number
  response?: {
    samplePrice: number
    leadTime: string
    moq: number
    message: string
    sentAt: string
  }
}

export const mockRFQs: RFQ[] = [
  {
    id: "rfq-001",
    title: "Eco-friendly Cotton T-shirt",
    creator: {
      name: "Sarah Johnson",
      isAnonymous: false,
    },
    status: "open",
    receivedAt: "2025-04-01T10:30:00Z",
    productIdea:
      "Sustainable cotton t-shirt with minimalist design, focusing on eco-friendly materials and ethical production.",
    techPack: {
      materials: ["Organic Cotton", "Recycled Polyester Blend", "Low-impact Dyes"],
      dimensions: "Standard adult sizes S-XXL",
      components: ["Main Body", "Collar", "Sleeves", "Hem"],
    },
    attachedFiles: [
      {
        name: "tshirt_design.pdf",
        type: "pdf",
        url: "#",
      },
      {
        name: "color_palette.jpg",
        type: "image",
        url: "#",
      },
    ],
    timeline: "2-3 weeks",
    quantity: 50,
    budget: 15,
  },
  {
    id: "rfq-002",
    title: "Handcrafted Leather Wallet",
    creator: {
      name: "Anonymous Creator",
      isAnonymous: true,
    },
    status: "responded",
    receivedAt: "2025-03-28T14:15:00Z",
    productIdea:
      "Premium leather wallet with multiple card slots and minimalist design. Looking for high-quality craftsmanship.",
    techPack: {
      materials: ["Full-grain Leather", "Metal Snaps", "Nylon Thread"],
      dimensions: '4.5" x 3.5" when folded',
      components: ["Outer Shell", "Card Slots", "Bill Compartment", "Closure"],
    },
    attachedFiles: [
      {
        name: "wallet_sketch.pdf",
        type: "pdf",
        url: "#",
      },
    ],
    timeline: "3-4 weeks",
    quantity: 25,
    budget: 45,
    response: {
      samplePrice: 50,
      leadTime: "4 weeks",
      moq: 20,
      message:
        "We can produce this wallet with our premium vegetable-tanned leather. The sample price is slightly higher than your target due to the quality of materials we use. We can discuss options to reduce costs if needed.",
      sentAt: "2025-03-29T09:45:00Z",
    },
  },
  {
    id: "rfq-003",
    title: "Recycled Canvas Tote Bag",
    creator: {
      name: "Michael Chen",
      isAnonymous: false,
    },
    status: "archived",
    receivedAt: "2025-03-15T11:20:00Z",
    productIdea: "Durable tote bag made from recycled canvas with custom print. Needs to be washable and eco-friendly.",
    techPack: {
      materials: ["Recycled Canvas", "Cotton Webbing Handles", "Water-based Inks"],
      dimensions: '16" x 14" x 4"',
      components: ["Main Body", "Handles", "Inner Pocket", "Print Area"],
    },
    attachedFiles: [
      {
        name: "tote_design.ai",
        type: "ai",
        url: "#",
      },
      {
        name: "print_placement.jpg",
        type: "image",
        url: "#",
      },
    ],
    timeline: "2 weeks",
    quantity: 100,
    budget: 12,
    response: {
      samplePrice: 14,
      leadTime: "2 weeks",
      moq: 50,
      message:
        "We can produce these tote bags with our recycled canvas material. The price is slightly higher than your target due to the custom printing process. We offer volume discounts for orders over 200 units.",
      sentAt: "2025-03-16T15:30:00Z",
    },
  },
  {
    id: "rfq-004",
    title: "Knitted Wool Beanie",
    creator: {
      name: "Emma Wilson",
      isAnonymous: false,
    },
    status: "open",
    receivedAt: "2025-04-03T09:10:00Z",
    productIdea:
      "Cozy knitted beanie with custom embroidered logo. Looking for soft, warm materials suitable for winter wear.",
    techPack: {
      materials: ["Merino Wool", "Acrylic Blend", "Embroidery Thread"],
      dimensions: "One size fits most adults",
      components: ["Main Body", "Cuff", "Embroidered Logo"],
    },
    attachedFiles: [
      {
        name: "beanie_design.pdf",
        type: "pdf",
        url: "#",
      },
      {
        name: "logo_vector.svg",
        type: "svg",
        url: "#",
      },
    ],
    timeline: "3 weeks",
    quantity: 75,
    budget: 18,
  },
  {
    id: "rfq-005",
    title: "Sustainable Denim Jeans",
    creator: {
      name: "Alex Rodriguez",
      isAnonymous: false,
    },
    status: "open",
    receivedAt: "2025-04-05T16:45:00Z",
    productIdea:
      "Eco-friendly denim jeans with minimal water usage in production. Looking for modern fit with sustainable materials.",
    techPack: {
      materials: ["Organic Cotton Denim", "Recycled Metal Buttons", "Low-impact Dyes"],
      dimensions: "Standard sizes 28-38 waist",
      components: ["Main Body", "Pockets", "Waistband", "Hardware"],
    },
    attachedFiles: [
      {
        name: "jeans_tech_pack.pdf",
        type: "pdf",
        url: "#",
      },
      {
        name: "wash_samples.jpg",
        type: "image",
        url: "#",
      },
    ],
    timeline: "4-6 weeks",
    quantity: 100,
    budget: 35,
  },
]

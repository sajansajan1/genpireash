export const mockTechPackData = {
  productImage: {
    url: "/placeholder.svg?height=300&width=400&text=Canvas+Tote+Bag",
    description: "Canvas tote bag with leather straps and inner laptop pocket",
  },
  category: {
    primary: "Bags",
    subcategories: ["Tote", "Canvas", "Everyday"],
    description: "Everyday carry tote bag suitable for work, shopping, and casual use.",
  },
  materials: {
    items: [
      {
        name: "Canvas",
        description: "Heavy-duty 16oz cotton canvas for durability and structure",
        percentage: 80,
      },
      {
        name: "Leather",
        description: "Full-grain vegetable-tanned leather for straps and trim",
        percentage: 15,
      },
      {
        name: "Metal Hardware",
        description: "Brass rivets and magnetic snap closure",
        percentage: 5,
      },
    ],
    sustainability:
      "Medium-high sustainability rating. Canvas is natural and biodegradable. Leather is vegetable-tanned without harmful chemicals. Metal components are recyclable.",
  },
  dimensions: {
    measurements: [
      { name: "Height", value: "16 inches" },
      { name: "Width", value: "14 inches" },
      { name: "Depth", value: "5 inches" },
      { name: "Strap Drop", value: "9 inches" },
      { name: "Inner Pocket", value: "13 × 10 inches" },
      { name: "Weight", value: "1.2 lbs" },
    ],
    notes:
      "Dimensions allow for comfortable shoulder carry and fit standard laptops up to 15 inches. The depth provides ample storage while maintaining a sleek profile.",
  },
  packaging: {
    description:
      "Eco-friendly packaging designed to minimize waste while providing adequate protection during shipping.",
    materials: [
      "Recycled kraft paper bag",
      "Recycled cardboard insert for structure",
      "Paper-based tape",
      "Soy-based ink for printing",
    ],
    dimensions: 'Folded: 15" × 12" × 1", Shipping box: 16" × 13" × 6"',
  },
  colors: {
    palette: [
      { name: "Natural", hex: "#E8E4D5" },
      { name: "Navy", hex: "#1A2B3C" },
      { name: "Olive", hex: "#5D6C3C" },
      { name: "Terracotta", hex: "#A75E45" },
    ],
    notes:
      "All colors use low-impact, OEKO-TEX certified dyes. The canvas takes dye well with minimal color bleeding or fading over time.",
  },
  sizeRange: {
    sizes: ["One Size"],
    notes:
      "Standard size fits most adults. The bag's dimensions are optimized for everyday use while maintaining a balanced proportion that works well for various body types.",
  },
  styleNotes: {
    description: "The tote features a minimalist design with clean lines and functional details.",
    points: [
      "Double-stitched seams for durability",
      "Reinforced leather corners to prevent wear",
      "Interior laptop sleeve with padding",
      "Two interior slip pockets for small items",
      "Magnetic snap closure for security while maintaining easy access",
      "Leather brand patch on exterior bottom corner",
    ],
  },
  alternateDesigns: {
    images: [
      {
        url: "/placeholder.svg?height=200&width=200&text=Alternate+1",
        title: "With exterior pocket",
      },
      {
        url: "/placeholder.svg?height=200&width=200&text=Alternate+2",
        title: "Drawstring closure variant",
      },
      {
        url: "/placeholder.svg?height=200&width=200&text=Alternate+3",
        title: "Crossbody strap option",
      },
    ],
  },
}

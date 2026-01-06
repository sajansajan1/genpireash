"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";
import { useState } from "react";

const metadata: Metadata = {
  title: "Genpire Blog | AI Tech Pack Generation Insights & Industry Trends",
  description:
    "Stay updated with the latest in AI-powered product development, tech pack generation, and manufacturing insights. Expert articles on design, production, and innovation.",
  keywords:
    "tech pack blog, AI product development, manufacturing insights, design trends, product development blog, fashion tech, manufacturing technology",
};

export default function BlogPage() {
  const [showAll, setShowAll] = useState(false);

  const featuredPost = {
    title: "Our Vision: Powering the Future of Product Development",
    slug: "manifesto",
    excerpt:
      "How Genpire aims to become the platform that drives the majority of idea-to-product journeys globally within the next 3 years.",
    date: "2025-12-10",
    readTime: "8 min read",
    category: "Vision & Strategy",
    featured: true,
    image: "/blog/manifesto-hero.jpg",
  };

  const recentPosts = [
    {
      title: "Proactive AI for DTC Brands: Speed Without Sacrificing Clarity",
      slug: "proactive-ai-dtc-brands",
      excerpt:
        "How proactive AI helps DTC brands move fast while maintaining alignment across design, product, and manufacturing workflows.",
      date: "2025-01-21",
      readTime: "7 min read",
      category: "DTC Brands",
      image: "/blog/proactive-ai-dtc.jpg",
    },

    {
      title: "Proactive AI for Consumer Goods: Managing Complexity at Scale",
      slug: "proactive-ai-consumer-goods",
      excerpt:
        "How proactive AI helps consumer goods teams manage complexity, scale product lines, and prepare factory-ready outputs with consistency.",
      date: "2025-01-21",
      readTime: "8 min read",
      category: "Consumer Goods",
      image: "/blog/proactive-ai-consumer-goods.jpg",
    },

    {
      title: "Proactive AI in Creative Workflows: Keeping Momentum Without Friction",
      slug: "proactive-ai-creative-workflows",
      excerpt:
        "How proactive AI supports creative workflows by maintaining context, anticipating next steps, and reducing friction between design, product, and manufacturing teams.",
      date: "2025-01-21",
      readTime: "8 min read",
      category: "Creative",
      image: "/blog/proactive-ai-creative.jpg",
    },

    {
      title: "Proactive AI in Manufacturing: Solving Problems Before Production",
      slug: "proactive-ai-manufacturing",
      excerpt:
        "How proactive AI prepares clearer, factory-ready outputs earlier and reduces delays caused by incomplete specifications.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "Manufacturing",
      image: "/blog/proactive-ai-manufacturing.jpg",
    },

    {
      title: "Proactive AI in Product Design: Designing with Production in Mind",
      slug: "proactive-ai-product-design",
      excerpt:
        "How proactive AI helps product designers anticipate requirements early, improve specifications, and align creative work with manufacturing realities.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "Design",
      image: "/blog/proactive-ai-design.jpg",
    },

    {
      title: "The Proactive AI Manifesto: Beyond Reactive Tools",
      slug: "proactive-ai-manifesto",
      excerpt:
        "A manifesto on proactive AI systems that anticipate next steps, carry context forward, and remove friction from product development.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "Manifesto",
      image: "/blog/proactive-ai.jpg",
    },

    {
      title: "Tech Pack Automation: How AI Eliminates Manual Product Prep",
      slug: "tech-pack-automation",
      excerpt:
        "Discover how tech pack automation replaces manual spreadsheets, PDFs, and factory back-and-forth with AI-powered workflows.",
      date: "2025-12-22",
      readTime: "6 min read",
      category: "Automation",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Tech Pack Platform: The Future of Product Manufacturing",
      slug: "ai-tech-pack-platform",
      excerpt:
        "Learn how AI tech pack platforms replace PDFs with intelligent, factory-ready product workflows built for speed and scale.",
      date: "2025-12-22",
      readTime: "7 min read",
      category: "Platform",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "From Illustrator to Tech Pack: Why This Workflow Is Broken",
      slug: "from-illustrator-to-tech-pack",
      excerpt:
        "Moving from Illustrator files to tech packs causes delays, errors, and factory confusion. Here’s why the workflow no longer works.",
      date: "2025-12-22",
      readTime: "6 min read",
      category: "Workflow",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Product Design for Physical Products: A Complete Beginner's Guide",
      slug: "ai-product-design-physical-products-beginners-guide",
      excerpt:
        "Learn how AI product design works for physical products, from prompts to factory-ready files, and how Genpire helps you ship real products faster.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI in Product Development: From Concept to Factory-Ready in Days",
      slug: "ai-in-product-development-concept-to-factory-ready",
      excerpt:
        "Discover how AI reshapes product development timelines, taking you from concept to factory-ready tech packs in days with platforms like Genpire.",
      date: "2025-01-24",
      readTime: "8 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Tech Pack Generator: What It Is and When Your Brand Should Use One",
      slug: "ai-tech-pack-generator-when-to-use",
      excerpt:
        "Learn what an AI tech pack generator does, when brands should use it, and how Genpire automates production-ready product files.",
      date: "2025-01-24",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Tech Packs for Fashion and Apparel: A Practical Guide for Designers",
      slug: "ai-tech-packs-fashion-apparel-guide",
      excerpt:
        "See how AI tech packs work for fashion and apparel, and how designers can speed up sampling and production using Genpire's product workflows.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Product Design Tools: The Essential Stack for Modern Product Teams",
      slug: "ai-product-design-tools-essential-stack",
      excerpt:
        "Explore the core AI product design tools modern teams need, from image generation to tech pack automation, and how Genpire ties them together.",
      date: "2025-01-24",
      readTime: "8 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Generative AI for Industrial Design: Exploring More Options with Less Effort",
      slug: "generative-ai-industrial-design-more-options",
      excerpt:
        "Learn how generative AI changes industrial design, letting teams explore more product options with less effort using platforms like Genpire.",
      date: "2025-01-24",
      readTime: "9 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Product Design Workflow: From Prompt to Prototype to Production",
      slug: "ai-product-design-workflow-prompt-to-production",
      excerpt:
        "See a full AI product design workflow from prompt to prototype to production, and how Genpire manages each step for physical products.",
      date: "2025-01-24",
      readTime: "8 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI for Brand DNA: Keeping Collections Consistent Across Every Product Line",
      slug: "ai-for-brand-dna-consistent-collections",
      excerpt:
        "Discover how AI learns your brand DNA to keep product collections consistent, and how Genpire turns your past products into future-ready context.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "Branding",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI in Manufacturing Collaboration: Connecting Designers, Tech Packs, and Factories",
      slug: "ai-in-manufacturing-collaboration-designers-factories",
      excerpt:
        "Learn how AI improves collaboration between designers and factories by creating clearer tech packs and workflows, powered by platforms like Genpire.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI vs Traditional Tech Packs: Speed, Accuracy, and Cost Compared",
      slug: "ai-vs-traditional-tech-packs-comparison",
      excerpt:
        "Compare AI-generated tech packs with traditional methods on speed, accuracy, and cost, and see why brands are moving workflows into Genpire.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Product Design for Small Brands: How Indie Creators Compete with Enterprise",
      slug: "ai-product-design-for-small-brands",
      excerpt:
        "Discover how small brands and indie creators use AI product design to reach enterprise-level speed and quality with platforms like Genpire.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "Success Stories",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Product Design Mistakes to Avoid: Data, Prompts, and Factory Handoffs",
      slug: "ai-product-design-mistakes-to-avoid",
      excerpt:
        "Avoid common AI product design mistakes around data, prompts, and factory handoffs and learn how Genpire keeps your workflow grounded and manufacturable.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI Product Design for Footwear, Home Goods, and More: One Workflow, Many Categories",
      slug: "ai-product-design-footwear-home-goods-many-categories",
      excerpt:
        "Learn how one AI product design workflow can support footwear, home goods, toys, and more inside platforms like Genpire.",
      date: "2025-01-24",
      readTime: "8 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI-Powered Product Collections: Designing and Testing Multiple SKUs from a Single Brief",
      slug: "ai-powered-product-collections-multiple-skus",
      excerpt:
        "See how AI turns a single product brief into a full collection of SKUs and how Genpire helps you test and refine them before production.",
      date: "2025-01-24",
      readTime: "7 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "The Future of AI Product Design: Agentic Workflows, Live Tech Packs, and Autonomous RFQs",
      slug: "future-of-ai-product-design-agentic-workflows",
      excerpt:
        "Explore the future of AI product design: agentic workflows, live tech packs, and autonomous RFQs, and how Genpire is building toward it.",
      date: "2025-01-24",
      readTime: "9 min read",
      category: "Vision & Strategy",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "From Product Idea to Manufacturing: How AI Helps You Go from Concept to Creation",
      slug: "ai-product-idea-to-manufacturing",
      excerpt:
        "Learn how AI-powered tools like Genpire streamline the journey from initial concept to final product manufacturing.",
      date: "2025-01-20",
      readTime: "8 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Streamlining Product Development with AI Workflows",
      slug: "ai-product-development-workflow",
      excerpt:
        "See how AI-driven workflows can speed up product development for DTC startups, integrating idea generation, design, and manufacturing into one smooth process.",
      date: "2025-01-20",
      readTime: "7 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Low MOQ Manufacturing: Using AI to Produce Small Batches",
      slug: "low-moq-manufacturing-ai",
      excerpt:
        "Discover how AI tools help entrepreneurs manufacture products with low minimum order quantities, enabling small batch production and lean launches.",
      date: "2025-01-20",
      readTime: "6 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Tech Packs Made Easy: AI-Generated Factory-Ready Specs",
      slug: "ai-tech-packs-factory-ready",
      excerpt:
        "Learn how AI-generated tech packs take the hassle out of creating product specification sheets. Get factory-ready documentation quickly and accurately with Genpire.",
      date: "2025-01-20",
      readTime: "5 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI for Factory Communication: Speak the Same Language as Manufacturers",
      slug: "ai-factory-communication",
      excerpt:
        "Miscommunications with suppliers can cost time and money. See how AI-generated clear specs help you speak the same language as factories.",
      date: "2025-01-20",
      readTime: "6 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Brand-Building with AI: Designing Products That Stand Out",
      slug: "ai-brand-building-products",
      excerpt:
        "Find out how AI-powered product design can help emerging brands create unique, on-brand products that differentiate them in a crowded market.",
      date: "2025-01-21",
      readTime: "7 min read",
      category: "Branding",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI in Private Label: Launch Your Own Product Line Faster",
      slug: "ai-private-label-product-creation",
      excerpt:
        "Looking to create a private label product line? AI tools like Genpire help you customize and design products quickly.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "Branding",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Reduce Product Iterations with AI: Get It Right Sooner",
      slug: "reduce-product-iterations-ai",
      excerpt:
        "Cut down costly prototyping cycles by leveraging AI insights and precision. Learn how Genpire helps refine product designs virtually.",
      date: "2025-01-21",
      readTime: "7 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Rapid Prototyping: From Idea to Prototype in Days with AI",
      slug: "rapid-prototyping-ai",
      excerpt:
        "Why wait months for a prototype? See how AI-powered tools let you generate product designs and virtual prototypes in days.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI as Your Virtual Product Designer: No Design Team, No Problem",
      slug: "virtual-product-designer-ai",
      excerpt: "Solo founder without a design team? Discover how Genpire's AI acts as your virtual product designer.",
      date: "2025-01-21",
      readTime: "7 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Sketch to Factory: How AI Turns Your Drawings into Products",
      slug: "sketch-to-factory-ai",
      excerpt:
        "Got a napkin sketch or concept drawing? Learn how AI platforms like Genpire can transform rough sketches into detailed designs.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Data-Driven Ideation: Find Winning Product Ideas with AI",
      slug: "data-driven-product-ideation",
      excerpt:
        "Stop guessing what to make. AI tools analyze trends and consumer data to suggest product ideas with real market potential.",
      date: "2025-01-21",
      readTime: "7 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Validate Before You Invest: AI for Virtual Product Testing",
      slug: "ai-virtual-product-validation",
      excerpt:
        "Before spending on manufacturing, use AI to virtually test and refine your product ideas. Genpire helps you gather feedback on designs.",
      date: "2025-01-21",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Lean Product Launch: Small Batches and AI Iteration",
      slug: "lean-product-launch-ai",
      excerpt:
        "Embrace lean startup principles in product manufacturing. Learn how AI enables quick iteration and small batch production.",
      date: "2025-01-21",
      readTime: "7 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI-Powered Fashion Design: Launching Apparel Without a Big Team",
      slug: "ai-fashion-design-dtc",
      excerpt:
        "Dream of starting a fashion line? AI design tools level the playing field. See how Genpire helps new apparel brands.",
      date: "2025-01-21",
      readTime: "8 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "New Category, No Problem: Expand Your Product Line with AI",
      slug: "expand-product-line-ai",
      excerpt:
        "Want to create products outside your comfort zone? AI tools like Genpire let you design in new categories without prior expertise.",
      date: "2025-01-22",
      readTime: "6 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Cut Costs, Not Corners: AI for Budget-Friendly Product Development",
      slug: "cost-effective-product-development-ai",
      excerpt:
        "Product development can be expensive, but AI is changing that. Learn how Genpire helps you cut design and prototyping costs.",
      date: "2025-01-22",
      readTime: "7 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Co-Create with AI: How Teams Use Genpire to Collaborate on Product Design",
      slug: "team-collaboration-ai-product-design",
      excerpt:
        "AI tools aren't just for solo founders. Discover how product teams and designers use Genpire collaboratively.",
      date: "2025-01-22",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "The Future is Here: Why AI-Driven Product Development Is the New Normal",
      slug: "future-ai-product-development",
      excerpt:
        "AI is revolutionizing how products are created, from ideation to manufacturing. See why adopting AI-driven development is becoming the norm.",
      date: "2025-01-22",
      readTime: "8 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Traditional vs AI-Assisted Product Development: A Side-by-Side",
      slug: "traditional-vs-ai-product-development",
      excerpt:
        "How does AI-assisted product development stack up against the old-school way? We compare timelines, costs, and outcomes.",
      date: "2025-01-22",
      readTime: "7 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Tech Pack 101: Why AI-Generated Specs Leave No Room for Guesswork",
      slug: "tech-pack-101-ai-specs",
      excerpt:
        "New to tech packs? Learn what goes into a great product spec sheet and how AI-generated tech packs ensure every detail is covered.",
      date: "2025-01-22",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Stay Ahead of Trends: Rapid Product Line Expansion with AI",
      slug: "rapid-product-line-expansion-ai",
      excerpt: "Trends change quickly. AI helps you design and launch new products at the speed of culture.",
      date: "2025-01-22",
      readTime: "7 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Manufacturing Made Simple: AI Guidance for First-Time Founders",
      slug: "ai-guidance-first-time-manufacturing",
      excerpt:
        "New to manufacturing? AI can guide you through the complex steps—from material selection to finding the right supplier.",
      date: "2025-01-22",
      readTime: "8 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Digital Prototypes, Real Products: Using AI to Bridge the Gap",
      slug: "digital-prototypes-real-products",
      excerpt:
        "Learn how AI-generated digital prototypes (3D models, renders, etc.) can streamline the journey to a physical product.",
      date: "2025-01-22",
      readTime: "6 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Why One Platform Beats Many: Genpire vs Piecing Together Tools",
      slug: "all-in-one-ai-platform-vs-multiple-tools",
      excerpt:
        "Struggling with multiple apps and AI tools for product design? Discover the benefits of an all-in-one platform.",
      date: "2025-01-22",
      readTime: "6 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Designing for Demand: Ensuring Product-Market Fit with AI",
      slug: "product-market-fit-ai-design",
      excerpt:
        "Don't rely on guesswork for product-market fit. AI can analyze consumer preferences and feedback to ensure your product design aligns with market demand.",
      date: "2025-01-23",
      readTime: "7 min read",
      category: "Design Insights",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "AI and Sustainable Product Design: Reducing Waste in Development",
      slug: "sustainable-product-design-ai",
      excerpt:
        "Sustainable products start with sustainable design processes. Learn how AI can optimize materials, reduce unnecessary prototypes.",
      date: "2025-01-23",
      readTime: "8 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Smart Sourcing: Finding the Right Factory Faster with Genpire",
      slug: "smart-sourcing-right-factory",
      excerpt:
        "Tired of searching for manufacturers? See how Genpire streamlines sourcing by helping you connect with suitable factories.",
      date: "2025-01-23",
      readTime: "6 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Prototype Without Pain: No CAD or Agencies Needed with AI",
      slug: "prototype-without-cad-ai",
      excerpt:
        "No CAD skills? No problem. AI can help you create product designs and even 3D models without traditional CAD software.",
      date: "2025-01-23",
      readTime: "7 min read",
      category: "How-To Guide",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Big Ideas, Small Team: How Solo Founders Launch Products with AI",
      slug: "solo-founder-launch-ai",
      excerpt:
        "You don't need a full team to create a product anymore. See how solo founders and indie creators use AI platforms like Genpire.",
      date: "2025-01-23",
      readTime: "8 min read",
      category: "Success Stories",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "From Idea to Factory Floor: Startup Manufacturing Roadmap",
      slug: "idea-to-factory-roadmap",
      excerpt:
        "From idea to factory: follow a startup's manufacturing roadmap through concept, prototyping, sourcing and production, and see how Genpire supports each step.",
      date: "2025-01-15",
      readTime: "12 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Avoiding Manufacturing Pitfalls: Common Mistakes Startups Make",
      slug: "manufacturing-mistakes-startups",
      excerpt:
        "Startup founders often stumble in manufacturing. Learn common mistakes—like skipping prototypes or providing unclear specs—and how to avoid these pitfalls.",
      date: "2025-01-15",
      readTime: "11 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Manufacturing for DTC Brands: Building Your Product Pipeline",
      slug: "manufacturing-for-dtc",
      excerpt:
        "Agile manufacturing is key for DTC brands. Learn how to build a strong product pipeline with flexible low-MOQ suppliers, fast turnaround, and quality control.",
      date: "2025-01-15",
      readTime: "10 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Quality in Contract Manufacturing: Tips for Startups",
      slug: "quality-in-contract-manufacturing",
      excerpt:
        "Quality issues can derail a launch. Learn how to maintain high standards when outsourcing manufacturing – from clear specs and sample approval to inspections.",
      date: "2025-01-15",
      readTime: "9 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "The Future of Manufacturing: How Startups Can Leverage New Tech",
      slug: "future-of-manufacturing-startups",
      excerpt:
        "The manufacturing landscape is evolving with AI, robotics, and on-demand production. Find out how startups can ride these trends and use tools like Genpire.",
      date: "2025-01-15",
      readTime: "11 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Contract Manufacturing 101: Basics and Benefits for Startups",
      slug: "contract-manufacturing-101",
      excerpt:
        "Learn the fundamentals of contract manufacturing and how outsourcing production can save costs and accelerate product launches for startup founders.",
      date: "2025-01-15",
      readTime: "8 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "OEM Manufacturing for Startups: How It Works",
      slug: "oem-manufacturing-startups",
      excerpt:
        "Discover how OEM (Original Equipment Manufacturer) partnerships help startups produce products under their own brand without owning a factory.",
      date: "2025-01-15",
      readTime: "8 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Turnkey Manufacturing vs. Traditional Manufacturing: Which to Choose?",
      slug: "turnkey-vs-traditional-manufacturing",
      excerpt:
        "Explore the differences between turnkey and traditional manufacturing approaches, and discover which model best fits your startup's needs.",
      date: "2025-01-15",
      readTime: "10 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Launching Your Product with Low MOQ Manufacturing",
      slug: "low-moq-manufacturing",
      excerpt:
        "Learn how low minimum order quantity (MOQ) production helps you launch a product in small batches—reducing risk and validating demand before scaling up.",
      date: "2025-01-15",
      readTime: "9 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Creating a Private Label Brand: Launch Your Own Product Line",
      slug: "private-label-brand",
      excerpt:
        "Learn how to launch a private label brand by partnering with manufacturers to sell products under your own label—without having to develop them from scratch.",
      date: "2025-01-15",
      readTime: "10 min read",
      category: "Branding",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "The Future of AI in Manufacturing: 2024 Trends",
      slug: "ai-manufacturing-trends-2024",
      excerpt:
        "Exploring how artificial intelligence is revolutionizing product development and manufacturing processes across industries.",
      date: "2025-12-10",
      readTime: "6 min read",
      category: "Industry Trends",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Contract Manufacturing Services: How They Bring Ideas to Market",
      slug: "contract-manufacturing-services",
      excerpt:
        "Explore how contract manufacturing services help innovators bring products to market quickly and efficiently, from cost savings to specialized expertise.",
      date: "2025-12-10",
      readTime: "8 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Turnkey Manufacturing: One-Stop Production from Design to Delivery",
      slug: "turnkey-manufacturing",
      excerpt:
        "Learn how turnkey manufacturing offers a one-stop solution for production – handling design, fabrication, assembly, and even delivery.",
      date: "2025-12-10",
      readTime: "7 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Small Batch Production: Low-Volume Manufacturing for Agility and Risk Reduction",
      slug: "small-batch-production",
      excerpt:
        "Delve into small batch production and see how it helps startups reduce risk, gather feedback, and stay agile before scaling up.",
      date: "2025-12-10",
      readTime: "9 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "Prototype to Production: How to Transition from Prototype to Full-Scale Manufacturing",
      slug: "prototype-to-production",
      excerpt:
        "Moving from a prototype to full production is a big step. Learn the key stages and best practices for scaling up manufacturing.",
      date: "2025-12-10",
      readTime: "10 min read",
      category: "Manufacturing",
      image: "/blog/ai-trends.jpg",
    },
    {
      title: "From Sketch to Factory: The Complete Tech Pack Journey",
      slug: "sketch-to-factory-journey",
      excerpt:
        "A comprehensive guide to transforming your product ideas into manufacturing-ready technical specifications.",
      date: "2025-12-10",
      readTime: "12 min read",
      category: "How-To Guide",
      image: "/blog/tech-pack-journey.jpg",
    },
    {
      title: "Why Every Designer Needs AI-Powered Tech Packs",
      slug: "designers-need-ai-tech-packs",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "Best AI Tools for Product Creation in 2025 (Ranked)",
      slug: "best-ai-tools-product-creation-2025",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "Genpire vs CLO3D: Which Is Better for Fashion Designers?",
      slug: "genpire-vs-clo3d",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Prototype a Product Without CAD Software",
      slug: "prototype-product-without-cad",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "Best CAD Alternatives for Fashion Designers in 2025",
      slug: "best-cad-alternatives-fashion-designers-2025",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Design a Fashion Collection With No Experience",
      slug: "design-fashion-collection-no-experience",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "Genpire vs Illustrator: Which Works Better for Tech Packs?",
      slug: "genpire-vs-illustrator-tech-packs",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Find Factories for Your Product Idea in 2025",
      slug: "find-factories-product-idea",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "Best AI Tech Pack Generators (Ranked)",
      slug: "best-ai-tech-pack-generators",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Create Production-Ready Samples Without Agencies",
      slug: "create-production-samples-without-agencies",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Design Jewelry with AI (From Idea to Factory)",
      slug: "design-jewelry-with-ai",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "Best AI Tools for Furniture Design in 2025",
      slug: "ai-furniture-design-tools",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Design Gadgets with AI (Fast Prototyping Guide)",
      slug: "design-gadgets-with-ai",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How AI Is Changing Toy Design in 2025",
      slug: "ai-toy-design-platforms",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
    {
      title: "How to Design Home Goods with AI (From Kitchen to Decor)",
      slug: "design-home-goods-with-ai",
      excerpt:
        "Discover how AI is transforming the design process and why tech packs are essential for modern product development.",
      date: "2025-12-10",
      readTime: "5 min read",
      category: "Design Insights",
      image: "/blog/designers-ai.jpg",
    },
  ];

  const categories = [
    { name: "Vision & Strategy", count: 2, color: "bg-black" },
    { name: "Industry Trends", count: 10, color: "bg-taupe" },
    { name: "How-To Guides", count: 14, color: "bg-cream" },
    { name: "Design Insights", count: 7, color: "bg-black/70" },
    { name: "Manufacturing", count: 10, color: "bg-taupe/70" },
    { name: "Success Stories", count: 3, color: "bg-cream/70" },
    { name: "Branding", count: 4, color: "bg-navy" },
  ];

  const postsToDisplay = showAll ? recentPosts : recentPosts.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 md:py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-taupe/30 bg-taupe/20 px-4 py-1 text-sm text-cream mb-6">
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              <span>Insights & Innovation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">The Genpire Blog</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Discover the latest insights in AI-powered product development, manufacturing trends, and the future of
              design-to-production workflows.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-cream/80">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Weekly Updates</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Expert Insights</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>5-10 Min Reads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-taupe text-zinc-900 text-sm font-semibold px-3 py-1 rounded-full">
                Featured Article
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">Latest from Genpire</h2>
          </div>

          <Card className="glass-card border-none overflow-hidden">
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gradient-to-br from-zinc-900 to-zinc-600 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="text-6xl mb-4">🚀</div>
                      <h3 className="text-xl font-bold text-cream">Vision & Manifesto</h3>
                      <p className="text-cream/80 text-sm">The future of product development</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-black/10 text-zinc-900 text-xs font-medium px-2 py-1 rounded">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center text-sm text-zinc-900/60">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Jan 15, 2024</span>
                    </div>
                    <div className="flex items-center text-sm text-zinc-900/60">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 mb-4 text-balance">{featuredPost.title}</h3>

                  <p className="text-zinc-900/70 mb-6 text-pretty">{featuredPost.excerpt}</p>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button variant="default">
                      Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Recent Articles</h2>
            <Button
              variant="outline"
              className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "View All Posts"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsToDisplay.map((post, index) => (
              <Card key={index} className="glass-card border-none overflow-hidden h-full">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="h-48 bg-gradient-to-br from-navy/20 to-taupe/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {post.category === "Industry Trends" && "📈"}
                        {post.category === "How-To Guide" && "🛠️"}
                        {post.category === "Design Insights" && "✨"}
                        {post.category === "Manufacturing" && "🏭"}
                        {post.category === "Branding" && "🏷️"}
                        {post.category === "Success Stories" && "🌟"}
                        {post.category === "Vision & Strategy" && "🚀"}
                      </div>
                      <span className="text-xs text-zinc-900/60">{post.category}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-4 mb-3 text-xs text-zinc-900/60">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 mb-3 text-balance flex-grow">{post.title}</h3>

                    <p className="text-zinc-900/70 text-sm mb-4 text-pretty">{post.excerpt}</p>

                    <Link href={`/blog/${post.slug}`} className="mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-navy text-zinc-900 hover:bg-black/10 w-full bg-transparent"
                      >
                        Read More <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Newsletter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-center items-center">
            {/* Newsletter Signup */}
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-6">Stay Updated</h3>
              <Card className="glass-card border-none">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">📬</div>
                    <h4 className="text-lg font-semibold text-zinc-900 mb-2">Weekly Insights</h4>
                    <p className="text-zinc-900/70 text-sm">
                      Get the latest articles on AI, product development, and manufacturing trends delivered to your
                      inbox.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-2 border border-navy/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20"
                    />
                    <Button variant="default" className="w-full ">
                      Subscribe to Newsletter
                    </Button>
                  </div>

                  <p className="text-xs text-zinc-900/60 text-center mt-4">No spam. Unsubscribe at any time.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

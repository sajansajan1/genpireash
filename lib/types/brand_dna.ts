import { Zap, Heart, Crown, Leaf, Moon } from "lucide-react";

export type FormData = {
  websiteUrl: string;
  instagramHandle: string;
  tiktokHandle: string;
  pinterestHandle: string;
  brandName: string;
  category: string;
  targetAudience: string;
  tagline: string;
  styleKeywords: string[];
  colorPalette: string[];
  materials: string[];
  patterns: string[];
  tone: string;
  inspirationImages: string[];
  dosAndDonts: string;
  summary: string;
  logo_url?: string;
  status?: boolean;
  brand_title?: string;
  brand_subtitle?: string;
  brand_assets?: string[];
  company_techpack?: any;
  context_prompt?: string; // Pre-generated context prompt for AI injection
};

export const toneOptions = [
  { name: "Luxury", icon: Crown, color: "purple" },
  { name: "Sustainable", icon: Leaf, color: "green" },
  { name: "Performance", icon: Zap, color: "blue" },
  { name: "Playful", icon: Heart, color: "pink" },
  { name: "Minimal", icon: Moon, color: "gray" },
];

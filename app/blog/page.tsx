import React, { Suspense } from "react";
import { Metadata } from "next";
import BlogPage from "./blog";

export const metadata: Metadata = {
  title: "Genpire Blog — AI Product Creation, Manufacturing Insights & Industry Trends",
  description: "Explore expert guides, AI workflows, manufacturing insights, case studies, and product creation trends. The Genpire Blog helps creators, brands, and enterprise teams design and launch better products using AI.",
};

export const Blog = () => {
  return (
    <Suspense>
      <BlogPage />
    </Suspense>
  );
};

export default Blog;

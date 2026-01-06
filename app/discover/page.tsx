import React, { Suspense } from "react";
import { Metadata } from "next";
import DiscoverPage from "./discover";

export const metadata: Metadata = {
    title: "Made With Genpire | Real Products and AI Tech Packs",
    description: "Explore real products created with Genpire, from prompts to factory-ready tech packs. Discover collections, examples, and inspiration across categories.",
};

export const Discover = () => {
    return (
        <Suspense>
            <DiscoverPage />
        </Suspense>
    );
};

export default Discover;

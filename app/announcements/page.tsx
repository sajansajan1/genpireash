import React, { Suspense } from "react";
import { Metadata } from "next";
import GenpireAnnouncements from "./announcement";

export const metadata: Metadata = {
    title: "Genpire Updates | New Features and Product Announcements",
    description:
        "Product updates, new releases, and improvements to Genpire. Follow how our AI tech pack generator continues to evolve.",
}
export const Announcements = () => {
    return (
        <Suspense>
            <GenpireAnnouncements />
        </Suspense>
    );
};

export default Announcements;

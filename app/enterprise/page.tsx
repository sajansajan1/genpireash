import React, { Suspense } from "react";
import EnterprisePage from "./enterprise";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Tech Packs for Product & Design Teams | Genpire",
    description: "An AI-native platform for enterprise product teams to create tech packs, specs, and manufacturing-ready files faster across fashion, accessories, home goods, and more.",
};

export const Pricing = () => {
    return (
        <Suspense>
            <EnterprisePage />
        </Suspense>
    );
};

export default Pricing;

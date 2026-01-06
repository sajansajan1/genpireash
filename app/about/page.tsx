import React, { Suspense } from "react";
import AboutPage from "./about";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Genpire | The AI Tech Pack Platform",
  description: "Genpire helps you go from idea to factory-ready tech packs faster. It replaces manual documents, spreadsheets, and back and forth with one AI-native workflow.",
};

export const About = () => {
  return (
    <Suspense>
      <AboutPage />
    </Suspense>
  );
};

export default About;

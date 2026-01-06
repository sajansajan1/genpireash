"use client";

import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Linkedin, Users, Lightbulb, Settings, FileText, Factory, Heart, Zap, Target } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Section = ({ id, eyebrow, title, subtitle, children, className = "" }: any) => {
    return (
        <section id={id} className={`relative w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}>
            <div className="mx-auto max-w-6xl">
                {eyebrow && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-6 text-center"
                    >
                        <span
                            className="inline-flex px-4 py-2 gap-2 text-sm font-medium text-black border border-stone-300 rounded-full backdrop-blur-sm"
                            style={{ backgroundColor: "#D2C8BC", borderColor: "#1C1917" }}
                        >
                            {eyebrow}
                        </span>
                    </motion.div>
                )}
                {title && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">{title}</h2>
                        {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
                    </motion.div>
                )}
                {children}
            </div>
        </section>
    );
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <LandingNavbar />

            <main>
                <section className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-white to-stone-50">
                    <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:py-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-4">About Genpire</h1>
                                <p className="text-2xl text-stone-700 font-semibold mb-6">Turning Ideas Into Real-World Products</p>
                                <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
                                    The AI-to-Factory Platform for Creators, Designers, and Innovators
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-gradient-to-br from-white via-stone-50 to-stone-100 py-10 lg:py-10">
                    <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            {/* Header row with image + heading/subheading */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-center sm:text-left">
                                {/* Founder image (smaller + rounded) */}
                                <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0">
                                    <Image
                                        src="/founder.png"
                                        alt="Daniel Shoshani, CEO & Founder of Genpire"
                                        fill
                                        className="rounded-full object-cover shadow-md"
                                    />
                                </div>

                                {/* Heading + subheading */}
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Meet the Founder</h2>
                                    <p className="text-stone-700 font-semibold">Daniel Shoshani, CEO & Founder</p>
                                </div>
                            </div>

                            {/* Description below */}
                            <div className="text-stone-800 leading-relaxed space-y-4">
                                <p>
                                    Hi, I’m Daniel 👋 I’ve spent the past 12 years building companies in marketplaces and retail — always
                                    obsessed with one thing: how ideas become real products.
                                </p>
                                <p>
                                    Throughout my journey, I kept seeing the same pattern: so many great ideas never make it past a sketch
                                    because the process is complicated, slow, and built for insiders. I wanted to change that.
                                </p>
                                <p>
                                    That led me to create <strong>Genpire</strong> — an AI-native platform that lets anyone turn product
                                    ideas into something real: visuals you can evaluate, files your manufacturer understands, and a
                                    workflow that moves at the speed of creativity.
                                </p>
                                <p>
                                    I’m passionate about product, design, and technology that removes barriers. And I’m excited to help
                                    the next generation of creators build the brands and products they imagine. Let’s make more things
                                    real together 🚀
                                </p>
                            </div>

                            {/* Connect links */}
                            <div className="mt-4">
                                <h3 className="text-stone-800 font-semibold mb-2">Connect with me:</h3>
                                <ul className="space-y-1 text-stone-700 text-sm">
                                    <li>
                                        🔹{" "}
                                        <a
                                            href="https://www.linkedin.com/in/daniel-shoshani-21a68785/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black hover:underline"
                                        >
                                            LinkedIn
                                        </a>
                                    </li>
                                    <li>
                                        🔹{" "}
                                        <a
                                            href="https://x.com/Daniel_Shosh"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black hover:underline"
                                        >
                                            X (Twitter)
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Section className="bg-white">
                    <div className="max-w-4xl mx-auto">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-stone-700 leading-relaxed mb-6 text-center"
                        >
                            Every product starts with a spark — a sketch, a thought, a simple "what if." At Genpire, we're building
                            the bridge between imagination and manufacturing, helping anyone with an idea bring it to life faster than
                            ever.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-stone-100 rounded-2xl p-8 text-center border border-stone-200"
                        >
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">Our mission is simple:</h2>
                            <p className="text-lg text-stone-700 leading-relaxed">
                                To empower creators, brands, and startups to go from concept to production — smarter, easier, and
                                without friction.
                            </p>
                        </motion.div>
                    </div>
                </Section>

                {/* Vision to Reality */}
                <Section className="bg-gradient-to-br from-stone-50 to-white">
                    <div className="max-w-4xl mx-auto space-y-6 text-lg text-stone-700 leading-relaxed">
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            Traditional manufacturing is slow, complex, and built for the few. We believe it should be fast,
                            intelligent, and accessible to everyone.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Genpire combines AI-powered product design, prototyping automation, and smart factory workflows to make
                            creation seamless — across categories like fashion, footwear, furniture, electronics, and home goods.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            With just a prompt or a sketch, you can generate product visuals, refine details, create technical packs,
                            and connect directly with verified manufacturers — all in one place.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-center font-semibold text-stone-900 text-xl pt-4"
                        >
                            We call it the AI-to-Factory Workflow.
                        </motion.p>
                    </div>
                </Section>

                {/* How It Works */}
                <Section className="bg-white" title="How It Works">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Lightbulb className="w-6 h-6 text-stone-700" />,
                                title: "Generate",
                                description:
                                    "Start with a prompt or idea — Genpire's AI creates consistent, production-ready product visuals and technical drawings.",
                            },
                            {
                                icon: <Settings className="w-6 h-6 text-stone-700" />,
                                title: "Refine",
                                description: "Edit shapes, materials, and finishes in real time with our intuitive AI visual editor.",
                            },
                            {
                                icon: <FileText className="w-6 h-6 text-stone-700" />,
                                title: "Prepare",
                                description: "Generate tech packs and factory-ready specifications for manufacturing.",
                            },
                            {
                                icon: <Factory className="w-6 h-6 text-stone-700" />,
                                title: "Produce",
                                description: "Connect with vetted suppliers and production partners to bring your concept to life.",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-stone-900 mb-4">{item.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-lg text-stone-700 mt-12 font-medium"
                    >
                        What once took months now takes minutes — with precision, collaboration, and clarity at every step.
                    </motion.p>
                </Section>

                {/* Who We're Building For */}
                <Section
                    className="bg-gradient-to-br from-stone-50 to-white"
                    title="Who We're Building For"
                    subtitle="Genpire is designed for:"
                >
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            "Independent creators and makers launching their first product.",
                            "Brands exploring faster, more flexible production pipelines.",
                            "Product teams seeking better collaboration between design and manufacturing.",
                            "Anyone who believes innovation shouldn't depend on resources or connections.",
                        ].map((text, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm"
                            >
                                <Users className="w-8 h-8 text-stone-700 mb-4" />
                                <p className="text-stone-700 leading-relaxed">{text}</p>
                            </motion.div>
                        ))}
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-lg text-stone-700 mt-12 font-medium"
                    >
                        From sneakers to lighting to lifestyle goods — Genpire helps you make it real.
                    </motion.p>
                </Section>

                {/* Our Vision */}
                <Section className="bg-white" title="Our Vision">
                    <div className="max-w-4xl mx-auto space-y-6 text-lg text-stone-700 leading-relaxed">
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            We believe the future of manufacturing is AI-native — where creativity, design, and production are finally
                            connected by intelligence.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-medium text-stone-900"
                        >
                            A world where:
                        </motion.p>
                        <motion.ul
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4 pl-6"
                        >
                            {[
                                "Ideas move instantly from concept to prototype.",
                                "Factories understand and adapt to creative input.",
                                "Anyone, anywhere, can build with global manufacturing power behind them.",
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-stone-700 mt-1">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </motion.ul>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-center font-semibold text-stone-900 text-xl pt-6"
                        >
                            Genpire exists to power that world.
                        </motion.p>
                    </div>
                </Section>

                {/* Values Section */}
                <Section
                    className="bg-gradient-to-br from-stone-50 to-white"
                    title="Why Creators Choose Genpire"
                    subtitle="We're not just another AI tool. We're your partner in bringing physical products to life."
                >
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Heart className="w-6 h-6 text-stone-700" />,
                                title: "Creator-First",
                                description:
                                    "Every feature is designed with creators in mind. We understand your workflow and build tools that actually help.",
                            },
                            {
                                icon: <Zap className="w-6 h-6 text-stone-700" />,
                                title: "Lightning Fast",
                                description:
                                    "Generate professional tech packs in under 60 seconds. No more waiting weeks for technical documentation.",
                            },
                            {
                                icon: <Target className="w-6 h-6 text-stone-700" />,
                                title: "Production-Ready",
                                description:
                                    "Our AI understands manufacturing requirements, ensuring your tech packs are ready for factory production.",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-stone-200"
                            >
                                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-stone-900 mb-4">{item.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                {/* CTA Section */}
                <section className="py-16 md:py-24 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Movement</h2>
                            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                                We're not just building a platform — we're enabling a new generation of makers. If you believe
                                technology should accelerate creativity, not complicate it — welcome to Genpire.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-xl">
                                    <Link href="/">Start Creating Today</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="border-white text-white hover:bg-white/10 bg-transparent hover:text-white rounded-xl"
                                >
                                    See What Others Built
                                </Button>
                            </div>

                            <div className="mb-12">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-stone-100 hover:bg-stone-200 text-black rounded-xl"
                                    style={{ backgroundColor: "#D2C8BC" }}
                                >
                                    <Link
                                        href="https://www.linkedin.com/company/genpire"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        Join Our Team
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

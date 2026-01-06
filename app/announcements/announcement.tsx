"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { motion } from "framer-motion"
import {
    Rocket,
    Sparkles,
    Palette,
    Layers,
    Factory,
    Brain,
    Copy,
    Globe,
    CheckCircle,
    Zap,
    Clock,
    Layout,
    CreditCardIcon,
    CopyIcon
} from "lucide-react"
import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react"

const Section = ({ id, eyebrow, title, subtitle, children, className = "" }: any) => {
    return (
        <section id={id} className={`relative w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-24 ${className}`}>
            <div className="mx-auto max-w-7xl">
                {eyebrow && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 text-center"
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
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl tracking-tight text-stone-900 sm:text-4xl lg:text-5xl mb-6 font-semibold">
                            {title}
                        </h2>
                        {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
                    </motion.div>
                )}
                {children}
            </div>
        </section>
    );
};


export default function GenpireAnnouncements() {
    const [api, setApi] = useState<CarouselApi>()

    useEffect(() => {
        if (!api) {
            return
        }

        const interval = setInterval(() => {
            api.scrollNext()
        }, 2000)

        return () => clearInterval(interval)
    }, [api])

    return (
        <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff_0%,#fafaf9_100%)]"></div>

                <div className="relative mx-auto max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm text-sm font-medium text-stone-800">
                            <Rocket className="h-4 w-4 text-stone-600" />
                            Big Updates Are Live
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-stone-900 mb-8 tracking-tight leading-[1.1]"
                    >
                        A New Era of <br className="hidden sm:block" />
                        <span className="text-stone-600">Product Creation</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        We've shipped a major upgrade across Genpire — rethinking how products are created,
                        shared, and prepared for manufacturing with AI.
                    </motion.p>
                </div>
            </section>

            {/* Separator */}
            <div className="w-full h-px bg-stone-200" />

            {/* Core Features Grid */}
            <Section
                id="features"
                eyebrow={<><Sparkles className="h-4 w-4" /> What's New</>}
                title="Reimagined from the Ground Up"
                className="bg-stone-50"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <FeatureCard
                        delay={0.1}
                        icon={<Brain className="h-6 w-6 text-stone-700" />}
                        title="1. A New Way to Create"
                        description="Start however you want — from a prompt, an existing design, or a quick sketch. Approve a front view, then instantly move into multi-view generation."
                    />

                    {/* Feature 2 */}
                    <FeatureCard
                        delay={0.2}
                        icon={<Palette className="h-6 w-6 text-stone-700" />}
                        title="2. Studio Level Up"
                        description="Create more than product visuals — create a whole brand. Generate logos, prints, and social creatives in one unified workspace."
                    />

                    {/* Feature 3 */}
                    <FeatureCard
                        delay={0.3}
                        icon={<Layers className="h-6 w-6 text-stone-700" />}
                        title="3. Smart Pricing Plans"
                        description="Built to scale with you. Introducing the Super Plan for power users and teams who need higher limits and dedicated support."
                    />

                    {/* Feature 4 */}
                    <FeatureCard
                        delay={0.4}
                        icon={<Factory className="h-6 w-6 text-stone-700" />}
                        title="4. Agentic Product Page"
                        description="Built for real manufacturing. An AI-powered product page designed for seamless collaboration with manufacturers and stakeholders."
                    />

                    {/* Feature 5 */}
                    <FeatureCard
                        delay={0.5}
                        icon={<Zap className="h-6 w-6 text-stone-700" />}
                        title="5. Factory-Ready Files"
                        description="Generate everything factories need — construction details, close-ups, technical sketches. What used to take weeks now takes minutes."
                    />

                    {/* Feature 6 */}
                    <FeatureCard
                        delay={0.6}
                        icon={<Sparkles className="h-6 w-6 text-stone-700" />}
                        title="6. Brand DNA"
                        description="Stay on-brand, always. Sync your brand identity, upload catalogs, and let Genpire adapt to your style automatically."
                    />
                </div>
            </Section>

            {/* Secondary Highlights */}
            <Section
                className="bg-white"
                title="More Exciting Updates"
                subtitle="We've polished every corner of the platform to improve your workflow."
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: <CreditCardIcon className="h-5 w-5" />,
                            title: "Clearer Credits",
                            description: "Updated to match creation value. Advanced models use 2 credits, others use 1 credit for 3 outputs."
                        },
                        {
                            icon: <CopyIcon className="h-5 w-5" />,
                            title: "Duplicate Products",
                            description: "Build collections faster by duplicating products and creating variants from designs you love."
                        },
                        {
                            icon: <Globe className="h-5 w-5" />,
                            title: "Public Products",
                            description: "Share your products with the community, gather feedback, and test demand before production."
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:border-stone-200 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4 text-stone-900">
                                {feature.icon}
                                <h3 className="text-lg font-bold">{feature.title}</h3>
                            </div>
                            <p className="text-stone-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Studio Deep Dive */}
            <Section
                className="bg-stone-100"
                eyebrow={<><CheckCircle className="h-4 w-4" /> Production Ready</>}
                title="Launching a Collection?"
            >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-stone-900">Streamlined for Speed</h3>
                        <p className="text-lg text-stone-600 leading-relaxed">
                            Generate prints and place them directly onto products — no extra tools needed.
                            We've eliminated the friction between "idea" and "asset".
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                "Choose 1 / 3 / 6 images per creation",
                                "Access Media Library directly inside editor",
                                "Generate logos, prints, and social creatives",
                                "Create ready-made prompt catalogs"
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-6 w-6 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="h-4 w-4 text-stone-700" />
                                    </div>
                                    <span className="text-stone-700">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Abstract Visual Representation */}
                    {/* Carousel Visual Representation */}
                    <div className="w-full max-w-lg mx-auto">
                        <Carousel
                            setApi={setApi}
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent>
                                {[
                                    "/Group 581.png",
                                    "/Group 582.png",
                                    "/Group 583.png",
                                    "/Group 584.png",
                                    "/Group 585.png",
                                ].map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <div className="overflow-hidden rounded-3xl shadow-xl border border-stone-100">
                                                <img
                                                    src={image}
                                                    alt={`Feature preview ${index + 1}`}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="hidden sm:block">
                                <CarouselPrevious />
                                <CarouselNext />
                            </div>
                        </Carousel>
                    </div>
                </div>
            </Section>

            {/* Manufacturing Section */}
            <Section
                className="bg-white"
                title="Goodbye PDF Tech Packs"
                subtitle="Genpire now uses an agentic, AI-powered product page — designed for collaboration with manufacturers and stakeholders."
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <Card
                        icon={<Layout className="h-8 w-8 text-stone-900" />}
                        title="View Every Detail"
                        text="Inspect every stitch. access files in full resolution without digging through email chains."
                    />
                    <Card
                        icon={<Brain className="h-8 w-8 text-stone-900" />}
                        title="AI-Powered Q&A"
                        text="Manufacturers can ask AI questions about specs, materials, or construction instantly."
                    />
                    <Card
                        icon={<Clock className="h-8 w-8 text-stone-900" />}
                        title="10× Faster"
                        text="Reduce sampling time by up to 10× with clear, standardized automated data."
                    />
                </div>
            </Section>

            {/* Final CTA */}
            <section className="py-24 px-4 bg-stone-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                <div className="relative max-w-4xl mx-auto text-center z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">What's Next?</h2>
                    <p className="text-xl text-stone-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                        This update is the foundation of Genpire's next chapter.
                        <br />Ready to experience the new standard?
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-stone-900 hover:bg-stone-100 h-14 px-8 rounded-full text-lg font-semibold shadow-2xl hover:shadow-white/20 transition-all"
                    >
                        <Link href="/">
                            <Rocket className="mr-2 h-5 w-5" />
                            Start Creating Now
                        </Link>
                    </Button>
                </div>
            </section>

            <LandingFooter />
        </div>
    )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="group p-8 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
            <div className="h-12 w-12 rounded-xl bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center mb-6 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">{title}</h3>
            <p className="text-stone-600 leading-relaxed">
                {description}
            </p>
        </motion.div>
    )
}

function Card({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-2xl bg-stone-50 border border-stone-100 text-center"
        >
            <div className="flex justify-center mb-6">{icon}</div>
            <h3 className="text-lg font-bold text-stone-900 mb-3">{title}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{text}</p>
        </motion.div>
    )
}

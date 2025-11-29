"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PiPalette, PiBriefcase, PiRocket } from "react-icons/pi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ColorBends from "@/components/ColorBends";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

export default function AnimatedHomePage() {
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Hide scrollbar on mount
        document.documentElement.classList.add("hide-scrollbar");
        document.body.classList.add("hide-scrollbar");

        // Cleanup: remove class on unmount
        return () => {
            document.documentElement.classList.remove("hide-scrollbar");
            document.body.classList.remove("hide-scrollbar");
        };
    }, []);

    const handleLoginClick = () => {
        setIsLoginLoading(true);
        router.push("/login");
    };

    const handleDemoClick = () => {
        setIsDemoLoading(true);
        router.push("/demo-company");
    };

    return (
        <AnimatePresence>
            <div className="flex min-h-svh flex-col">
                <div className="fixed inset-0 -z-10">
                    <ColorBends
                        colors={["#ff0000", "#00ff00", "#0000ff"]}
                        rotation={30}
                        speed={0.3}
                        scale={1.3}
                        frequency={1.4}
                        warpStrength={1.2}
                        mouseInfluence={0.8}
                        parallax={0.6}
                        noise={0.08}
                        transparent
                    />
                </div>

                <motion.header
                    className="border-b"
                    initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                >
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <div className="text-xl font-bold">Careers Page Builder</div>
                        <Button onClick={handleLoginClick} disabled={isLoginLoading}>
                            {isLoginLoading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </div>
                </motion.header>

                <main className="flex flex-1 py-12 flex-col items-center justify-center px-4 text-center">
                    <div className="max-w-3xl space-y-8">
                        <motion.h1
                            className="text-4xl font-bold tracking-tight sm:text-6xl"
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            Build Beautiful Careers Pages in Minutes
                        </motion.h1>

                        <motion.p
                            className="text-lg text-muted-foreground sm:text-xl"
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            Create stunning, customizable careers pages for your company. Manage
                            jobs, track applications, and attract top talent, all in one place.
                        </motion.p>

                        <motion.div
                            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <Button
                                size="lg"
                                className="w-full sm:w-auto max-w-xs"
                                onClick={handleLoginClick}
                                disabled={isLoginLoading}
                            >
                                {isLoginLoading ? (
                                    <>
                                        <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Get Started"
                                )}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto max-w-xs"
                                onClick={handleDemoClick}
                                disabled={isDemoLoading}
                            >
                                {isDemoLoading ? (
                                    <>
                                        <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "View Demo"
                                )}
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        className="mt-16 grid gap-8 sm:grid-cols-3"
                        initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <motion.div
                            className="space-y-2"
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            <div className="flex justify-center">
                                <PiPalette className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold">Customizable Design</h3>
                            <p className="text-sm text-muted-foreground">
                                Build your careers page with drag-and-drop sections
                            </p>
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                        >
                            <div className="flex justify-center">
                                <PiBriefcase className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold">Job Management</h3>
                            <p className="text-sm text-muted-foreground">
                                Post jobs and manage applications in one dashboard
                            </p>
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            <div className="flex justify-center">
                                <PiRocket className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold">SEO Optimized</h3>
                            <p className="text-sm text-muted-foreground">
                                Server-rendered pages with structured data for search engines
                            </p>
                        </motion.div>
                    </motion.div>
                </main>

                <Footer />
            </div>
        </AnimatePresence>
    );
}

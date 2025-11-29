"use client";

import { motion } from "framer-motion";

export default function Footer() {
    return (
        <motion.footer
            className="mt-auto border-t bg-background/5 backdrop-blur-sm py-6"
            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.9, duration: 0.6 }}
        >
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Careers Page Builder. All rights reserved.
            </div>
        </motion.footer>
    );
}

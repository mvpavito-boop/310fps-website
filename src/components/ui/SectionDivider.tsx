"use client";

import { motion } from "framer-motion";

export function SectionDivider() {
    return (
        <div className="relative z-10 flex w-full items-center justify-center overflow-hidden bg-[#07080C] py-2 md:py-3">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 0.9 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-1/2 h-px w-full max-w-4xl origin-center -translate-y-1/2 bg-gradient-to-r from-transparent via-[#FF6A00]/22 to-transparent"
            />
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 0.8 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-1/2 h-px w-full max-w-xs origin-center -translate-y-1/2 bg-gradient-to-r from-transparent via-white/28 to-transparent"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.35, delay: 0.35 }}
                className="absolute z-10 h-1.5 w-10 border border-white/[0.1] bg-[#111522]"
            />
        </div>
    );
}

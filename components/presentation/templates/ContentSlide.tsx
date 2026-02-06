"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ContentSlideProps {
    title: string;
    content: string[]; // We can use this for the bullet points
    subtitle?: string; // For "Blockchain Engineer..."
    presenter?: string; // For "P S Bharath..."
    step?: number; // Current step/bullet index provided by Deck
}

export default function ContentSlide({ title, content, subtitle, step = 0 }: ContentSlideProps) {
    return (
        // Exact Purple Gradient Background from Screenshot 2
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#6d28d9] to-[#8b5cf6] text-white p-4 sm:p-6 md:p-8 lg:p-12">

            {/* 1. Top Left Logo (White, Large) */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-12 md:left-12 w-32 h-12 sm:w-48 sm:h-16 md:w-64 md:h-20 z-20">
                <Image
                    src="/ART WORKS/PNG Files/Horizontal Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Horizontal Logo White.png"
                    alt="OneDev Logo"
                    fill
                    className="object-contain object-left"
                />
            </div>

            {/* 2. Top Right Giant Chevron Shape (White, clipped) */}
            <div className="absolute -top-[20%] -right-[10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] z-0 opacity-20">
                <Image
                    src="/ART WORKS/PNG Files/Logomark Only/Onedev Logo-RGB-DIGITALFILES_Logo Mark White.png"
                    alt="Abstract Chevron Background"
                    fill
                    className="object-contain"
                />
            </div>

            {/* 3. Main Content Content Container */}
            <div className="relative z-10 mt-20 sm:mt-24 md:mt-28 lg:mt-32 ml-2 sm:ml-3 md:ml-4 h-full flex flex-col">
                {/* Name / Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-1 sm:mb-2 tracking-wide font-serif">
                    {title}
                </h2>

                {/* Subtitle / Role */}
                {subtitle && (
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-100 mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-light">
                        {subtitle}
                    </p>
                )}

                {/* Bullet Points */}
                <ul className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-5xl">
                    {content.map((item, idx) => (
                        <motion.li
                            key={idx}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: idx < step ? 1 : 0,
                                x: idx < step ? 0 : -20
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <span className="text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3 md:mr-4 mt-1 opacity-80">•</span>
                            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed opacity-90">
                                {item}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* 4. Bottom Right Logo (Small, Stacked/Vertical) */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 z-20">
                <Image
                    src="/ART WORKS/PNG Files/Vertical Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Vertical Logo White.png"
                    alt="OneDev Bottom Logo"
                    fill
                    className="object-contain object-bottom-right"
                />
            </div>
        </div>
    );
}

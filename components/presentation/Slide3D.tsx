"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Slide3DProps {
    children: React.ReactNode;
    isActive: boolean;
    className?: string;
}

export default function Slide3D({ children, isActive, className }: Slide3DProps) {
    return (
        <div className="w-full h-full flex items-center justify-center perspective-1000">
            <motion.div
                initial={false}
                animate={{
                    scale: isActive ? 1 : 0.8,
                    opacity: isActive ? 1 : 0,
                    rotateX: isActive ? 0 : 10,
                    rotateY: isActive ? 0 : -10,
                    z: isActive ? 0 : -100,
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.5
                }}
                className={cn(
                    "relative w-[80vw] h-[80vh] overflow-hidden rounded-3xl shadow-2xl",
                    // Base white background, but allows override
                    "bg-white",
                    className
                )}
                style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

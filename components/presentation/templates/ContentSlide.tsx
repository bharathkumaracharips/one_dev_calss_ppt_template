import React from 'react';
import Image from 'next/image';

interface ContentSlideProps {
    title: string;
    content: string[]; // We can use this for the bullet points
    subtitle?: string; // For "Blockchain Engineer..."
    presenter?: string; // For "P S Bharath..."
}

export default function ContentSlide({ title, content, subtitle }: ContentSlideProps) {
    return (
        // Exact Purple Gradient Background from Screenshot 2
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#6d28d9] to-[#8b5cf6] text-white p-12">

            {/* 1. Top Left Logo (White, Large) */}
            <div className="absolute top-12 left-12 w-64 h-20 z-20">
                <Image
                    src="/ART WORKS/PNG Files/Horizontal Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Horizontal Logo White.png"
                    alt="OneDev Logo"
                    fill
                    className="object-contain object-left"
                />
            </div>

            {/* 2. Top Right Giant Chevron Shape (White, clipped) */}
            <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] z-0 opacity-20">
                <Image
                    src="/ART WORKS/PNG Files/Logomark Only/Onedev Logo-RGB-DIGITALFILES_Logo Mark White.png"
                    alt="Abstract Chevron Background"
                    fill
                    className="object-contain"
                />
            </div>

            {/* 3. Main Content Content Container */}
            <div className="relative z-10 mt-32 ml-4 h-full flex flex-col">
                {/* Name / Title */}
                <h2 className="text-5xl font-medium mb-2 tracking-wide font-serif">
                    {title}
                </h2>

                {/* Subtitle / Role */}
                {subtitle && (
                    <p className="text-3xl text-purple-100 mb-12 font-light">
                        {subtitle}
                    </p>
                )}

                {/* Bullet Points */}
                <ul className="space-y-6 max-w-5xl">
                    {content.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                            <span className="text-2xl mr-4 mt-1 opacity-80">•</span>
                            <span className="text-2xl font-light leading-relaxed opacity-90">
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 4. Bottom Right Logo (Small, Stacked/Vertical) */}
            <div className="absolute bottom-8 right-8 w-24 h-24 z-20">
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

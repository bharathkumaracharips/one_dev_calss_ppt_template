import React from 'react';
import Image from 'next/image';

interface TitleSlideProps {
    title: string;
    subtitle?: string;
    presenter?: string;
}

export default function TitleSlide({ title, subtitle, presenter }: TitleSlideProps) {
    return (
        // Exact Dark Navy Background
        <div className="w-full h-full relative overflow-hidden bg-[#0a0520] text-white">

            {/* 1. Top Left Logo (White) */}
            <div className="absolute top-12 left-12 w-56 h-20 z-20">
                <Image
                    src="/ART WORKS/PNG Files/Horizontal Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Horizontal Logo White.png"
                    alt="OneDev Logo"
                    fill
                    className="object-contain object-left"
                    priority
                />
            </div>

            {/* 2. Top Right Giant Chevron Shape (White) */}
            <div className="absolute -top-[10%] -right-[15%] w-[700px] h-[700px] z-10 opacity-100">
                <Image
                    src="/ART WORKS/PNG Files/Logomark Only/Onedev Logo-RGB-DIGITALFILES_Logo Mark White.png"
                    alt="Abstract Chevron"
                    fill
                    className="object-contain object-right-top"
                />
            </div>

            {/* Main Title Text - Moved out of the card container to prevent print clipping */}
            {/* Positioned absolutely relative to the slide root, safe from right-edge dependency */}
            <div className="absolute top-1/2 left-24 transform -translate-y-1/2 z-30 max-w-2xl pointer-events-auto text-left">
                {title && <h1 className="text-6xl font-bold mb-4 leading-tight drop-shadow-lg">{title}</h1>}
                {subtitle && <p className="text-2xl text-purple-200">{subtitle}</p>}
            </div>

            {/* 3. Bottom/Right Card Composition */}
            {/* Container anchored to bottom right - Contains CARDS ONLY now */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] pointer-events-none overflow-visible">

                {/* 
            CARD GROUP 
            Refined to match "Original" image:
            - Left/Back card is tall, tilted right.
            - Right/Front card is smaller, tilted right, contains Logo.
            - Both are low, emerging from bottom.
          */}

                {/* Back Card (Left one in the group) */}
                {/* Lighter purple, tilted, sticking up - Height reduced as per request */}
                <div className="absolute bottom-[-10%] right-[25%] w-70 h-[200px] bg-[#a78bfa] rounded-[3rem] transform shadow-2xl z-10" />

                {/* Front Card (Right one in the group) with Logo */}
                {/* Darker purple, lower, contains logo */}
                <div className="absolute bottom-[-25%] right-[5%] w-72 h-80 bg-[#7c3aed] rounded-[2.5rem] transform rotate-[5deg] shadow-2xl z-20 flex items-start justify-center pt-8">
                    {/* Logo Container - positioned at top of card so it's visible */}
                    <div className="relative w-32 h-32 transform -rotate-[5deg]">
                        <Image
                            src="/ART WORKS/PNG Files/Vertical Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Vertical Logo White.png"
                            alt="Card Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

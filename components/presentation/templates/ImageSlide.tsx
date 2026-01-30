import React from 'react';

interface ImageSlideProps {
    title?: string;
    imageSrc: string;
    caption?: string;
}

export default function ImageSlide({ title, imageSrc, caption }: ImageSlideProps) {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-50 relative p-12">
            {title && (
                <h2 className="text-4xl font-bold mb-8 absolute top-8 left-12 text-gray-900 z-10 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                    {title}
                </h2>
            )}

            <div className="relative w-full h-full flex items-center justify-center">
                {/* Placeholder or actual image usage */}
                <div className="w-full h-[80%] bg-white rounded-xl flex items-center justify-center shadow-inner border border-gray-200">
                    <span className="text-gray-400 text-xl font-mono">Image Asset: {imageSrc}</span>
                </div>
            </div>

            {caption && <p className="absolute bottom-8 text-xl text-gray-600 bg-white/90 px-6 py-2 rounded-full shadow-sm">{caption}</p>}
        </div>
    );
}

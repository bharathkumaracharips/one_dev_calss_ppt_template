import React from 'react';

interface SlideProps {
    children: React.ReactNode;
    className?: string;
}

export default function Slide({ children, className = '' }: SlideProps) {
    return (
        <div className={`w-full h-full flex flex-col p-12 bg-white text-gray-900 ${className}`}>
            {children}
        </div>
    );
}

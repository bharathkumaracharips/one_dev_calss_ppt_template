"use client";

import React, { useState } from 'react';

interface Lecture {
    id: string;
    title: string;
}

interface LectureSidebarProps {
    lectures: Lecture[];
    activeLectureId: string;
    onSelectLecture: (id: string) => void;
}

export default function LectureSidebar({ lectures, activeLectureId, onSelectLecture }: LectureSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed top-4 left-4 z-50 p-2 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-black/80 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                title="Open Lecture Menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>

            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-neutral-900 border-r border-white/10 z-[70] transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white tracking-wide">Lectures</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-white/50 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {lectures.map((lecture) => {
                            const isActive = lecture.id === activeLectureId;
                            return (
                                <button
                                    key={lecture.id}
                                    onClick={() => {
                                        onSelectLecture(lecture.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${isActive ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <p className="font-medium text-sm">{lecture.title}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <p className="text-xs text-center text-white/30">
                            OneDev Blockchain Course
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

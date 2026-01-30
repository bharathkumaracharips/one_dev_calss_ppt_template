import React from 'react';

export const presentationData = [
    {
        type: 'title',
        // Matches Screenshot 1 (Abstract visual, minimal text)
        props: {
            title: "", // The screenshot has no big title text, mostly logos
            subtitle: "",
        }
    },
    {
        type: 'content',
        // Matches Screenshot 2 Content
        props: {
            title: "P S Bharath Kumar Achari",
            subtitle: "Blockchain Engineer & Educator",
            content: [
                "Production-Grade Decentralized Systems: Experienced in building and deploying robust decentralized systems.",
                "Protocol-Level Design: Expertise in custom consensus logic and runtime optimization for blockchain protocols.",
                "Smart Contract Development: Proven ability to build smart contract-driven platforms, navigating real-world constraints.",
                "Core Focus: Prioritizes scalability, security risk mitigation, and analyzing system behavior at scale.",
                "Mentorship & Education: Dedicated to mentoring learners, from technical graduates to PhD scholars.",
                "Teaching Philosophy: Utilizes a 'problem-first' approach: understanding limitations of existing models, then developing solutions through concepts and hands-on projects."
            ]
        }
    },
    {
        type: 'title',
        props: {
            title: "Thank You",
            subtitle: "End of Presentation"
        }
    }
];

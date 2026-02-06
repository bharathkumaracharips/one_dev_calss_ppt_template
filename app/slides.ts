import React from 'react';

// Lecture 0 Data (Program Orientation)
const lecture0 = [
    {
        type: 'title',
        props: {
            title: "Module 1: Foundations\nLecture 0: Program Orientation & How to Learn This Course",
            subtitle: "FROM LEARNING TO GLOBAL IMPACT",
            presenter: "P. S. Bharath Kumar Achari",
            tagline: "OneDev Blockchain Program"
        }
    },
    {
        type: 'content',
        props: {
            title: "Why This Program Exists",
            subtitle: "Why OneDev Built This Program",
            content: [
                "Industry-focused, not academic",
                "Designed for real-world blockchain engineering",
                "Learning through building, not theory",
                "Outcome-driven curriculum"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "What Makes This Program Different",
            content: [
                "16-week structured cohort model",
                "Hands-on labs every week",
                "Real tools used in production",
                "Continuous evaluation (not final exams)"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Program Structure (Big Picture)",
            subtitle: "16-Week Program Structure",
            content: [
                "Weeks 1–4: Foundations",
                "Weeks 5–8: Smart Contracts & DApps",
                "Weeks 9–12: Advanced Blockchain Engineering",
                "Weeks 13–16: Capstone Project & Career Readiness"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Weekly Learning Flow",
            subtitle: "How Each Week Works",
            content: [
                "Concept lecture (deep understanding)",
                "Live lab / workshop (hands-on)",
                "Weekly deliverable submission",
                "Mentor feedback & reviews"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Evaluation Model",
            subtitle: "How You Are Evaluated",
            content: [
                "Weekly quizzes & labs — 40%",
                "Mid-program project — 20%",
                "Final capstone project — 40%",
                "Progress is measured continuously"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Tools You Will Use",
            subtitle: "Industry Tools You’ll Work With",
            content: [
                "Git & GitHub",
                "Remix, Hardhat, Foundry",
                "Ethereum testnets",
                "Smart contract testing & security tools",
                "(Introduced gradually)"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Learner Expectations",
            subtitle: "What Is Expected From You",
            content: [
                "Consistent participation",
                "Weekly lab submissions",
                "Active problem-solving",
                "Practice beyond sessions"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Program Outcomes",
            subtitle: "By the End of This Program",
            content: [
                "Build and deploy smart contracts",
                "Develop production-ready DApps",
                "Understand blockchain systems deeply",
                "Create a strong public portfolio"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "What Comes Next",
            subtitle: "Next Video",
            content: [
                "Why blockchain was needed",
                "Problems with centralized systems",
                "Evolution of blockchain technology"
            ]
        }
    }
];

// Lecture 1 Data (Why Blockchain?)
const lecture1 = [
    {
        type: 'title',
        props: {
            title: "Web3 Blockchain Engineering",
            subtitle: "Module 1: Foundations",
            tagline: "What Problem Did Blockchain Actually Solve? — Understanding the “Why” Before the Technology",
            presenter: "P. S. Bharath Kumar Achari"
        }
    },
    {
        type: 'content',
        props: {
            title: "How Systems Worked Before Blockchain",
            subtitle: "Traditional Digital Systems",
            content: [
                "Centralized databases",
                "Single organization controls data",
                "Users must trust the authority"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Real-World Examples",
            subtitle: "Examples of Centralized Systems",
            content: [
                "Banks control financial records",
                "Governments control registries",
                "Tech platforms control user data"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "The Core Assumption",
            subtitle: "The Hidden Assumption",
            content: [
                "The central authority is honest",
                "The system is always available",
                "Data will not be altered unfairly"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "The Real Problems",
            subtitle: "Problems with Centralized Systems",
            content: [
                "Single point of failure",
                "Data manipulation risk",
                "Censorship & access control",
                "Trust depends on intermediaries"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Trust Is the Real Bottleneck",
            subtitle: "The Core Issue",
            content: [
                "Systems require blind trust",
                "Verification is not transparent",
                "Users cannot independently confirm truth"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "What If Trust Was Removed?",
            subtitle: "Key Question",
            content: [
                "What if systems didn’t require trust?",
                "What if users could verify data themselves?",
                "What if no single entity controlled records?"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "The Breakthrough Idea",
            subtitle: "Blockchain’s Core Idea",
            content: [
                "Shared ledger instead of central database",
                "Everyone sees the same data",
                "Changes are publicly verifiable"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "What Blockchain Solves",
            subtitle: "Problems Blockchain Addresses",
            content: [
                "Removes single point of failure",
                "Reduces dependency on intermediaries",
                "Enables trust through verification",
                "Improves transparency and integrity"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "What Blockchain Does NOT Solve",
            subtitle: "Important Reality Check",
            content: [
                "Blockchain does not fix bad logic",
                "Blockchain does not remove responsibility",
                "Blockchain is not needed everywhere"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "Why This Matters for Engineers",
            subtitle: "Why You Must Understand This",
            content: [
                "Blockchain is a system design choice",
                "Not every problem needs blockchain",
                "Engineers must justify its use"
            ]
        }
    },
    {
        type: 'content',
        props: {
            title: "What Comes Next",
            subtitle: "Next Video",
            content: [
                "Evolution of blockchain systems",
                "Bitcoin → Ethereum → Web3",
                "How blockchain technology matured"
            ]
        }
    }
];

export const lectures = [
    { id: 'lecture-0', title: 'Lecture 0: Introduction', slides: lecture0 },
    { id: 'lecture-1', title: 'Lecture 1: Why Blockchain?', slides: lecture1 }
];

// Default export
export const presentationData = lecture1;

import { GridIcon, ShieldIcon, UserIcon } from "./LandingIcons";

export const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
];

export const featureItems = [
    {
        title: "Single Sign-On",
        copy: "Use one account to access connected PUPT services.",
        icon: ShieldIcon,
    },
    {
        title: "Integrated Systems",
        copy: "Find academic, administrative, and campus tools in one organized portal.",
        icon: GridIcon,
    },
    {
        title: "User Friendly",
        copy: "A cleaner starting point for students, faculty, and staff.",
        icon: UserIcon,
    },
];

export const faqItems = [
    {
        question: "What is the PUP Taguig One Portal?",
        answer: "It is a single access point for all connected PUP Taguig academic, administrative, and campus services.",
    },
    {
        question: "How do I sign in to the portal?",
        answer: "Click Login and use your PUP Taguig account credentials. If you are not registered yet, click Register first to create your account.",
    },
    {
        question: "What services can I access?",
        answer: "You can access the connected services available to you, including announcements, campus resources, and supported portal features.",
    },
    {
        question: "Who can use One Portal?",
        answer: "Students, faculty, staff, alumni, and external users can access One Portal when they have a valid registered account.",
    },
];